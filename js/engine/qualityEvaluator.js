/**
 * Prompt Generator - Objective Quality Score Evaluator
 * Evaluates prompt quality based on concrete structural parameters.
 * Checks both structured fields and free-form prompt text.
 * 100% Client-side deterministic calculation.
 */

export const qualityEvaluator = {
  /**
   * Evaluates prompt inputs and returns an objective score with actionable criteria
   * @param {Object} params
   * @param {string} [params.typeId] - task profile ID
   * @param {Object} [params.fields] - user field inputs
   * @param {string} [params.promptText] - final generated prompt text
   * @returns {{ score: number, rating: { ar: string, en: string }, checklist: Array, suggestions: Array }}
   */
  evaluate({ typeId = "general", fields = {}, promptText = "" }) {
    const text = (promptText || fields.goal || "").trim();
    const hasStructuredFields = Object.keys(fields).filter((k) => k !== "goal" && fields[k] && fields[k].trim()).length > 0;

    if (hasStructuredFields) {
      return this._evaluateFromFields(fields);
    }

    return this._evaluateFromText(text);
  },

  /**
   * Evaluates prompt quality directly from free-form text
   */
  _evaluateFromText(text) {
    const checklist = [];
    const suggestions = [];
    let score = 0;

    if (!text) {
      return {
        score: 0,
        rating: { ar: "فارغ", en: "Empty" },
        checklist: [],
        suggestions: [{ ar: "اكتب برومبت للبدء.", en: "Enter a prompt to begin." }]
      };
    }

    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // 1. Goal / Task Specificity (25 points)
    const hasActionVerb = /^(write|build|create|design|analyze|explain|develop|generate|research|compare|review|rewrite|teach|fix|اكتب|صمم|ابنِ|حلل|اشرح|طور|ولد|ابحث|قارن|راجع|أعد|علم|أصلح)/i.test(text.trim());
    if (wordCount >= 25 && (hasActionVerb || text.includes("Objective:") || text.includes("الهدف:"))) {
      score += 25;
      checklist.push({
        id: "goal",
        passed: true,
        weight: 25,
        label: { ar: "هدف واضح ومفصل", en: "Specific, Well-Defined Objective" }
      });
    } else if (wordCount >= 6) {
      score += 15;
      checklist.push({
        id: "goal",
        passed: true,
        weight: 25,
        label: { ar: "الهدف محدد ومقبول", en: "Objective is defined" }
      });
    } else {
      score += 5;
      checklist.push({
        id: "goal",
        passed: false,
        weight: 25,
        label: { ar: "الهدف موجز جداً وبحاجة لتفاصيل", en: "Objective is too brief and vague" }
      });
      suggestions.push({
        ar: "وضح الهدف بتفاصيل أكثر بدلاً من جملة عامة قصيرة.",
        en: "Expand on the core goal with specific details."
      });
    }

    // 2. Working Context & Role (20 points)
    const hasRoleOrContext = /(role:|context:|background:|act as|assume you are|you are an expert|بصفتك|الدور:|السياق:|الخلفية:|أنت خبير)/i.test(text);
    if (hasRoleOrContext || wordCount >= 50) {
      score += 20;
      checklist.push({
        id: "context",
        passed: true,
        weight: 20,
        label: { ar: "سياق عملي ودور واضح", en: "Relevant Context & Role" }
      });
    } else {
      checklist.push({
        id: "context",
        passed: false,
        weight: 20,
        label: { ar: "السياق غير كافٍ أو مفقود", en: "Missing Context or Role" }
      });
      suggestions.push({
        ar: "أضف سياقاً عملياً أو حدد دوراً للنموذج (مثلاً: بصفتك مهندس برمجيات).",
        en: "Add contextual background or define a persona/role."
      });
    }

    // 3. Expected Deliverable / Output Format (20 points)
    const hasOutputFormat = /(output format:|format:|deliverable:|expected output:|structure:|table|markdown|bullet points|step-by-step|صيغة المخرجات:|المخرجات:|هيكل الإجابة:|جدول|نقاط|خطوات)/i.test(text);
    if (hasOutputFormat) {
      score += 20;
      checklist.push({
        id: "deliverable",
        passed: true,
        weight: 20,
        label: { ar: "هيكل المخرجات محدد بدقة", en: "Clear Deliverable Specification" }
      });
    } else {
      checklist.push({
        id: "deliverable",
        passed: false,
        weight: 20,
        label: { ar: "شكل النتيجة النهائية غير محدد", en: "Undefined Deliverable Format" }
      });
      suggestions.push({
        ar: "حدد شكل المخرجات المتوقعة (مثل: كود، جدول، أو خطوات مرقمة).",
        en: "Specify the exact desired deliverable format (table, code, steps)."
      });
    }

    // 4. Constraints & Guardrails (20 points)
    const hasConstraints = /(constraints:|requirements:|rules:|avoid|do not|never|must include|قيود:|شروط:|محددات:|تجنب|لا تفعل|يجب أن يتضمن)/i.test(text);
    if (hasConstraints) {
      score += 20;
      checklist.push({
        id: "constraints",
        passed: true,
        weight: 20,
        label: { ar: "شروط وقيود وقائية محددة", en: "Operational Guardrails & Constraints" }
      });
    } else {
      checklist.push({
        id: "constraints",
        passed: false,
        weight: 20,
        label: { ar: "بدون قيود أو محددات صريحة", en: "No Constraints Set" }
      });
      suggestions.push({
        ar: "أضف قيوداً محددة لما يجب تجنبه لضمان دقة الإجابة.",
        en: "Add explicit constraints on what to avoid."
      });
    }

    // 5. Structure & Specificity (15 points)
    const hasStructure = text.includes("\n") && (text.includes(":") || text.includes("-") || text.includes("•") || text.includes("1."));
    const hasPlaceholdersOrParams = text.includes("[") && text.includes("]");
    if (hasStructure || hasPlaceholdersOrParams) {
      score += 15;
      checklist.push({
        id: "structure",
        passed: true,
        weight: 15,
        label: { ar: "هيكلية منظمة ومحددة", en: "Structured Formatting" }
      });
    } else {
      checklist.push({
        id: "structure",
        passed: false,
        weight: 15,
        label: { ar: "نص خطي غير مقسم إلى أقسام", en: "Flat, Unstructured Text" }
      });
      suggestions.push({
        ar: "قسم التعليمات إلى فقرات أو نقاط لسهولة استيعابها.",
        en: "Organize instructions into sections or bullet points."
      });
    }

    // Calculate rating
    let rating = { ar: "أولي وبحاجة لتفاصيل", en: "Needs More Detail" };
    if (score >= 85) {
      rating = { ar: "احترافي وعالي الدقة", en: "Production-Grade" };
    } else if (score >= 65) {
      rating = { ar: "جيد ومنظم", en: "Solid & Usable" };
    } else if (score >= 40) {
      rating = { ar: "متوسط", en: "Acceptable" };
    }

    return {
      score: Math.min(100, Math.max(10, score)),
      rating,
      checklist,
      suggestions: suggestions.slice(0, 3)
    };
  },

  /**
   * Evaluates prompt quality from form fields
   */
  _evaluateFromFields(fields) {
    const checklist = [];
    const suggestions = [];
    let score = 0;

    const primaryGoal = fields.goal || fields.task_objective || fields.topic || fields.concept || fields.subject || fields.action_character || fields.product_offer || fields.dataset_problem || fields.topic_skill || fields.venture_challenge || "";
    const goalLength = primaryGoal.trim().split(/\s+/).filter(Boolean).length;

    if (goalLength >= 6) {
      score += 25;
      checklist.push({ id: "goal", passed: true, weight: 25, label: { ar: "هدف واضح ومفصل", en: "Specific, Well-Defined Objective" } });
    } else if (goalLength >= 2) {
      score += 12;
      checklist.push({ id: "goal", passed: false, weight: 25, label: { ar: "الهدف موجز جداً ويفضل تفصيله", en: "Goal is brief; needs greater specificity" } });
      suggestions.push({ ar: "وضح الهدف بتفاصيل أكثر بدلاً من مجرد جملة قصيرة عامة.", en: "Expand on your core objective with specific details." });
    } else {
      checklist.push({ id: "goal", passed: false, weight: 25, label: { ar: "الهدف غير محدد", en: "Missing core objective" } });
      suggestions.push({ ar: "حدد ما تريد تحقيقه بالتحديد لتحسين جودة البرومبت (+25%).", en: "State what you want to achieve to boost prompt clarity (+25%)." });
    }

    const contextText = fields.context || fields.current_code_state || fields.scope || fields.scene_setting || fields.scene_story || fields.target_persona || fields.industry_market || "";
    if (contextText.trim().length > 15) {
      score += 20;
      checklist.push({ id: "context", passed: true, weight: 20, label: { ar: "سياق ومعطيات كافية", en: "Relevant Context Provided" } });
    } else {
      checklist.push({ id: "context", passed: false, weight: 20, label: { ar: "السياق غير كافٍ أو مفقود", en: "Missing situational context" } });
      suggestions.push({ ar: "أضف معلومات توضيحية أو سياقاً عملياً لمساعدة النموذج (+20%).", en: "Provide working background or context (+20%)." });
    }

    const deliverableText = fields.desired_result || fields.expected_behavior || fields.format_type || fields.strategic_deliverable || fields.cta || "";
    if (deliverableText.trim().length > 0) {
      score += 20;
      checklist.push({ id: "deliverable", passed: true, weight: 20, label: { ar: "هيكل المخرجات محدد بدقة", en: "Clear Deliverable Specification" } });
    } else {
      checklist.push({ id: "deliverable", passed: false, weight: 20, label: { ar: "شكل النتيجة النهائية غير محدد", en: "Undefined deliverable format" } });
      suggestions.push({ ar: "حدد شكل المخرجات المتوقعة (كود، جدول، قائمة) (+20%).", en: "Specify the exact desired deliverable (+20%)." });
    }

    const constraintsText = fields.constraints || fields.technical_constraints || fields.sources_standard || fields.negative_prompt || fields.voice_tone || "";
    if (constraintsText.trim().length > 0) {
      score += 20;
      checklist.push({ id: "constraints", passed: true, weight: 20, label: { ar: "قيود ومحددات وقائية", en: "Operational Guardrails & Constraints" } });
    } else {
      checklist.push({ id: "constraints", passed: false, weight: 20, label: { ar: "بدون قيود أو محددات", en: "No constraints or boundaries set" } });
      suggestions.push({ ar: "حدد قيوداً صريحة لتفادي الهلوسة (+20%).", en: "Add explicit constraints or boundaries (+20%)." });
    }

    const audienceText = fields.target_audience || fields.stack || fields.readership || fields.medium_style || fields.channel || fields.key_variables || fields.current_proficiency || "";
    if (audienceText.trim().length > 0) {
      score += 15;
      checklist.push({ id: "audience", passed: true, weight: 15, label: { ar: "الجمهور أو البيئة التقنية محددة", en: "Target Audience / Domain Calibration" } });
    } else {
      checklist.push({ id: "audience", passed: false, weight: 15, label: { ar: "الجمهور أو البيئة غير محددة", en: "Unspecified audience / tech stack" } });
      suggestions.push({ ar: "حدد الجمهور المستهدف أو التقنيات المستخدمة (+15%).", en: "Specify target reader or technical stack (+15%)." });
    }

    let rating = { ar: "يحتاج لمزيد من التفاصيل", en: "Needs More Detail" };
    if (score >= 85) rating = { ar: "احترافي وعالي الدقة", en: "Production-Grade" };
    else if (score >= 65) rating = { ar: "جيد ومنظم", en: "Solid & Usable" };
    else if (score >= 40) rating = { ar: "متوسط", en: "Acceptable" };

    return {
      score: Math.min(100, Math.max(10, score)),
      rating,
      checklist,
      suggestions: suggestions.slice(0, 3)
    };
  }
};
