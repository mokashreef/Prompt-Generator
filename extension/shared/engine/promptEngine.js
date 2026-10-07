/**
 * Prompt Generator - Next-Generation Modular Prompt Engine
 * Constructs bespoke, intent-driven prompt structures.
 * Zero generic templates, zero buzzwords, zero repetitive boilerplate.
 */

import { intentDetector } from "./intentDetector.js";
import { qualityEvaluator } from "./qualityEvaluator.js";

export const promptEngine = {
  /**
   * Main entrypoint to assemble an intelligent prompt
   * @param {Object} params
   * @param {Object} params.profile - Task profile object from taskProfiles.js
   * @param {Object} params.fields - Key-value pair of user inputs
   * @param {string} params.intentId - Detected or user-selected intent ID
   * @param {string} params.style - 'simple' | 'professional' | 'detailed'
   * @param {string} params.targetLang - 'auto' | 'ar' | 'en'
   * @param {string} params.uiLang - Current UI language ('ar' | 'en')
   * @returns {{ prompt: string, intent: Object, quality: Object, wordCount: number, charCount: number, approxTokens: number }}
   */
  generate({ profile, fields = {}, intentId = null, style = "professional", targetLang = "auto", uiLang = "ar" }) {
    // 1. Detect effective intent if not explicitly locked
    const primaryInput = this._getPrimaryInput(fields);
    const detected = intentDetector.detect(primaryInput);
    const effectiveIntentId = intentId || profile.defaultIntent || detected.id;
    const intentObj = intentDetector.getIntent(effectiveIntentId);

    // 2. Resolve target output language (Arabic or English)
    const effectiveLang = this._resolveLanguage(targetLang, primaryInput, uiLang);
    const isAr = effectiveLang === "ar";

    // 3. Assemble dynamic prompt based on profile + intent + style
    let promptText = "";

    if (profile.id === "image") {
      promptText = this._buildImagePrompt({ fields, style, isAr });
    } else if (profile.id === "video") {
      promptText = this._buildVideoPrompt({ fields, style, isAr });
    } else if (profile.id === "coding") {
      promptText = this._buildCodingPrompt({ fields, intentObj, style, isAr });
    } else if (profile.id === "research") {
      promptText = this._buildResearchPrompt({ fields, intentObj, style, isAr });
    } else if (profile.id === "writing") {
      promptText = this._buildWritingPrompt({ fields, intentObj, style, isAr });
    } else if (profile.id === "marketing") {
      promptText = this._buildMarketingPrompt({ fields, intentObj, style, isAr });
    } else if (profile.id === "analysis") {
      promptText = this._buildAnalysisPrompt({ fields, intentObj, style, isAr });
    } else if (profile.id === "learning") {
      promptText = this._buildLearningPrompt({ fields, intentObj, style, isAr });
    } else if (profile.id === "business") {
      promptText = this._buildBusinessPrompt({ fields, intentObj, style, isAr });
    } else {
      // General Adaptive Profile (morphs by detected intent!)
      promptText = this._buildGeneralAdaptivePrompt({ fields, intentObj, style, isAr });
    }

    promptText = promptText.trim();

    // 4. Evaluate quality score
    const quality = qualityEvaluator.evaluate({
      typeId: profile.id,
      fields,
      promptText
    });

    const wordCount = this._countWords(promptText);
    const charCount = promptText.length;
    const approxTokens = isAr ? Math.round(charCount / 2.6) : Math.round(charCount / 4);

    return {
      prompt: promptText,
      intent: intentObj,
      quality,
      wordCount,
      charCount,
      approxTokens
    };
  },

  /**
   * General Adaptive Prompt Assembler
   * Structure morphs dynamically based on intent!
   */
  _buildGeneralAdaptivePrompt({ fields, intentObj, style, isAr }) {
    const goal = fields.goal || "";
    const context = fields.context || "";
    const desiredResult = fields.desired_result || "";
    const constraints = fields.constraints || "";
    const audience = fields.target_audience || "";

    const intentId = intentObj.id;
    const sections = [];

    // --- Intent: TEACH / LEARN ---
    if (intentId === "teach") {
      if (style === "simple") {
        return isAr
          ? `اشرح لي موضوع: ${goal} بأسلوب مبسط خطوة بخطوة مع أمثلة عملية.${audience ? ` الجمهور المستهدف: ${audience}.` : ""}`
          : `Explain ${goal} step-by-step from first principles using intuitive real-world analogies.${audience ? ` Target audience: ${audience}.` : ""}`;
      }

      sections.push(isAr ? `## الهدف التعليمي:\n${goal}` : `## Learning Objective:\n${goal}`);
      if (context) sections.push(isAr ? `## الخلفية والمستوى الحالي:\n${context}` : `## Current Background & Level:\n${context}`);

      sections.push(
        isAr
          ? `## آلية الشرح المطلوبة:\n1. ابدأ بالمبادئ الأساسية الأولى (First Principles) دون افتراض معرفة مسبقة معقدة.\n2. قدم تشبيهاً ملموساً من الحياة اليومية لترسيخ النموذج الذهني.\n3. قسم الموضوع إلى مفاهيم تدريجية مترابطة.\n4. اختتم بأسئلة تفاعلية وتمرين عملي لاختبار الاستيعاب.`
          : `## Pedagogical Requirements:\n1. Deconstruct the concept using first principles without unnecessary academic jargon.\n2. Provide an intuitive real-world analogy to ground the mental model.\n3. Break down the progression into sequential, digestible sub-concepts.\n4. Include 2-3 active recall questions and a practical exercise to test comprehension.`
      );

      if (constraints) sections.push(isAr ? `## محددات:\n- ${constraints}` : `## Constraints:\n- ${constraints}`);
      return sections.join("\n\n");
    }

    // --- Intent: ANALYZE / EVALUATE ---
    if (intentId === "analyze" || intentId === "evaluate") {
      if (style === "simple") {
        return isAr
          ? `حلل الموضوع التالي بدقة واذكر أهم النتائج والمخاطر والتوصيات:\n${goal}`
          : `Analyze the following matter rigorously, identifying core drivers, risks, and prioritized recommendations:\n${goal}`;
      }

      sections.push(isAr ? `## مسألة التحليل:\n${goal}` : `## Analysis Focus:\n${goal}`);
      if (context) sections.push(isAr ? `## المعطيات والسياق المتاح:\n${context}` : `## Available Context & Working Data:\n${context}`);

      sections.push(
        isAr
          ? `## محاور التحليل المطلوبة:\n- تشخيص العوامل الجوهرية والأسباب الكامنة.\n- تقييم نقاط القوة والضعف والمخاطر المحتملة.\n- موازنة المفاضلات (Trade-offs).\n- تقديم توصيات عملية قابلة للتنفيذ الفوري مرتبة حسب الأولوية.`
          : `## Analytical Scope:\n- Diagnose primary drivers and underlying root causes.\n- Assess trade-offs, potential failure modes, and risk exposures.\n- Provide a prioritized, actionable recommendation roadmap grounded in the evidence.`
      );

      if (desiredResult) sections.push(isAr ? `## المخرج المستهدف:\n${desiredResult}` : `## Expected Deliverable:\n${desiredResult}`);
      if (constraints) sections.push(isAr ? `## القيود:\n- ${constraints}` : `## Constraints:\n- ${constraints}`);
      return sections.join("\n\n");
    }

    // --- Intent: COMPARE ---
    if (intentId === "compare") {
      if (style === "simple") {
        return isAr
          ? `قارن بين الخيارات التالية واذكر الفروقات الجوهرية ونقاط القوة والضعف ومتى نستخدم كلاً منها:\n${goal}`
          : `Compare the following options objectively, outlining key differences, trade-offs, and when to choose each:\n${goal}`;
      }

      sections.push(isAr ? `## موضوع المقارنة والمفاضلة:\n${goal}` : `## Comparison Scope:\n${goal}`);
      if (context) sections.push(isAr ? `## سياق الاستخدام:\n${context}` : `## Decision Context:\n${context}`);

      sections.push(
        isAr
          ? `## أبعاد المقارنة المطلوبة:\n1. مصفوفة مقارنة واضحة تغطي (الأداء، سهولة الاستخدام، التكلفة، قابلية التوسع، منحنى التعلم).\n2. تحليل نقاط القوة والضعف لكل خيار.\n3. حالات الاستخدام المثالية: متى تختار الخيار الأول ومتى تختار الثاني؟\n4. القرار النهائي وخلاصة التوصية.`
          : `## Evaluation Dimensions:\n1. Structured comparison matrix (covering Performance, Usability, Maintenance, Scalability, and Learning Curve).\n2. Concrete pros and cons for each subject.\n3. Decision criteria: Exact scenarios where Option A wins vs Option B.\n4. Bottom-line verdict and practical recommendation.`
      );

      if (constraints) sections.push(isAr ? `## القيود:\n- ${constraints}` : `## Constraints:\n- ${constraints}`);
      return sections.join("\n\n");
    }

    // --- Intent: SOLVE / DEBUG ---
    if (intentId === "solve") {
      if (style === "simple") {
        return isAr
          ? `عالج المشكلة التالية واشرح سببها وقدم الحل البرمجي أو العملي المباشر:\n${goal}`
          : `Resolve the following issue, diagnose the root cause, and provide the exact working solution:\n${goal}`;
      }

      sections.push(isAr ? `## المشكلة المطلوب حلها:\n${goal}` : `## Problem Statement:\n${goal}`);
      if (context) sections.push(isAr ? `## السياق وتفاصيل الخطأ:\n${context}` : `## Reproduction Context & Current State:\n${context}`);

      sections.push(
        isAr
          ? `## متطلبات الحل:\n1. حدد السبب الجذري للخلل بدقة وتجنب الحلول السطحية.\n2. قدم الحل المصحح والجاهز للتطبيق مباشرة.\n3. وضح كيف نتفادى تكرار هذه المشكلة في المستقبل.`
          : `## Resolution Protocol:\n1. Pinpoint the root cause with precision; avoid superficial workarounds.\n2. Deliver the verified, production-ready solution.\n3. Outline preventative safeguards to avoid regression.`
      );

      if (constraints) sections.push(isAr ? `## المحددات:\n- ${constraints}` : `## Constraints:\n- ${constraints}`);
      return sections.join("\n\n");
    }

    // --- Default / General CREATE / BUILD ---
    if (style === "simple") {
      return isAr
        ? `${goal}${context ? ` مع مراعاة السياق التالي: ${context}` : ""}.${desiredResult ? ` النتيجة المطلوبة: ${desiredResult}.` : ""}${constraints ? ` القيود: ${constraints}.` : ""}`
        : `${goal}${context ? ` considering this context: ${context}` : ""}.${desiredResult ? ` Desired deliverable: ${desiredResult}.` : ""}${constraints ? ` Constraints: ${constraints}.` : ""}`;
    }

    sections.push(isAr ? `## المهمة والهدف الرئيسي:\n${goal}` : `## Objective & Task:\n${goal}`);
    if (context) sections.push(isAr ? `## السياق والمعطيات:\n${context}` : `## Context & Background:\n${context}`);
    if (audience) sections.push(isAr ? `## الجمهور المستهدف:\n${audience}` : `## Target Audience / End-User:\n${audience}`);
    if (desiredResult) sections.push(isAr ? `## النتيجة والمخرجات المتوقعة:\n${desiredResult}` : `## Expected Deliverable:\n${desiredResult}`);

    if (style === "detailed") {
      sections.push(
        isAr
          ? `## إرشادات التنفيذ والجودة:\n- التزم بالدقة والمباشرة، وتجنب الحشو أو العبارات العامة.\n- إذا كانت هناك افتراضات جوهرية غير مصرح بها، اذكرها صراحة قبل البدء.\n- تأكد من أن كل عنصر في المخرج قابل للتطبيق وذو قيمة مباشرة.`
          : `## Execution & Quality Benchmarks:\n- Maintain high specificity; eliminate filler phrases and generic platitudes.\n- Explicitly state any necessary working assumptions before concluding.\n- Ensure every section of the deliverable is directly actionable.`
      );
    }

    if (constraints) sections.push(isAr ? `## القيود والمحددات:\n- ${constraints}` : `## Constraints & Guardrails:\n- ${constraints}`);

    return sections.join("\n\n");
  },

  /**
   * Specialized Coding Prompt
   */
  _buildCodingPrompt({ fields, intentObj, style, isAr }) {
    const objective = fields.task_objective || "";
    const stack = fields.stack || "";
    const currentCode = fields.current_code_state || "";
    const expected = fields.expected_behavior || "";
    const constraints = fields.technical_constraints || "";

    if (style === "simple") {
      return isAr
        ? `اكتب كود ${stack ? `باستخدام ${stack}` : ""} للمهمة التالية: ${objective}.${expected ? ` السلوك المتوقع: ${expected}.` : ""}`
        : `Implement code ${stack ? `using ${stack}` : ""} for the following task: ${objective}.${expected ? ` Expected behavior: ${expected}.` : ""}`;
    }

    const sections = [];
    sections.push(isAr ? `## الهدف البرمجي:\n${objective}` : `## Engineering Objective:\n${objective}`);
    if (stack) sections.push(isAr ? `## بيئة العمل والتقنيات:\n${stack}` : `## Tech Stack & Environment:\n${stack}`);

    if (currentCode.trim()) {
      const langHint = (stack.split(",")[0] || "typescript").toLowerCase().trim().replace(/[^a-z0-9]/g, "");
      sections.push(
        isAr
          ? `## الكود الحالي / رسالة الخطأ:\n\`\`\`${langHint}\n${currentCode.trim()}\n\`\`\``
          : `## Existing Code / Error Trace:\n\`\`\`${langHint}\n${currentCode.trim()}\n\`\`\``
      );
    }

    if (expected) {
      sections.push(isAr ? `## السلوك المتوقع وحالات الحدود (Edge Cases):\n${expected}` : `## Expected Behavior & Edge Cases:\n${expected}`);
    }

    const implRules = isAr
      ? `## شروط ومعايير التنفيذ:\n1. اكتب كوداً نظيفاً وقابلاً للتشغيل فوراً مع معالجة الاستثناءات.\n2. التزم بأفضل ممارسات البيئة المحددة (${stack || "Clean Architecture"}).\n3. تجنب الرموز السحرية واحرص على تسميات واضحة وموثقة.\n4. اذكر أي تغييرات في الملفات وخطوات الاختبار والتحقق.`
      : `## Implementation & Code Standards:\n1. Deliver complete, production-grade, executable code with robust error handling.\n2. Follow idiomatic conventions of the specified environment (${stack || "Clean Architecture"}).\n3. Avoid magic numbers; use clear variable naming and strong typing.\n4. Specify file modifications and practical unit/integration testing steps.`;

    sections.push(implRules);

    if (constraints) {
      sections.push(isAr ? `## القيود التقنية الإلزامية:\n- ${constraints}` : `## Architectural Constraints:\n- ${constraints}`);
    }

    return sections.join("\n\n");
  },

  /**
   * Specialized Research Prompt
   */
  _buildResearchPrompt({ fields, intentObj, style, isAr }) {
    const topic = fields.topic || "";
    const scope = fields.scope || "";
    const sources = fields.sources_standard || "";
    const methodology = fields.methodology_depth || "";

    if (style === "simple") {
      return isAr
        ? `قم بإجراء بحث استقصائي منظم وموثق حول: ${topic}.${scope ? ` النطاق: ${scope}.` : ""}`
        : `Conduct a rigorous, evidence-based research synthesis on: ${topic}.${scope ? ` Scope: ${scope}.` : ""}`;
    }

    const sections = [];
    sections.push(isAr ? `## موضوع البحث والتساؤل المركزي:\n${topic}` : `## Central Research Question:\n${topic}`);
    if (scope) sections.push(isAr ? `## نطاق البحث والحدود الزمنية والمكانية:\n${scope}` : `## Investigation Scope & Boundaries:\n${scope}`);
    if (methodology) sections.push(isAr ? `## منهج التحليل وعمق المراجعة:\n${methodology}` : `## Methodological Approach & Depth:\n${methodology}`);

    sections.push(
      isAr
        ? `## معايير البحث والتوثيق:\n- استند إلى دراسات وبيانات موثوقة ومثبتة تجريبياً${sources ? ` (${sources})` : ""}.\n- اعرض وجهات النظر المختلفة وناقش التحيزات ومحدودية الأدلة.\n- قدم إيجازاً تنفيذياً، وخلاصة النتائج، والتوصيات العملية الناتجة.`
        : `## Evidence & Citation Standards:\n- Ground claims in peer-reviewed or verifiable benchmark data${sources ? ` (${sources})` : ""}.\n- Synthesize conflicting perspectives and disclose evidentiary limitations.\n- Structure the output into: Executive Brief, Key Findings, Comparative Evidence, and Actionable Conclusions.`
    );

    return sections.join("\n\n");
  },

  /**
   * Specialized Writing Prompt
   */
  _buildWritingPrompt({ fields, intentObj, style, isAr }) {
    const concept = fields.concept || "";
    const format = fields.format_type || "";
    const readership = fields.readership || "";
    const voice = fields.voice_tone || "";
    const points = fields.narrative_points || "";

    if (style === "simple") {
      return isAr
        ? `اكتب ${format || "مقالاً"} حول: ${concept}.${voice ? ` النبرة: ${voice}.` : ""}${readership ? ` الجمهور: ${readership}.` : ""}`
        : `Write a ${format || "piece"} about: ${concept}.${voice ? ` Tone: ${voice}.` : ""}${readership ? ` Target readers: ${readership}.` : ""}`;
    }

    const sections = [];
    sections.push(isAr ? `## فكرة العمل ونوع المحتوى:\n${concept} (قالب: ${format || "مقال"})` : `## Core Premise & Format:\n${concept} (Format: ${format || "Article"})`);
    if (readership) sections.push(isAr ? `## الجمهور المستهدف:\n${readership}` : `## Target Readership:\n${readership}`);
    if (voice) sections.push(isAr ? `## النبرة والأسلوب السردي:\n${voice}` : `## Voice & Narrative Tone:\n${voice}`);

    if (points) {
      sections.push(isAr ? `## المحاور والأفكار الجوهرية الواجب تغطيتها:\n${points}` : `## Essential Themes & Structural Milestones:\n${points}`);
    }

    sections.push(
      isAr
        ? `## إرشادات البناء الأدبي:\n1. ابدأ بافتتاحية قوية وجذابة تشد القارئ فوراً وتتجنب المقدمات الروتينية.\n2. حافظ على سلاسة الانتقال بين الفقرات وتماسك البناء الفكري.\n3. ادعم الأفكار بأمثلة واقعية ملموسة واختتم بخلاصة ملهمة.`
        : `## Editorial Directives:\n1. Open with a compelling, hook-driven opening that avoids conventional throat-clearing.\n2. Maintain rhythmic transition between arguments and ensure tonal cohesion.\n3. Anchor abstract concepts in tangible illustrations and conclude with an impactful resonance.`
    );

    return sections.join("\n\n");
  },

  /**
   * Specialized Image Prompt (for Midjourney / Flux / SD)
   */
  _buildImagePrompt({ fields, style, isAr }) {
    const subject = fields.subject || "";
    const scene = fields.scene_setting || "";
    const medium = fields.medium_style || "";
    const lighting = fields.lighting_mood || "";
    const optics = fields.camera_optics || "";
    const ar = fields.aspect_ratio || "";
    const negative = fields.negative_prompt || "";

    const visualElements = [subject, scene, medium, lighting, optics].filter(Boolean);
    let promptEngineStr = visualElements.join(", ");

    const flags = [];
    if (ar) flags.push(`--ar ${ar.trim()}`);
    if (medium.toLowerCase().includes("photo") || medium.toLowerCase().includes("cinematic")) {
      flags.push("--v 6.1 --style raw");
    }
    if (negative.trim()) {
      flags.push(`--no ${negative.trim()}`);
    }

    if (flags.length > 0) {
      promptEngineStr += ` ${flags.join(" ")}`;
    }

    if (style === "simple") {
      return promptEngineStr;
    }

    const title = isAr ? "### برومبت التوليد البصري (AI Art Engine Prompt):" : "### AI Image Generation Prompt:";
    const specsTitle = isAr ? "### تفاصيل المعايير البصرية المحددة:" : "### Optical & Aesthetic Specifications:";

    const specs = [
      subject ? `- **Subject:** ${subject}` : null,
      scene ? `- **Scene & Atmosphere:** ${scene}` : null,
      medium ? `- **Artistic Medium:** ${medium}` : null,
      lighting ? `- **Lighting Scheme:** ${lighting}` : null,
      optics ? `- **Lens / Composition:** ${optics}` : null,
      ar ? `- **Aspect Ratio:** ${ar}` : null,
      negative ? `- **Negative Exclusions:** ${negative}` : null
    ].filter(Boolean);

    return `${title}\n\`\`\`text\n${promptEngineStr}\n\`\`\`\n\n${specsTitle}\n${specs.join("\n")}`;
  },

  /**
   * Specialized Video Prompt (for Sora / Runway / Kling)
   */
  _buildVideoPrompt({ fields, style, isAr }) {
    const action = fields.action_character || "";
    const scene = fields.scene_story || "";
    const camera = fields.camera_choreography || "";
    const sound = fields.soundscape || "";

    if (style === "simple") {
      return isAr
        ? `لقطة فيديو سينمائية: ${action}. في مشهد: ${scene}. حركة الكاميرا: ${camera}.${sound ? ` المؤثرات الصوتية: ${sound}.` : ""}`
        : `Cinematic video sequence: ${action}. Environment: ${scene}. Camera motion: ${camera}.${sound ? ` Soundscape: ${sound}.` : ""}`;
    }

    const sections = [];
    sections.push(isAr ? `## برومبت الفيديو السينمائي:` : `## Cinematic Video Prompt Sequence:`);
    sections.push(
      isAr
        ? `**الحركة والشخصيات:** ${action}\n\n**المشهد والأجواء:** ${scene}\n\n**حركة الكاميرا والإيقاع:** ${camera}${sound ? `\n\n**المؤثرات الصوتية:** ${sound}` : ""}`
        : `**Dynamic Action:** ${action}\n\n**Scene Setting:** ${scene}\n\n**Camera Choreography:** ${camera}${sound ? `\n\n**Audio Cue:** ${sound}` : ""}`
    );

    sections.push(
      isAr
        ? `## محددات الإخراج الفيزيائي:\n- الحفاظ على الثبات البصري وتفاصيل الإضاءة طوال المشهد.\n- تجنب التشويه أو التحولات المفاجئة في حركة العناصر والكاميرا.`
        : `## Directorial Motion Directives:\n- Maintain temporal coherence and volumetric lighting consistency across frames.\n- Prevent morphing artifacts; preserve physical momentum and realistic camera inertia.`
    );

    return sections.join("\n\n");
  },

  /**
   * Specialized Marketing Prompt
   */
  _buildMarketingPrompt({ fields, intentObj, style, isAr }) {
    const offer = fields.product_offer || "";
    const persona = fields.target_persona || "";
    const channel = fields.channel || "";
    const hook = fields.core_hook || "";
    const cta = fields.cta || "";

    if (style === "simple") {
      return isAr
        ? `اكتب نصاً إعلانيا مقنعاً لمنتج: ${offer}.${persona ? ` الجمهور: ${persona}.` : ""}${cta ? ` الدعوة لاتخاذ إجراء: ${cta}.` : ""}`
        : `Draft high-converting copy for: ${offer}.${persona ? ` Target audience: ${persona}.` : ""}${cta ? ` CTA: ${cta}.` : ""}`;
    }

    const sections = [];
    sections.push(isAr ? `## العرض التجاري والقيمة الفريدة:\n${offer}` : `## Commercial Offer & Value Proposition:\n${offer}`);
    if (persona) sections.push(isAr ? `## العميل المستهدف ونقاط الألم:\n${persona}` : `## Target Persona & Friction Points:\n${persona}`);
    if (channel) sections.push(isAr ? `## قناة النشر:\n${channel}` : `## Marketing Channel:\n${channel}`);
    if (hook) sections.push(isAr ? `## الزاوية الإعلانية (Hook):\n${hook}` : `## Campaign Angle & Hook:\n${hook}`);

    sections.push(
      isAr
        ? `## متطلبات النص الإعلاني:\n1. صياغة 3 خيارات عناوين رئيسية (Hooks) توقف التمرير فوراً.\n2. التركيز على التحول الملموس والفوائد الشعورية بدلاً من مجرد سرد المواصفات.\n3. معالجة الاعتراضات والمخاوف المسبقة للعميل.\n4. دعوة مباشرة ومحفزة لاتخاذ الإجراء${cta ? ` (${cta})` : ""}.`
        : `## Direct-Response Framework:\n1. Provide 3 scroll-stopping hook variations targeting the core friction point.\n2. Translate features into emotional and tangible transformations.\n3. Preemptively neutralize top customer objections and skepticism.\n4. Deliver an unambiguous, compelling call-to-action${cta ? ` (${cta})` : ""}.`
    );

    return sections.join("\n\n");
  },

  /**
   * Specialized Analysis Prompt
   */
  _buildAnalysisPrompt({ fields, intentObj, style, isAr }) {
    const problem = fields.dataset_problem || "";
    const framework = fields.framework || "";
    const decision = fields.decision_objective || "";
    const variables = fields.key_variables || "";

    if (style === "simple") {
      return isAr
        ? `حلل المسألة التالية واذكر الأسباب والمخاطر والحلول:\n${problem}`
        : `Analyze this challenge and deliver root causes, risks, and actionable recommendations:\n${problem}`;
    }

    const sections = [];
    sections.push(isAr ? `## المشكلة أو البيانات محل التحليل:\n${problem}` : `## Problem Statement & Dataset:\n${problem}`);
    if (framework) sections.push(isAr ? `## إطار التحليل المعتمد:\n${framework}` : `## Analytical Framework:\n${framework}`);
    if (decision) sections.push(isAr ? `## القرار الاستراتيجي المطلوب:\n${decision}` : `## Strategic Decision at Stake:\n${decision}`);
    if (variables) sections.push(isAr ? `## المتغيرات ومعايير التقييم:\n${variables}` : `## Key Variables & Evaluation Criteria:\n${variables}`);

    sections.push(
      isAr
        ? `## هيكل التحليل المطلوب:\n1. تشخيص الأسباب الجذرية (Root Cause Diagnosis).\n2. تقييم المخاطر والمفاضلات (Risk Matrix & Trade-offs).\n3. سيناريوهات التعامل البديلة.\n4. خطة تنفيذية وتوصيات مرتبة حسب العائد والأثر.`
        : `## Required Analytical Breakdown:\n1. Root cause diagnosis backed by logic and evidence.\n2. Downstream risk evaluation and explicit trade-off matrix.\n3. Viable alternative strategic scenarios.\n4. Prioritized, phased remediation roadmap with success indicators.`
    );

    return sections.join("\n\n");
  },

  /**
   * Specialized Learning Prompt
   */
  _buildLearningPrompt({ fields, intentObj, style, isAr }) {
    const topic = fields.topic_skill || "";
    const level = fields.current_proficiency || "";
    const pedagogy = fields.pedagogy || "";
    const practice = fields.practice_focus || "";

    if (style === "simple") {
      return isAr
        ? `علمني ${topic} خطوة بخطوة من الصفر بأسلوب تفاعلي سهل.${level ? ` مستواي الحالي: ${level}.` : ""}`
        : `Teach me ${topic} step-by-step from first principles.${level ? ` My level: ${level}.` : ""}`;
    }

    const sections = [];
    sections.push(isAr ? `## موضوع التعلم والمهارة المستهدفة:\n${topic}` : `## Target Subject & Competency:\n${topic}`);
    if (level) sections.push(isAr ? `## المستوى المعرفي الحالي:\n${level}` : `## Learner Proficiency Level:\n${level}`);
    if (pedagogy) sections.push(isAr ? `## أسلوب التدريس المفضل:\n${pedagogy}` : `## Pedagogical Style:\n${pedagogy}`);

    sections.push(
      isAr
        ? `## خطة التدريس التفاعلية المطلوبة:\n1. تفكيك المفاهيم المعقدة إلى مبادئ أولية بسيطة (أسلوب فاينمان).\n2. ضرب أمثلة وتشبيهات واقعية لتثبيت النماذج الذهنية.\n3. التركيز على جوانب الصعوبة والتطبيق العملي${practice ? ` (${practice})` : ""}.\n4. تقديم تمرين فوري وسؤالين لاختبار الفهم الحقيقي قبل الانتقال للخطوة التالية.`
        : `## Interactive Learning Framework:\n1. Deconstruct the subject using the Feynman technique and first principles.\n2. Ground concepts in intuitive analogies and visual mental models.\n3. Address common misconceptions and practical drills${practice ? ` (${practice})` : ""}.\n4. Conclude with a mini-exercise and comprehension check to verify mastery before advancing.`
    );

    return sections.join("\n\n");
  },

  /**
   * Specialized Business Prompt
   */
  _buildBusinessPrompt({ fields, intentObj, style, isAr }) {
    const challenge = fields.venture_challenge || "";
    const industry = fields.industry_market || "";
    const deliverable = fields.strategic_deliverable || "";
    const kpis = fields.success_kpis || "";

    if (style === "simple") {
      return isAr
        ? `ضع خطة استراتيجية لمشروع: ${challenge} في قطاع ${industry}. المخرج: ${deliverable}.`
        : `Develop a commercial strategy for: ${challenge} in ${industry}. Deliverable: ${deliverable}.`;
    }

    const sections = [];
    sections.push(isAr ? `## التحدي والمشروع التجاري:\n${challenge}` : `## Business Challenge & Venture:\n${challenge}`);
    if (industry) sections.push(isAr ? `## القطاع وسياق السوق:\n${industry}` : `## Industry & Market Dynamics:\n${industry}`);
    if (deliverable) sections.push(isAr ? `## المخرج الاستراتيجي المستهدف:\n${deliverable}` : `## Strategic Deliverable:\n${deliverable}`);

    sections.push(
      isAr
        ? `## معايير الدراسة الاستراتيجية:\n1. تحليل القوى التنافسية وبناء الحصن الاستراتيجي (Defensible Moat).\n2. خطة تنفيذ واقعية محددة بالمعالم والمسؤوليات.\n3. إدارة المخاطر وتوقع الصعوبات التشغيلية.${kpis ? `\n4. ربط الخطة بمؤشرات الأداء المستهدفة (${kpis}).` : ""}`
        : `## Executive Analysis Standards:\n1. Competitive defensibility and moat mechanics.\n2. Actionable phase-by-phase implementation roadmap.\n3. Operational risk mitigation and contingency planning.${kpis ? `\n4. Alignment with core performance benchmarks (${kpis}).` : ""}`
    );

    return sections.join("\n\n");
  },

  _getPrimaryInput(fields) {
    return fields.goal || fields.task_objective || fields.topic || fields.concept || fields.subject || fields.action_character || fields.product_offer || fields.dataset_problem || fields.topic_skill || fields.venture_challenge || "";
  },

  _resolveLanguage(targetLang, text, uiLang) {
    if (targetLang === "en" || targetLang === "ar") return targetLang;
    const arabicRegex = /[\u0600-\u06FF]/;
    if (arabicRegex.test(text)) return "ar";
    return uiLang === "ar" ? "ar" : "en";
  },

  _countWords(str) {
    if (!str || !str.trim()) return 0;
    const clean = str.replace(/[#*`"'\-_>\[\]()]/g, " ").trim();
    return clean.split(/\s+/).filter(Boolean).length;
  }
};
