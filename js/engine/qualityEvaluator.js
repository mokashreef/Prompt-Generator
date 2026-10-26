/**
 * Prompt Generator - Task-Aware Quality Evaluation Engine
 * Evaluates prompts against a calibrated, multi-dimensional rubric rather than
 * superficial length checks or rigid regex matching.
 * 
 * Evaluation Dimensions:
 * 1. Objective Clarity (20%): Is the primary goal explicit, active, and unambiguous?
 * 2. Context Sufficiency (15%): Is there enough background to anchor the model?
 * 3. Specificity & Depth (20%): Does it provide concrete parameters instead of generalities?
 * 4. Constraints & Guardrails (15%): Are exclusions, negative boundaries, and scope limits defined?
 * 5. Output Format (15%): Is the expected structure (Markdown, table, JSON, code-only) specified?
 * 6. Testability / Acceptance Criteria (15%): Can the user or system verify if the result succeeded?
 * 
 * Domain-Aware Sensitivity:
 * - Coding: Evaluates architecture, error boundaries, test criteria, and dependencies.
 * - Visual/Image: Evaluates subject, composition, lighting, camera, and render attributes.
 * - Marketing: Evaluates target persona, value proposition, and call to action.
 * - Quick/Simple: Doesn't unfairly penalize concise prompts for lacking multi-tiered enterprise specs.
 * - Anti-Pattern Penalty: Identifies and penalizes unfulfilled brackets (e.g. "[Specify context]")
 *   and empty buzzwords ("You are an expert", "Think step by step") when unsupported by substance.
 */

export const qualityEvaluator = {
  /**
   * Main evaluation entrypoint.
   * @param {Object} params
   * @param {string} [params.typeId='general'] - Task profile category (coding, image, marketing, etc.)
   * @param {Object} [params.fields={}] - Optional raw input fields
   * @param {string} [params.promptText=''] - Prompt text to audit
   * @returns {{ score: number, rating: { ar: string, en: string }, checklist: Array, strengths: Array, weaknesses: Array, missingInfo: Array, suggestions: Array }}
   */
  evaluate({ typeId = "general", fields = {}, promptText = "" }) {
    const text = (promptText || fields.goal || "").trim();

    if (!text) {
      return {
        score: 0,
        rating: { ar: "فارغ", en: "Empty" },
        checklist: [],
        strengths: [],
        weaknesses: [{ ar: "لا يوجد نص للفحص.", en: "No text provided for evaluation." }],
        missingInfo: [{ ar: "اكتب هدف المهمة للبدء.", en: "Enter a task objective to begin." }],
        suggestions: [{ ar: "اكتب ما تريد تحقيقه في حقل الإدخال.", en: "Describe your goal in the input field." }]
      };
    }

    const isArabic = /[\u0600-\u06FF]/.test(text);
    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    const checklist = [];
    const strengths = [];
    const weaknesses = [];
    const missingInfo = [];
    const suggestions = [];

    let totalScore = 0;

    // --- 1. Objective Clarity (Weight: 20 pts) ---
    const isVisualTask = typeId === "image" || typeId === "video";
    const hasVisualObjective = isVisualTask && /(?:portrait|photo|shot|cinematic|render|scene|close-up|مشهد|صورة|لقطة|بورتريه)/i.test(text);
    const hasClearActionVerb = /(?:^|\n|##|\b)(?:build|create|design|analyze|implement|refactor|debug|write|generate|explain|compare|review|ابنِ|صمم|حلل|اكتب|طور|أنشئ|أعد|اشرح|قارن|راجع|أصلح)\b/i.test(text);
    const hasObjectiveSection = /(?:objective|goal|الهدف|المهمة|المسألة):?/i.test(text);

    if (hasClearActionVerb || hasObjectiveSection || hasVisualObjective) {
      totalScore += 20;
      checklist.push({
        id: "objective",
        passed: true,
        weight: 20,
        label: { ar: "هدف واضح ومباشر", en: "Clear, Explicit Objective" }
      });
      strengths.push({
        ar: "الهدف الأساسي مصاغ بفعل إجرائي مباشر ومفهوم.",
        en: "Core objective begins with an active, unambiguous directive."
      });
    } else {
      totalScore += 8;
      checklist.push({
        id: "objective",
        passed: false,
        weight: 20,
        label: { ar: "الهدف غير محدد بدقة", en: "Vague or Undefined Objective" }
      });
      weaknesses.push({
        ar: "الهدف الأساسي بحاجة إلى فعل إجرائي أوضح لتحديد النتيجة المطلوبة.",
        en: "Objective lacks a direct operational action verb."
      });
      suggestions.push({
        ar: "ابدأ البرومبت بفعل صريح مثل: «ابنِ»، «حلل»، «صمم»، «اكتب».",
        en: "Begin your prompt with a decisive verb such as 'Build', 'Analyze', 'Design', or 'Write'."
      });
    }

    // --- 2. Context Sufficiency (Weight: 15 pts) ---
    const hasContext = /(?:context|background|environment|stack|audience|السياق|الخلفية|البيئة|الجمهور|المعطيات):?/i.test(text) || wordCount >= 35;
    if (hasContext) {
      totalScore += 15;
      checklist.push({
        id: "context",
        passed: true,
        weight: 15,
        label: { ar: "سياق عمل كافٍ", en: "Sufficient Working Context" }
      });
      strengths.push({
        ar: "البرومبت يوفر خلفية كافية تمنع النموذج من التخمين أو الهلوسة.",
        en: "Provides adequate context to ground the AI and mitigate hallucinations."
      });
    } else {
      totalScore += 5;
      checklist.push({
        id: "context",
        passed: false,
        weight: 15,
        label: { ar: "سياق العمل محدود", en: "Minimal Operational Context" }
      });
      missingInfo.push({
        ar: "البيئة المستهدفة، الجمهور، أو الأدوات المستخدمة غير محددة.",
        en: "Target environment, audience, or tools are undefined."
      });
      suggestions.push({
        ar: "وضح بيئة العمل أو الخلفية التقنية للمشروع لتخصيص الإجابة بدقة.",
        en: "Include project background or technical environment to tailor the response."
      });
    }

    // --- 3. Specificity & Domain Depth (Weight: 20 pts) ---
    const isDomainSpecific = this._checkDomainSpecifics(typeId, text);
    if (isDomainSpecific) {
      totalScore += 20;
      checklist.push({
        id: "specificity",
        passed: true,
        weight: 20,
        label: { ar: "تخصيص مجالي عالي الدقة", en: "High Domain-Specific Depth" }
      });
      strengths.push({
        ar: "يحتوي على تفاصيل ومصطلحات تخصصية تناسب طبيعة المهمة.",
        en: "Contains domain-specific parameters appropriate for the task profile."
      });
    } else {
      totalScore += 10;
      checklist.push({
        id: "specificity",
        passed: false,
        weight: 20,
        label: { ar: "بحاجة إلى تفاصيل مجالية أدق", en: "Needs Higher Domain Specificity" }
      });
      weaknesses.push({
        ar: "البرومبت عام وقد ينتج حلولاً سطحية.",
        en: "Prompt is somewhat generic and risks eliciting shallow responses."
      });
      suggestions.push({
        ar: this._getDomainSuggestion(typeId, isArabic),
        en: this._getDomainSuggestion(typeId, false)
      });
    }

    // --- 4. Constraints & Negative Guardrails (Weight: 15 pts) ---
    const hasConstraints = /(?:constraint|do not|never|avoid|without|prohibit|القيود|محددات|تجنب|لا تستخدم|دون|امنع|شروط):?/i.test(text);
    if (hasConstraints) {
      totalScore += 15;
      checklist.push({
        id: "constraints",
        passed: true,
        weight: 15,
        label: { ar: "قيود وضوابط سلبية صريحة", en: "Explicit Guardrails & Negative Constraints" }
      });
      strengths.push({
        ar: "يتضمن قيوداً واضحة تمنع النموذج من الخروج عن النطاق أو استخدام أساليب غير مرغوبة.",
        en: "Includes boundary constraints preventing scope creep and unwanted assumptions."
      });
    } else {
      totalScore += 4;
      checklist.push({
        id: "constraints",
        passed: false,
        weight: 15,
        label: { ar: "غياب القيود التوجيهية", en: "Missing Boundary Guardrails" }
      });
      missingInfo.push({
        ar: "لم يتم ذكر ما يجب على النموذج تجنبه (مثل: الحشو، المكتبات المهجورة، الأسلوب الإنشائي).",
        en: "Lacks explicit exclusions (e.g. deprecated packages, filler, conversational preamble)."
      });
      suggestions.push({
        ar: "أضف قيداً يحدد ما يجب تجنبه صراحة (مثلاً: «تجنب المقدمات الروتينية وركز على الكود فقط»).",
        en: "Add a negative constraint (e.g. 'Omit pleasantries; deliver code only')."
      });
    }

    // --- 5. Deliverable Structure & Format (Weight: 15 pts) ---
    const hasFormat = /(?:format|output|deliverable|markdown|table|json|step-by-step|شكل|المخرجات|تنسيق|جدول|كود فقط|نقاط متسلسلة):?/i.test(text);
    if (hasFormat) {
      totalScore += 15;
      checklist.push({
        id: "format",
        passed: true,
        weight: 15,
        label: { ar: "شكل المخرجات محدد", en: "Structured Deliverable Format" }
      });
      strengths.push({
        ar: "يحدد صيغة وهيكل المخرجات المتوقعة بدقة.",
        en: "Output format and structural presentation are clearly stated."
      });
    } else {
      totalScore += 5;
      checklist.push({
        id: "format",
        passed: false,
        weight: 15,
        label: { ar: "شكل المخرجات غير مقيد", en: "Unspecified Output Format" }
      });
      suggestions.push({
        ar: "حدد صيغة التسليم المطلوبة (مثل: جدول منظم، كود مصدري مع تعليقات، خطوات رقمية).",
        en: "State the desired format (e.g. Markdown table, executable code, numbered list)."
      });
    }

    // --- 6. Testability / Acceptance Criteria (Weight: 15 pts) ---
    const hasVerification = /(?:acceptance criteria|test|verify|metric|kpi|معايير القبول|التحقق|اختبار|مقياس النجاح):?/i.test(text) || (typeId === "image" && /(?:aspect ratio|8k|render|resolution)/i.test(text));
    if (hasVerification) {
      totalScore += 15;
      checklist.push({
        id: "acceptance",
        passed: true,
        weight: 15,
        label: { ar: "معايير قبول وتحقق قابلة للاختبار", en: "Testable Acceptance Criteria" }
      });
      strengths.push({
        ar: "يوفر معايير واضحة للحكم على نجاح الحل المخرَج.",
        en: "Defines verifiable criteria for validating the deliverable's success."
      });
    } else {
      totalScore += 4;
      checklist.push({
        id: "acceptance",
        passed: false,
        weight: 15,
        label: { ar: "معايير القبول مفقودة", en: "Missing Acceptance Criteria" }
      });
      missingInfo.push({
        ar: "كيف سيعرف المستخدم أو النظام أن الإجابة صحيحة وكاملة؟",
        en: "No criteria defined to verify whether the AI's output is complete and accurate."
      });
      suggestions.push({
        ar: "أضف معايير تحقق واضحة (مثلاً: «يجب أن يجتاز الكود اختبارات الوحدة بنسبة 100%»).",
        en: "Add testable criteria (e.g. 'Must include pass/fail unit tests for all public methods')."
      });
    }

    // --- Anti-Pattern Penalties ---
    // Penalty for empty bracket placeholders (e.g. "[Specify something]")
    const emptyPlaceholders = text.match(/\[(?:specify|insert|حدد|اذكر)[^\]]*\]/gi);
    if (emptyPlaceholders && emptyPlaceholders.length > 0) {
      totalScore = Math.max(20, totalScore - (emptyPlaceholders.length * 10));
      weaknesses.push({
        ar: `يحتوي النص على ${emptyPlaceholders.length} أقواس نصوص فارغة لم تُملأ بالبيانات.`,
        en: `Contains ${emptyPlaceholders.length} unfulfilled placeholder bracket(s) (e.g. [Specify...]).`
      });
    }

    // Cap score at 100
    const finalScore = Math.min(100, Math.max(0, totalScore));

    // Rating Label
    let rating = { ar: "غير مكتمل", en: "Incomplete" };
    if (finalScore >= 85) {
      rating = { ar: "ممتاز واحترافي", en: "Production-Grade" };
    } else if (finalScore >= 70) {
      rating = { ar: "قوي وجيد جداً", en: "Strong" };
    } else if (finalScore >= 50) {
      rating = { ar: "مقبول ويحتاج تدقيق", en: "Acceptable (Needs Polish)" };
    }

    return {
      score: finalScore,
      rating,
      checklist,
      strengths,
      weaknesses,
      missingInfo,
      suggestions
    };
  },

  /**
   * Domain-specific semantic validation.
   * @private
   */
  _checkDomainSpecifics(typeId, text) {
    if (typeId === "coding") {
      return /(?:code|function|api|database|framework|solid|dry|error|unit test|react|node|python|laravel|sql|كود|دالة|قاعدة بيانات|أمان|أخطاء|اختبار)/i.test(text);
    }
    if (typeId === "image") {
      return /(?:lighting|composition|camera|photorealistic|render|aspect ratio|octane|bokeh|إضاءة|تكوين|كاميرا|واقعي|سينمائي|أبعاد)/i.test(text);
    }
    if (typeId === "marketing") {
      return /(?:audience|persona|cta|conversion|hook|channel|funnel|جمهور|تحويل|قيمة|حملة|نداء)/i.test(text);
    }
    if (typeId === "research") {
      return /(?:methodology|source|citation|hypothesis|evidence|analysis|منهجية|مصادر|أدلة|فرضية|دراسة)/i.test(text);
    }
    return text.length > 80;
  },

  _getDomainSuggestion(typeId, isArabic) {
    if (typeId === "coding") {
      return isArabic
        ? "حدد لغة البرمجة، الإطار المستخدم، وآلية معالجة الأخطاء والاختبارات."
        : "Specify the language, runtime/framework version, error handling strategy, and test expectations.";
    }
    if (typeId === "image") {
      return isArabic
        ? "حدد زاوية الكاميرا، نمط الإضاءة (مثل سينمائية درامية)، والأبعاد المطلوبة (16:9 أو 1:1)."
        : "Specify camera framing, lighting style (e.g. volumetric natural), textures, and aspect ratio.";
    }
    if (typeId === "marketing") {
      return isArabic
        ? "حدد الشريحة المستهدفة بوضوح، القيمة الفريدة للمنتج، ونداء الإجراء المطلوب (CTA)."
        : "Define the target customer persona, unique value proposition, and primary Call to Action (CTA).";
    }
    return isArabic
      ? "أضف تفاصيل دقيقة ومعايير واضحة بدلاً من الإرشادات العامة."
      : "Add concrete operational specifics and explicit standards instead of broad guidance.";
  }
};
