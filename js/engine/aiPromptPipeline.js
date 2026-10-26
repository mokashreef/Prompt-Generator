/**
 * Prompt Generator - AI-Powered Prompt Engineering Pipeline
 * Core engine transforming user requirements, tasks, and raw prompts into elite,
 * task-specific, production-grade prompt artifacts using real model inference.
 * 
 * Pipeline Phases:
 * 1. Semantic Analysis: Deconstructs the user directive, identifying primary intent,
 *    target AI platform (ChatGPT, Claude, Gemini, DeepSeek, Midjourney), domain constraints,
 *    audience, and explicit exclusions.
 * 2. Meta-Prompt Construction: Synthesizes a tailored meta-prompt for the AI model
 *    calibrated to the selected mode (Quick, Detailed, Professional, Expert, Improve, Alternatives, Evaluate).
 * 3. Model Inference Execution: Dispatches to the active provider via ProviderManager.
 * 4. Post-Processing & Normalization: Strips conversational model preamble/postamble,
 *    preserves code blocks and technical identifiers, computes linguistic and token metrics,
 *    and attaches verified generation provenance metadata.
 */

import { providerManager } from "../ai/ProviderManager.js";
import { qualityEvaluator } from "./qualityEvaluator.js";
import { intentDetector } from "./intentDetector.js";

export const GENERATION_MODES = [
  {
    id: "professional",
    name: { ar: "احترافي ومنظم", en: "Professional (Default)" },
    icon: "💼",
    description: {
      ar: "برومبت متكامل يشمل الدور، السياق، المتطلبات الوظيفية، القيود، ومعايير القبول.",
      en: "Balanced, production-grade prompt with role, context, requirements, guardrails, and deliverables."
    }
  },
  {
    id: "quick",
    name: { ar: "سريع ومباشر", en: "Quick & Concise" },
    icon: "⚡",
    description: {
      ar: "أمر مكثف وعالي الدقة بدون أي حشو للمهام اليومية السريعة.",
      en: "Dense, direct prompt stripped of fluff for everyday immediate tasks."
    }
  },
  {
    id: "detailed",
    name: { ar: "مفصل وشامل", en: "Detailed & Context-Rich" },
    icon: "📋",
    description: {
      ar: "توجيه شامل يغطي المتطلبات المسبقة، خطوات التنفيذ، ومعالجة الحالات الحدية.",
      en: "Deep operational prompt with background prerequisites, methodology, and edge-case handling."
    }
  },
  {
    id: "expert",
    name: { ar: "خبير / مهام معقدة", en: "Expert / Architecture" },
    icon: "🏗️",
    description: {
      ar: "هندسة برومبت متقدمة للأنظمة الكبيرة، البحث المعمق، والأتمتة متعددة المراحل.",
      en: "Advanced systems engineering workflow with architectural trade-offs, security, and verification."
    }
  },
  {
    id: "improve",
    name: { ar: "تطوير برومبت موجود", en: "Improve Existing" },
    icon: "✨",
    description: {
      ar: "تحليل برومبت مكتوب مسبقاً، إصلاح نقاط ضعفه، ورفع دقته دون تغيير نيته الأصلية.",
      en: "Diagnose weaknesses in an existing prompt, eliminate ambiguity, and elevate its precision."
    }
  },
  {
    id: "alternatives",
    name: { ar: "توليد 3 بدائل مختلفة", en: "Generate 3 Alternatives" },
    icon: "🔀",
    description: {
      ar: "إنشاء ثلاثة توجهات مختلفة هندسياً لنفس المهمة لاختيار الأنسب منها.",
      en: "Produce 3 distinct prompt engineering methodologies for the same problem statement."
    }
  },
  {
    id: "evaluate",
    name: { ar: "تقييم جودة البرومبت", en: "Evaluate Prompt Quality" },
    icon: "📊",
    description: {
      ar: "فحص عميق لنقاط القوة والضعف والمعلومات المفقودة مع خطة تحسين عملية.",
      en: "Audit prompt across 6 core quality dimensions with actionable recommendations."
    }
  }
];

export const TARGET_PLATFORMS = [
  { id: "general", name: "General / Universal LLM" },
  { id: "chatgpt", name: "ChatGPT (GPT-4o / GPT-5)" },
  { id: "claude", name: "Claude (Sonnet / Opus)" },
  { id: "gemini", name: "Google Gemini" },
  { id: "deepseek", name: "DeepSeek (V3 / R1)" },
  { id: "midjourney", name: "Midjourney / Flux (Image)" },
  { id: "cursor", name: "Cursor / Copilot (IDE Code)" }
];

export const aiPromptPipeline = {
  /**
   * Main entrypoint for the AI-powered prompt pipeline.
   * @param {Object} params
   * @param {string} params.taskGoal - Core task or raw user prompt
   * @param {string} [params.mode='professional'] - One of GENERATION_MODES
   * @param {string} [params.category='general'] - Task profile ID (coding, marketing, image, etc.)
   * @param {string} [params.targetPlatform='general'] - One of TARGET_PLATFORMS
   * @param {string} [params.targetLang='auto'] - 'auto' | 'ar' | 'en'
   * @param {string} [params.uiLang='ar'] - Current UI language
   * @param {Object} [params.fields={}] - Optional structured fields from category form
   * @param {AbortSignal} [params.signal] - Optional cancellation signal
   * @returns {Promise<Object>}
   */
  async execute({
    taskGoal,
    mode = "professional",
    category = "general",
    targetPlatform = "general",
    targetLang = "auto",
    uiLang = "ar",
    fields = {},
    signal = null
  }) {
    if (!taskGoal || !taskGoal.trim()) {
      throw new Error("Task description or prompt text is required to generate.");
    }

    const cleanGoal = taskGoal.trim();
    const effectiveLang = this._resolveLanguage(targetLang, cleanGoal, uiLang);
    const isArabic = effectiveLang === "ar";
    const detectedIntent = intentDetector.detect(cleanGoal);

    // 1. Build Meta-Prompt System and User Messages
    const { systemMessage, userMessage } = this._constructMessages({
      cleanGoal,
      mode,
      category,
      targetPlatform,
      isArabic,
      effectiveLang,
      fields,
      detectedIntent
    });

    // 2. Dispatch to AI Provider (via resilient ProviderManager)
    const inferenceResult = await providerManager.generateChat(
      [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ],
      {
        mode,
        category,
        targetPlatform,
        targetLang: effectiveLang,
        temperature: mode === "alternatives" ? 0.85 : 0.65,
        maxTokens: mode === "expert" || mode === "alternatives" ? 3500 : 2500,
        signal
      }
    );

    // 3. Post-Process & Clean Output
    const cleanedOutput = this._postProcessContent(inferenceResult.content, mode);

    // 4. Compute Metrics & Quality Evaluation
    const wordCount = this._countWords(cleanedOutput);
    const charCount = cleanedOutput.length;
    const approxTokens = isArabic ? Math.round(charCount / 2.6) : Math.round(charCount / 4);

    const quality = qualityEvaluator.evaluate({
      typeId: category,
      fields: { goal: cleanGoal, ...fields },
      promptText: cleanedOutput
    });

    return {
      id: "gen_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      rawInput: cleanGoal,
      prompt: cleanedOutput,
      mode,
      category,
      targetPlatform,
      targetLang: effectiveLang,
      detectedIntent,
      quality,
      wordCount,
      charCount,
      approxTokens,
      provider: inferenceResult.provider,
      providerName: inferenceResult.providerName,
      model: inferenceResult.model,
      isAiGenerated: inferenceResult.isAiGenerated,
      isFallback: inferenceResult.isFallback,
      warning: inferenceResult.warning || null,
      timestamp: Date.now()
    };
  },

  /**
   * Constructs tailored system and user directives for the AI model.
   * @private
   */
  _constructMessages({
    cleanGoal,
    mode,
    category,
    targetPlatform,
    isArabic,
    effectiveLang,
    fields,
    detectedIntent
  }) {
    let systemMessage = "";
    let userMessage = "";

    const langDirective = isArabic
      ? "OUTPUT LANGUAGE: Output must be in fluent, professional Modern Standard Arabic (الفصحى). IMPORTANT: Technical identifiers, code keywords, URLs, and programming syntax must remain in their original Latin characters."
      : "OUTPUT LANGUAGE: Output must be in crisp, natural, professional English.";

    const platformDirective = targetPlatform !== "general"
      ? `TARGET MODEL ARCHITECTURE: Tailor the prompt specifically for optimal performance on ${targetPlatform.toUpperCase()}. Apply prompting techniques that excel on this platform.`
      : "TARGET MODEL: Universal compatibility across leading LLMs.";

    if (mode === "evaluate") {
      systemMessage = `You are a Principal AI Prompt Architect and Evaluation Specialist.
Your mission is to perform a rigorous, constructive structural evaluation of a prompt.
Evaluate the prompt across these 6 core dimensions:
1. Objective Clarity (Is the goal unambiguous?)
2. Context Sufficiency (Is background enough to avoid hallucination?)
3. Specificity & Depth (Are details concrete rather than vague?)
4. Constraints & Guardrails (Are exclusions and negative boundaries clear?)
5. Deliverable Structure (Is output format explicitly defined?)
6. Testability & Acceptance Criteria (How does the user know the response succeeded?)

Format your evaluation with these clear headings:
## Summary Score (0-100% estimated against a rigorous rubric)
## Core Strengths
## Critical Weaknesses & Missing Information
## Concrete Recommendations for Improvement
## Optimized Version of this Prompt

${langDirective}
Do NOT include conversational chatter like "Sure, here is your review". Begin directly with the review.`;

      userMessage = `Evaluate the following prompt thoroughly:\n\n"""\n${cleanGoal}\n"""`;
      return { systemMessage, userMessage };
    }

    if (mode === "alternatives") {
      systemMessage = `You are an elite Prompt Engineering Specialist.
Generate THREE distinctly different, high-performing prompt architectures for the user's task.
Do NOT simply rephrase words. The three versions must represent genuinely different prompting methodologies:

### Alternative 1: Procedural & Directive Approach
(Step-by-step sequential instructions with strict guardrails and direct execution)

### Alternative 2: Domain-Expert Persona & Reasoning Framework
(Grounded in a specialized persona, contextual first principles, and deep analytical reasoning)

### Alternative 3: Constraint-First & Verification-Driven
(Heavy emphasis on acceptance criteria, negative constraints, edge cases, and automated validation)

${langDirective}
${platformDirective}
Do NOT include conversational preambles like "Here are three alternatives". Start directly with ### Alternative 1.`;

      userMessage = `Task Directive: ${cleanGoal}
Category: ${category}
${this._serializeFields(fields)}`;
      return { systemMessage, userMessage };
    }

    if (mode === "improve") {
      systemMessage = `You are an elite AI Prompt Engineering Specialist.
The user will provide an existing, potentially vague, informal, or incomplete prompt.
Your task is to rewrite and upgrade it into a masterclass prompt that produces outstanding results from AI models.

Rules:
1. Preserve the user's core intent faithfully; do not alter their actual goal.
2. Remove conversational filler (e.g. "can you please", "help me to", "write me an essay").
3. Inject appropriate operational context, domain-specific requirements, edge-case guidance, and deliverable format.
4. Add clear negative constraints (what the AI must NOT do).
5. Never insert empty placeholder brackets like "[Insert details here]". If a detail is missing, provide a smart default or instruct the model on how to handle it.
${langDirective}
${platformDirective}
Return ONLY the upgraded prompt ready for immediate copying and use. No introductory text.`;

      userMessage = `Existing Prompt to Improve:\n"""\n${cleanGoal}\n"""\n${this._serializeFields(fields)}`;
      return { systemMessage, userMessage };
    }

    // Generation Modes: quick, detailed, professional, expert
    let modeGuidance = "";
    if (mode === "quick") {
      modeGuidance = `MODE: Quick & Punchy.
Create a high-density, direct prompt. Maximum 2-3 short paragraphs or clean bullet points.
Cut all ceremonial text. Zero fluff. Focus on immediate clarity and exact deliverable.`;
    } else if (mode === "detailed") {
      modeGuidance = `MODE: Detailed & Comprehensive.
Provide a multi-section prompt covering:
- Background & Working Context
- Explicit Functional Requirements
- Step-by-Step Execution Protocol
- Negative Constraints & Boundaries
- Desired Deliverable Structure`;
    } else if (mode === "expert") {
      modeGuidance = `MODE: Expert Systems Engineering.
Provide an advanced prompt engineering artifact for complex, mission-critical tasks. Include:
- Architectural / Strategic Role & Scope
- System Design / Theoretical Guardrails
- Phased Implementation Milestones
- Security, Performance & Scalability Criteria
- Automated Acceptance Tests and Quality Gates`;
    } else {
      // Professional (default)
      modeGuidance = `MODE: Professional Production-Grade.
Provide a clean, beautifully formatted Markdown prompt with:
- Clear Objective & Role
- Working Context & Assumptions
- Specific Task Instructions
- Technical Constraints & Exclusions
- Expected Deliverable & Acceptance Criteria`;
    }

    // Category-specific intelligence
    let categoryGuidance = "";
    if (category === "coding") {
      categoryGuidance = `DOMAIN SPECIFIC: Software Engineering.
Ensure the prompt instructs the model to follow SOLID, DRY, and KISS, write secure and testable code, handle edge cases, specify dependencies, and provide verification steps.`;
    } else if (category === "image") {
      categoryGuidance = `DOMAIN SPECIFIC: Visual / Image Generation.
Format for generative image models (Midjourney, Flux, DALL-E). Focus on subject description, artistic style, lighting, camera angle, composition, textures, aspect ratio, and render parameters.`;
    } else if (category === "marketing") {
      categoryGuidance = `DOMAIN SPECIFIC: Marketing & Copywriting.
Focus on target customer persona, value proposition, emotional hook, conversion goal, brand voice, and clear call-to-action (CTA).`;
    } else if (category === "research") {
      categoryGuidance = `DOMAIN SPECIFIC: Research & Analysis.
Focus on methodology, source credibility, analytical frameworks, counterarguments, synthesis, and evidence-backed conclusions.`;
    }

    systemMessage = `You are the World's Premier AI Prompt Engineer.
Your sole mission is to write an exceptionally high-performing, task-specific prompt for an AI assistant.
${modeGuidance}
${categoryGuidance}
${platformDirective}
${langDirective}

CRITICAL RULES:
1. NEVER output generic boilerplate phrases like "You are an expert. Think step by step. Provide a detailed answer."
2. NEVER insert empty placeholder brackets like "[Specify your database]" or "[Insert audience]". Make the prompt concrete and self-contained based on the user's inputs.
3. Deliver the final prompt in clean, structured Markdown, immediately usable by a user.
4. Output ONLY the generated prompt. Do NOT include opening or closing conversation (e.g. "Here is your prompt", "Hope this helps").`;

    userMessage = `Task Directive: ${cleanGoal}
Category: ${category}
${this._serializeFields(fields)}`;

    return { systemMessage, userMessage };
  },

  /**
   * Serializes additional form fields into context string.
   * @private
   */
  _serializeFields(fields = {}) {
    const keys = Object.keys(fields).filter((k) => k !== "goal" && fields[k] && fields[k].trim());
    if (keys.length === 0) return "";

    const lines = ["Additional Context & Directives provided by user:"];
    for (const k of keys) {
      const cleanKey = k.replace(/_/g, " ").toUpperCase();
      lines.push(`- ${cleanKey}: ${fields[k].trim()}`);
    }
    return lines.join("\n");
  },

  /**
   * Cleans AI outputs from meta-conversational text.
   * @private
   */
  _postProcessContent(content, mode) {
    if (!content) return "";

    let text = content.trim();

    // Remove opening conversational greeting if present
    text = text.replace(/^(here is (your|the) (optimized|generated|improved)?\s*prompt:?\s*)/i, "");
    text = text.replace(/^(certainly!|sure thing!|here you go:?)\s*/i, "");
    text = text.replace(/^(تفضل البرومبت المطلوب:?|إليك البرومبت المطور:?)\s*/i, "");

    // Remove closing conversation if present at the very end
    text = text.replace(/\n\n(hope this helps!|let me know if you need anything else|good luck!).*$/i, "");
    text = text.replace(/\n\n(أتمنى أن يساعدك هذا البرومبت|أخبرني إذا كنت بحاجة لتعديل).*$/i, "");

    // If model wrapped entire output in markdown code fences ```markdown ... ```, unwrap it for clean rendering
    if (/^```(?:markdown|text)?\n([\s\S]*?)\n```$/i.test(text)) {
      const match = text.match(/^```(?:markdown|text)?\n([\s\S]*?)\n```$/i);
      if (match && match[1]) {
        text = match[1].trim();
      }
    }

    return text.trim();
  },

  /**
   * Resolves target language between auto, ar, en, and input detection.
   * @private
   */
  _resolveLanguage(targetLang, input, uiLang) {
    if (targetLang === "ar" || targetLang === "en") return targetLang;

    // Auto mode: check input first
    const hasArabicChars = /[\u0600-\u06FF]/.test(input);
    if (hasArabicChars) return "ar";

    // If input is purely Latin, check UI language or default to English
    return uiLang === "ar" ? "ar" : "en";
  },

  /**
   * Words counter with accurate unicode and Arabic support.
   * @private
   */
  _countWords(str) {
    if (!str) return 0;
    return str.trim().split(/\s+/).filter(Boolean).length;
  }
};
