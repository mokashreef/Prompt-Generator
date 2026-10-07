/**
 * Prompt Generator - Action Transformer Engine
 * Provides 11 specialized, deterministic transformations for prompt enhancement.
 * 100% Client-Side. Zero external AI API, zero hallucinated facts.
 */

import { intentDetector } from "./intentDetector.js";
import { qualityEvaluator } from "./qualityEvaluator.js";

export const PROMPT_ACTIONS = [
  { id: "improve", name: { ar: "تحسين شامل", en: "Improve Prompt" }, icon: "⚡" },
  { id: "rewrite", name: { ar: "إعادة صياغة", en: "Rewrite Prompt" }, icon: "🔄" },
  { id: "specific", name: { ar: "أكثر تحديداً", en: "Make Specific" }, icon: "🎯" },
  { id: "detailed", name: { ar: "مفصل وشامل", en: "Make Detailed" }, icon: "📋" },
  { id: "concise", name: { ar: "اختصار وإيجاز", en: "Make Concise" }, icon: "✂️" },
  { id: "structure", name: { ar: "إصلاح الهيكل", en: "Fix Structure" }, icon: "🧱" },
  { id: "constraints", name: { ar: "إضافة قيود", en: "Add Constraints" }, icon: "🛡️" },
  { id: "format", name: { ar: "صيغة المخرجات", en: "Output Format" }, icon: "📊" },
  { id: "professional", name: { ar: "جعله احترافياً", en: "Professional" }, icon: "👔" },
  { id: "simplify", name: { ar: "تبسيط الأسلوب", en: "Simplify" }, icon: "💡" },
  { id: "translate", name: { ar: "ترجمة البرومبت", en: "Translate" }, icon: "🌐" }
];

export const actionTransformer = {
  /**
   * Transforms raw prompt text based on the selected action
   * @param {string} text - Raw input prompt
   * @param {string} actionId - One of the 11 action IDs
   * @param {string} targetLang - 'auto' | 'ar' | 'en'
   * @returns {{ original: string, improved: string, actionId: string, intent: Object, quality: Object }}
   */
  transform(text, actionId = "improve", targetLang = "auto") {
    if (!text || !text.trim()) {
      return {
        original: "",
        improved: "",
        actionId,
        intent: intentDetector.detect(""),
        quality: { score: 0, rating: { ar: "فارغ", en: "Empty" } }
      };
    }

    const cleanInput = text.trim();
    const isArabic = this._detectArabic(cleanInput, targetLang);
    const intent = intentDetector.detect(cleanInput);

    let result = "";

    switch (actionId) {
      case "rewrite":
        result = this._actionRewrite(cleanInput, isArabic, intent);
        break;
      case "specific":
        result = this._actionMakeSpecific(cleanInput, isArabic, intent);
        break;
      case "detailed":
        result = this._actionMakeDetailed(cleanInput, isArabic, intent);
        break;
      case "concise":
        result = this._actionMakeConcise(cleanInput, isArabic);
        break;
      case "structure":
        result = this._actionFixStructure(cleanInput, isArabic, intent);
        break;
      case "constraints":
        result = this._actionAddConstraints(cleanInput, isArabic, intent);
        break;
      case "format":
        result = this._actionImproveFormat(cleanInput, isArabic, intent);
        break;
      case "professional":
        result = this._actionMakeProfessional(cleanInput, isArabic, intent);
        break;
      case "simplify":
        result = this._actionSimplify(cleanInput, isArabic, intent);
        break;
      case "translate":
        result = this._actionTranslate(cleanInput, isArabic);
        break;
      case "improve":
      default:
        result = this._actionImproveComprehensive(cleanInput, isArabic, intent);
        break;
    }

    const quality = qualityEvaluator.evaluate({
      typeId: "general",
      fields: { goal: result },
      promptText: result
    });

    return {
      original: cleanInput,
      improved: result.trim(),
      actionId,
      intent,
      quality
    };
  },

  /**
   * 1. Comprehensive Improve: Adds missing elements with explicit placeholders, no false data
   */
  _actionImproveComprehensive(text, isAr, intent) {
    const lines = [];

    // Objective
    lines.push(isAr ? `## الهدف الأساسي:\n${text}` : `## Core Objective:\n${text}`);

    // Context & Placeholders
    if (isAr) {
      lines.push(`## سياق العمل والمتطلبات:\n- المعطيات المتاحة: [اذكر أي تفاصيل إضافية أو اترك الافتراضي]\n- الفئة أو الجمهور المستهدف: [حدد الجمهور أو بيئة العمل]\n- النطاق المطلوب: التزم بالمهمة المحددة دون تشعب.`);
    } else {
      lines.push(`## Operational Context & Prerequisites:\n- Working Context: [Specify project background or target environment]\n- Target Audience / Platform: [Specify target user or system context]\n- Scope: Focus strictly on the defined scope without unrequested divergence.`);
    }

    // Intent-specific guidance
    if (intent.id === "compare") {
      lines.push(isAr
        ? `## معايير المقارنة والمفاضلة:\n- قارن من حيث: الأداء، سهولة الاستخدام، منحنى التعلم، والتكلفة.\n- اذكر حالات الاستخدام الأنسب لكل خيار وقدم خلاصة حاسمة.`
        : `## Comparison Criteria:\n- Contrast based on: Performance, Usability, Maintenance, and Learning Curve.\n- State exact scenarios where each option excels and deliver an objective verdict.`
      );
    } else if (intent.id === "teach") {
      lines.push(isAr
        ? `## أسلوب التدريس:\n- اشرح من المبادئ الأولى (First Principles) باستخدام تشبيه واقعي.\n- اختتم بأسئلة تحقق وتمرين عملي لاختبار الفهم.`
        : `## Pedagogical Guidelines:\n- Explain from first principles with an intuitive real-world analogy.\n- Include 2 comprehension questions and a practical drill.`
      );
    }

    // Constraints & Delivery
    if (isAr) {
      lines.push(`## الضوابط والمخرجات:\n- تجنب الحشو والترحيبات الروتينية؛ ابدأ مباشرة في النتيجة.\n- إذا كانت هناك افتراضات جوهرية، اذكرها بصراحة.\n- شكل المخرجات: [خطوات متسلسلة / كود تطبيقي / جدول منظم / تقرير موجز].`);
    } else {
      lines.push(`## Operational Guardrails & Deliverable:\n- Omit pleasantries and filler; deliver the requested output directly.\n- If assumptions are required, declare them explicitly.\n- Deliverable Format: [Step-by-step roadmap / executable code / comparison table / executive brief].`);
    }

    return lines.join("\n\n");
  },

  /**
   * 2. Rewrite: Preserves exact meaning, elevates phrasing, removes awkward conversational phrasing
   */
  _actionRewrite(text, isAr, intent) {
    // Clean common colloquial fillers
    let clean = text
      .replace(/^(can you please|could you|please|i want you to|help me to|write me|tell me)\s+/i, "")
      .replace(/^(ممكن|لو سمحت|بالله عليك|أريدك أن|أبي|ابغى|ساعدني في|اكتب لي)\s+/i, "")
      .trim();

    clean = clean.charAt(0).toUpperCase() + clean.slice(1);

    if (isAr) {
      return `قم بتنفيذ المهمة التالية بوضوح ودقة عالية:\n${clean}\n\nاحرص على تنظيم الأفكار منطقياً، والاعتماد على حقائق مثبتة، وتقديم إجابة متماسكة ومباشرة تلبي الغرض دون إطالة.`;
    } else {
      return `Execute the following directive with high precision and structural clarity:\n${clean}\n\nEnsure a logical progression of ideas, eliminate conversational padding, and deliver a coherent response grounded in verified facts.`;
    }
  },

  /**
   * 3. Make Specific: Injects parameters, metrics, acceptance criteria
   */
  _actionMakeSpecific(text, isAr, intent) {
    const lines = [];
    lines.push(isAr ? `## المهمة المحددة بدقة:\n${text}` : `## Precise Specification:\n${text}`);

    if (isAr) {
      lines.push(`## معايير التخصيص والمقاييس:\n- المعايير الكمية: [حدد المقاييس أو الأرقام أو حجم المخرجات]\n- البيئة المستهدفة: [حدد الإصدار أو المنصة أو اللغة]\n- معايير القبول والنجاح: يجب أن تكون النتيجة كاملة ومحققة للغرض دون الحاجة لتعديل يدوي.`);
    } else {
      lines.push(`## Granular Specifications & Acceptance Criteria:\n- Target Dimensions: [Specify scope, volume, or target scale]\n- Environment / Platform: [Specify target version, runtime, or audience]\n- Acceptance Criteria: Deliverable must be complete, testable, and immediately actionable without ambiguity.`);
    }

    return lines.join("\n\n");
  },

  /**
   * 4. Make Detailed: Comprehensive system prompt with edge cases
   */
  _actionMakeDetailed(text, isAr, intent) {
    const lines = [];
    lines.push(isAr ? `## التوجيه الشامل والمفصل:\n${text}` : `## Exhaustive Operating Directive:\n${text}`);

    if (isAr) {
      lines.push(`## سياق العمل والبيانات الأولية:\n- المعطيات الأساسية: [اذكر كافة الحقائق والبيانات المتاحة]\n- حدود النطاق: ركز فقط على المتطلبات المذكورة.`);
      lines.push(`## منهجية التنفيذ:\n1. حلل المتطلبات وحدد نقاط القرار الحرجة.\n2. راعِ معالجة حالات الحدود والاستثناءات (Edge Cases).\n3. قدم خطوات تطبيقية مدعومة بالأسباب والمنطق.`);
      lines.push(`## معايير التحقق قبل الإخراج:\n- راجع الحل داخلياً للتأكد من خلوه من التناقضات والتخمين.\n- قدم المخرج في تنسيق منظم مع إبراز النتائج الجوهرية.`);
    } else {
      lines.push(`## Working Context & Input Data:\n- Baseline Context: [Provide background data or constraints]\n- Boundary Limits: Adhere strictly to the defined problem boundaries.`);
      lines.push(`## Execution Methodology:\n1. Deconstruct the requirements and map critical decision branches.\n2. Account for boundary conditions, trade-offs, and edge cases.\n3. Provide step-by-step actionable reasoning with implementation notes.`);
      lines.push(`## Pre-Flight Verification & Output Standards:\n- Audit your response internally for factual consistency prior to output.\n- Deliver the output in well-structured Markdown with clear headings.`);
    }

    return lines.join("\n\n");
  },

  /**
   * 5. Make Concise: Strips all filler, polite preamble, leaves punchy command
   */
  _actionMakeConcise(text, isAr) {
    let clean = text
      .replace(/^(can you please|could you|please|i need you to|write an article about|i want to|kindly)\s+/i, "")
      .replace(/^(لو سمحت|ممكن|أريد منك أن|ساعدني في|اكتب لي مقال عن|ابغى)\s+/i, "")
      .trim();

    if (isAr) {
      return `${clean}. المطلوب: إجابة مباشرة ومكثفة تركز على الحقائق والحل دون أي مقدمات أو حشو.`;
    } else {
      return `${clean}. Requirement: Direct, dense output with zero preamble or filler.`;
    }
  },

  /**
   * 6. Fix Structure: Re-organizes text into structured logical markdown sections
   */
  _actionFixStructure(text, isAr, intent) {
    const lines = [];
    if (isAr) {
      lines.push(`### 1. الهدف الرئيسي (Objective):\n${text}`);
      lines.push(`### 2. المتطلبات التنفيذية (Requirements):\n- تفصيل المتطلب الأول: [حدد المتطلب الأول]\n- تفصيل المتطلب الثاني: [حدد المتطلب الثاني]`);
      lines.push(`### 3. القيود والمحددات (Constraints):\n- التزام بالموضوع دون تشعب.\n- تجنب التخمين والافتراضات غير المبررة.`);
      lines.push(`### 4. شكل المخرجات (Expected Output):\n- تنظيم المخرجات في فقرات أو نقاط محددة واضحة.`);
    } else {
      lines.push(`### 1. Objective:\n${text}`);
      lines.push(`### 2. Requirements & Scope:\n- Primary requirement: [Specify key requirement]\n- Secondary requirement: [Specify technical/editorial nuances]`);
      lines.push(`### 3. Constraints & Boundaries:\n- Remain focused on the stated topic.\n- Do not speculate or introduce unverified assumptions.`);
      lines.push(`### 4. Expected Deliverable:\n- Deliver in structured sections with clean headings and bulleted action items.`);
    }
    return lines.join("\n\n");
  },

  /**
   * 7. Add Constraints: Focuses heavily on boundaries and anti-hallucination
   */
  _actionAddConstraints(text, isAr, intent) {
    const lines = [];
    lines.push(isAr ? `## المهمة المطلوبة:\n${text}` : `## Mandated Task:\n${text}`);

    if (isAr) {
      lines.push(`## القيود والضوابط الصارمة:\n1. لا تخمن حقائق غير مؤكدة؛ إذا كانت هناك معلومات ناقصة، اذكر الافتراضات صراحة.\n2. تجنب المقدمات والتحيات الروتينية والعبارات الإنشائية.\n3. التزم بالحقائق الدقيقة والمراجع المعتمدة.\n4. لا تتجاوز حدود النطاق المحدد للمهمة.`);
    } else {
      lines.push(`## Explicit Guardrails & Negative Constraints:\n1. Anti-Hallucination: Do not invent facts or extrapolate without evidence. State any necessary assumptions explicitly.\n2. Zero Fluff: Omit conversational preamble, pleasantries, and generic platitudes.\n3. Boundary Limits: Adhere strictly to the requested scope.\n4. Quality Benchmark: Ensure every recommendation or code line is verifiable.`);
    }

    return lines.join("\n\n");
  },

  /**
   * 8. Improve Output Format: Directs specific deliverable structure
   */
  _actionImproveFormat(text, isAr, intent) {
    const lines = [];
    lines.push(isAr ? `## محتوى التوجيه:\n${text}` : `## Prompt Directive:\n${text}`);

    if (isAr) {
      lines.push(`## مواصفات التنسيق والمخرجات الإلزامية:\n- اعرض الإجابة بتنسيق Markdown متقن ومنظم.\n- استخدم جداول المقارنة لتوضيح الفروقات إن وجدت.\n- نسق أي كود برمجي داخل كتل برمجية محددة النوع (\`\`\`language).\n- اختتم بملخص تنفيذي أو قائمة مهام عملية مرقمة.`);
    } else {
      lines.push(`## Mandatory Output Formatting Specification:\n- Deliver the response in pristine, semantic Markdown with clear hierarchical headings.\n- Utilize comparative tables for trade-offs or multidimensional parameters.\n- Wrap any code snippets in properly tagged syntax fences (\`\`\`language).\n- Conclude with a prioritized action checklist or executive synthesis.`);
    }

    return lines.join("\n\n");
  },

  /**
   * 9. Make Professional: Calibrated for technical/executive rigor
   */
  _actionMakeProfessional(text, isAr, intent) {
    const lines = [];
    if (isAr) {
      lines.push(`## التوجيه المؤسسي:\n${text}`);
      lines.push(`## المعايير المهنية المطلوبة:\n- صياغة رصينة بلغة احترافية واضحة ومباشرة.\n- استناد التوصيات إلى معايير الصناعة وأفضل الممارسات المعتمدة.\n- مراعاة الجدوى التشغيلية وإدارة المخاطر.\n- تجنب التبسيط المخل أو التعقيد غير المبرر.`);
    } else {
      lines.push(`## Professional Executive Directive:\n${text}`);
      lines.push(`## Professional Operating Standards:\n- Maintain objective, analytical prose free of informalities.\n- Align recommendations with industry benchmarks and established design patterns.\n- Account for operational feasibility, risk exposure, and scalability.\n- Ground all reasoning in verifiable principles.`);
    }
    return lines.join("\n\n");
  },

  /**
   * 10. Simplify: Demystifies technical jargon
   */
  _actionSimplify(text, isAr, intent) {
    if (isAr) {
      return `اشرح وبسط الموضوع التالي بأسلوب واضح وممتع خالي من التعقيد:\n${text}\n\nالشروط:\n- استخدم تشبيهات من واقع الحياة اليومية لتوضيح الفكرة.\n- تجنب المصطلحات التخصصية إلا بعد شرحها ببساطة.\n- قسم الإجابة إلى خطوات قصيرة وسهلة المتابعة.`;
    } else {
      return `Explain and deconstruct the following subject in clear, accessible language:\n${text}\n\nGuidelines:\n- Use intuitive real-world analogies to ground the concept.\n- Demystify any technical jargon before using it.\n- Break down the explanation into concise, progressive steps.`;
    }
  },

  /**
   * 11. Translate: Bi-directional Arabic <-> English with prompt engineering preservation
   */
  _actionTranslate(text, isAr) {
    if (isAr) {
      return `Translate the following prompt into natural, highly effective English prompt engineering syntax, preserving all instructional structure and constraints:\n\n"""\n${text}\n"""`;
    } else {
      return `ترجم البرومبت التالي إلى لغة عربية فصحى احترافيّة ودقيقة، مع الحفاظ الكامل على البنية الهندسية للأمر والقيود المحددة دون ترجمة حرفية ركيكة:\n\n"""\n${text}\n"""`;
    }
  },

  _detectArabic(text, targetLang) {
    if (targetLang === "ar") return true;
    if (targetLang === "en") return false;
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
  }
};
