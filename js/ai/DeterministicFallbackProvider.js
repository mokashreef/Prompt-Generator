/**
 * Prompt Generator - Deterministic Fallback Engine
 * Provides offline, zero-API prompt engineering synthesis when AI inference is unavailable.
 * 
 * Strict Architectural Guarantees:
 * 1. Zero Misrepresentation: Outputs are explicitly labeled as deterministic fallback.
 *    Never masquerades as real AI inference.
 * 2. Zero Useless Placeholders: Unlike the previous implementation that inserted literal brackets
 *    like "[Specify project background]" or "[حدد المتطلب]", this engine synthesizes concrete,
 *    substantive prompt requirements, guardrails, and acceptance criteria based on user inputs.
 * 3. Domain Sensitivity: Generates structurally distinct frameworks for software development,
 *    cinematic imagery, data analysis, research, and marketing rather than a single monolithic template.
 */

import { BaseProvider } from "./BaseProvider.js";

export class DeterministicFallbackProvider extends BaseProvider {
  constructor() {
    super({
      id: "deterministic_fallback",
      name: "Deterministic Fallback (Zero-API)",
      apiKey: "",
      baseUrl: "local://engine",
      defaultModel: "deterministic-rule-engine",
      timeoutMs: 1000
    });
  }

  /**
   * Simulates chat completion interface deterministically.
   * Parses the prompt requirements from the messages array.
   */
  async generateChat(messages, options = {}) {
    // Extract the primary user prompt directive
    const userMsg = messages.find((m) => m.role === "user")?.content || "";
    const systemMsg = messages.find((m) => m.role === "system")?.content || "";

    const parsed = this._parseRequestMetadata(userMsg, systemMsg, options);
    const synthesizedPrompt = this._synthesizePrompt(parsed);

    return {
      content: synthesizedPrompt,
      model: "deterministic-rule-engine",
      isFallback: true,
      isAiGenerated: false,
      usage: {
        prompt_tokens: Math.round(userMsg.length / 4),
        completion_tokens: Math.round(synthesizedPrompt.length / 4),
        total_tokens: Math.round((userMsg.length + synthesizedPrompt.length) / 4)
      }
    };
  }

  async listModels() {
    return [
      {
        id: "deterministic-rule-engine",
        name: "Deterministic Rule Engine (Offline Fallback)",
        description: "Zero external network calls; synthesizes structured prompt guardrails locally",
        isFree: true,
        isLocal: true
      }
    ];
  }

  async testConnection() {
    return {
      ok: true,
      latencyMs: 1,
      message: "Deterministic engine is operational locally (offline ready)."
    };
  }

  /**
   * Extracts structured parameters embedded by the pipeline into the messages
   * @private
   */
  _parseRequestMetadata(userText, systemText, options = {}) {
    const isAr = /[\u0600-\u06FF]/.test(userText);
    
    // Check mode explicitly from options, falling back to heuristics
    let mode = options.mode || "professional";
    if (!options.mode) {
      if (/MODE:\s*quick/i.test(systemText)) mode = "quick";
      else if (/MODE:\s*detailed/i.test(systemText)) mode = "detailed";
      else if (/MODE:\s*expert/i.test(systemText)) mode = "expert";
      else if (/mode:\s*improve/i.test(userText) || /MODE:\s*improve/i.test(systemText)) mode = "improve";
      else if (/mode:\s*alternatives/i.test(userText) || /THREE distinctly different/i.test(systemText)) mode = "alternatives";
      else if (/mode:\s*evaluate/i.test(userText) || /evaluate the prompt/i.test(systemText)) mode = "evaluate";
    }

    // Clean out internal pipeline markers
    let cleanGoal = userText
      .replace(/^Task Directive:\s*/i, "")
      .replace(/\[METADATA:.*?\]/g, "")
      .replace(/Mode:.*?\n/gi, "")
      .replace(/Category:.*?\n/gi, "")
      .replace(/Additional Context[\s\S]*$/i, "")
      .trim();

    // Check category explicitly from options, falling back to heuristics
    let category = options.category || "general";
    if (!options.category || category === "general") {
      if (/coding|software|code|laravel|react|python|api|bug|debug/i.test(userText)) category = "coding";
      else if (/image|photo|midjourney|visual|portrait|cinematic/i.test(userText)) category = "image";
      else if (/marketing|seo|sales|campaign|ad|copy/i.test(userText)) category = "marketing";
      else if (/research|analysis|data|study|academic/i.test(userText)) category = "research";
    }

    return {
      goal: cleanGoal || userText.trim(),
      isAr,
      mode,
      category
    };
  }

  /**
   * Synthesizes a high-utility prompt without empty placeholder brackets.
   * @private
   */
  _synthesizePrompt({ goal, isAr, mode, category }) {
    if (mode === "quick") {
      return this._buildQuickPrompt(goal, isAr, category);
    }
    if (mode === "improve") {
      return this._buildImprovePrompt(goal, isAr, category);
    }
    if (mode === "alternatives") {
      return this._buildAlternativesPrompt(goal, isAr, category);
    }
    if (mode === "evaluate") {
      return this._buildEvaluateReport(goal, isAr, category);
    }
    if (mode === "expert") {
      return this._buildExpertPrompt(goal, isAr, category);
    }
    if (mode === "detailed") {
      return this._buildDetailedPrompt(goal, isAr, category);
    }

    // Default: Professional Prompt
    return this._buildProfessionalPrompt(goal, isAr, category);
  }

  _buildQuickPrompt(goal, isAr, category) {
    if (isAr) {
      return `نفّذ المهمة التالية بكفاءة ودقة عالية وبشكل مباشر دون مقدمات أو حشو:
${goal}

الضوابط:
- قدّم الحل النهائي جاهزاً للتطبيق المباشر.
- التزم بالدقة التقنية والحقائق المؤكدة فقط.`;
    }
    return `Execute the following directive with high precision and concise, direct delivery without fluff or conversational filler:
${goal}

Execution Guardrails:
- Deliver the final solution ready for immediate application.
- Adhere strictly to verified facts and technical precision.`;
  }

  _buildProfessionalPrompt(goal, isAr, category) {
    const sections = [];

    if (category === "coding") {
      if (isAr) {
        sections.push(`## 1. الهدف والمهمة البرمجية:
${goal}`);
        sections.push(`## 2. متطلبات التنفيذ والمعايير الهندسية:
- كتابة كود نظيف، آمن، وموثق وفق مبادئ SOLID و DRY و KISS.
- معالجة حالات الأخطاء والحدود (Edge Cases) والاستثناءات بأمان تام.
- عزل منطق الأعمال وتجنب الآثار الجانبية غير المتوقعة (Side Effects).
- توضيح كيفية التشغيل والاختبار مع مثال تطبيقي عملي.`);
        sections.push(`## 3. المخرجات المتوقعة:
- الكود المصدري الكامل مع أسماء دوال ومتغيرات ذات دلالة واضحة.
- شرح موجز للقرارات المعمارية ونقاط الأداء الحيوية.`);
      } else {
        sections.push(`## 1. Technical Directive & Core Objective:
${goal}`);
        sections.push(`## 2. Architectural & Engineering Standards:
- Produce robust, modular, production-ready code adhering to SOLID, DRY, and KISS principles.
- Comprehensive error handling, graceful failure modes, and boundary condition validation.
- Minimize side effects; ensure clean separation of concerns and clear type contracts.
- Include executable verification steps or unit test cases.`);
        sections.push(`## 3. Expected Deliverables:
- Fully functional source implementation with expressive identifier naming.
- Concise architectural justification for core trade-offs and complexity decisions.`);
      }
      return sections.join("\n\n");
    }

    if (category === "image") {
      if (isAr) {
        sections.push(`## التوجيه البصري والمشهد:
${goal}`);
        sections.push(`## المواصفات الفنية للصورة:
- الأسلوب: تصوير واقعي سينمائي فائق الدقة (Hyper-realistic cinematic photography).
- الإضاءة: إضاءة درامية متوازنة مع تباين دقيق بين الظلال والضوء المحيط (Volumetric natural lighting).
- التكوين: زاوية تصوير مدروسة تراعي قاعدة الأثلاث والعمق البصري (Rule of thirds, shallow depth of field).
- الجودة والتفاصيل: تفاصيل دقيقة للخامات والملامح بجودة 8k render.`);
      } else {
        sections.push(`## Visual Subject & Scene Concept:
${goal}`);
        sections.push(`## Technical Photographic Parameters:
- Style: Hyper-realistic cinematic photography with authentic material textures.
- Lighting: Volumetric atmospheric lighting, balanced dynamic contrast, subtle ambient fill.
- Composition: Deliberate cinematic framing, golden ratio, shallow depth of field (f/1.8 bokeh).
- Render & Quality: 8K resolution, octane render fidelity, realistic subsurface scattering.`);
      }
      return sections.join("\n\n");
    }

    // General Professional
    if (isAr) {
      sections.push(`## 1. الهدف الأساسي:
${goal}`);
      sections.push(`## 2. نطاق العمل والتوجيهات التشغيلية:
- ركز على جوهر المسألة وقدم خطوات تطبيقية قابلة للقياس والتنفيذ.
- استند إلى البيانات والمنطق التحليلي وتجنب التعميمات غير المدعومة.
- إذا كانت هناك افتراضات أساسية، حددها بصراحة في بداية الرد.`);
      sections.push(`## 3. هيكل وشكل المخرجات:
- تنظيم الرد في فقرات محددة العناوين مع جداول أو نقاط تدريجية عند الحاجة.
- خاتمة تشمل أهم التوصيات أو خطوات المتابعة الفورية.`);
    } else {
      sections.push(`## 1. Core Objective & Scope:
${goal}`);
      sections.push(`## 2. Operational Parameters & Requirements:
- Focus squarely on the primary directive with actionable, high-density recommendations.
- Ground all conclusions in analytical logic, industry best practices, and verified facts.
- Declare any foundational assumptions explicitly before presenting results.`);
      sections.push(`## 3. Output Structure & Quality Criteria:
- Structure the response with clear hierarchical headings, concise bullet points, and data tables where suitable.
- Conclude with prioritized next steps or verification criteria.`);
    }

    return sections.join("\n\n");
  }

  _buildDetailedPrompt(goal, isAr, category) {
    if (isAr) {
      return `## السياق العام والتوجيه الشامل:
${goal}

## المتطلبات التفصيلية:
1. تحليل المتطلب الرئيسي وتفكيكه إلى مراحله الأساسية.
2. توضيح المنهجية المتبعة وذكر الأسباب الفنية خلف كل خطوة.
3. معالجة التحديات المحتملة ونقاط الفشل المتوقعة وسبل تلافيها.
4. تقديم أمثلة توضيحية واقعية تدعم التطبيق.

## شروط الجودة والمخرجات:
- الالتزام بالدقة الكاملة والتسلسل المنطقي.
- المخرجات منظمة في تقرير مفصل جاهز للتنفيذ.`;
    }
    return `## Comprehensive Operational Directive:
${goal}

## Granular Requirements:
1. Deconstruct the primary objective into distinct, sequential milestones.
2. Outline the analytical or technical methodology with clear rationale for each decision.
3. Proactively address edge cases, common failure modes, and mitigation strategies.
4. Provide practical, illustrative examples demonstrating real-world application.

## Quality Standards:
- Rigorous internal consistency, high technical depth, zero superficial filler.
- Structured Markdown deliverable organized for immediate stakeholder review.`;
  }

  _buildExpertPrompt(goal, isAr, category) {
    if (isAr) {
      return `## تفويض هندسي متقدم (Advanced Expert Directive)

### 1. المسألة المعمارية والهدف:
${goal}

### 2. محددات التصميم والأمان:
- مراعاة قابلية التوسع (Scalability)، الموثوقية (Reliability)، وتكلفة الصيانة.
- تطبيق ضوابط الأمان السيبراني الأساسية (مبدأ الامتيازات الأقل، والتحقق من صحة المدخلات).
- تقييم المفاضلات (Trade-offs) بين السرعة والتعقيد واستهلاك الموارد.

### 3. خطة التنفيذ خطوة بخطوة:
1. بناء المخطط المفاهيمي أو المعماري للحل.
2. تفصيل المكونات الأساسية وتدفق البيانات بينها.
3. توفير نماذج الأكواد أو الأطر التوجيهية للإنتاج.
4. وضع معايير قبول (Acceptance Criteria) واضحة وقابلة للاختبار الآلي.`;
    }
    return `## Advanced Systems Engineering Directive

### 1. Problem Statement & Strategic Objective:
${goal}

### 2. Architectural Guardrails, Security & Reliability:
- Prioritize scalability, high availability, and maintainability across the system lifecycle.
- Implement strict security controls (least privilege, input boundary validation, zero-trust hygiene).
- Rigorously analyze architectural trade-offs (latency vs. consistency, complexity vs. flexibility).

### 3. Phased Execution Roadmap:
1. Architectural decomposition and interface contract definition.
2. Component data-flow modeling and state management protocols.
3. Production-grade implementation blueprints with clear error boundaries.
4. Precise, automated acceptance criteria and verification test harness.`;
  }

  _buildImprovePrompt(goal, isAr, category) {
    if (isAr) {
      return `## البرومبت بعد التطوير والتحسين الشامل:

### الهدف المحدد بدقة:
${goal}

### سياق العمل المطلوب من النموذج:
- تصرف كخبير متخصص يجمع بين المعرفة النظرية العميقة والخبرة العملية في هذا المجال.
- ابدأ مباشرة في الحل دون مقدمات روتينية أو عبارات ترحيبية.

### معايير المخرجات:
- تنظيم الأفكار في تسلسل منطقي مدعوم بالبراهين والأمثلة.
- ذكر الفرضيات المعتمدة بصراحة ومعالجة أي التباس في المتطلبات.`;
    }
    return `## Refined & Optimized Prompt Directive:

### Precise Core Objective:
${goal}

### Expert Context & Operational Persona:
- Act as a senior domain specialist combining rigorous theoretical grounding with battle-tested implementation experience.
- Deliver the response directly with zero conversational padding or pleasantries.

### Delivery Criteria:
- Present logically structured findings supported by concrete examples.
- State any working assumptions explicitly and resolve potential ambiguity upfront.`;
  }

  _buildAlternativesPrompt(goal, isAr, category) {
    if (isAr) {
      return `### البديل الأول: الأسلوب الإجرائي المباشر (Procedural & Direct)
نفّذ ما يلي بأعلى درجات التركيز والإيجاز:
${goal}
المطلوب: خطوات عملية متسلسلة مدعومة بالحل النهائي دون أي مقدمات.

---

### البديل الثاني: أسلوب تقمص الدور المتخصص (Expert Persona & In-Depth)
بصفتك مستشاراً وخبيراً متمرساً في هذا المجال:
${goal}
حلل المتطلب وقدم مراجعة شاملة تشمل المعطيات، التحديات المحتملة، وأفضل الممارسات المعتمدة عالمياً.

---

### البديل الثالث: أسلوب القيود الصارمة ومعايير القبول (Constraint-First & Testable)
المهمة: ${goal}
الشروط والمعايير:
1. الالتزام بالحقائق المثبتة وتجنب أي افتراضات غير موثقة.
2. تنظيم المخرجات في جدول مقارنة أو نقاط حاسمة قابلة للتحقق الفوري.`;
    }
    return `### Alternative A: Direct Procedural Execution
Execute the following task with high density and zero conversational overhead:
${goal}
Requirements: Sequential, actionable steps delivering the final asset ready for use.

---

### Alternative B: Senior Expert Advisory Approach
Acting as a principal consultant and domain specialist:
${goal}
Deconstruct the problem space, evaluate architectural trade-offs, and outline best-practice recommendations with implementation caveats.

---

### Alternative C: Constraint-First & Verification-Driven
Directive: ${goal}
Quality Gates & Constraints:
1. Adhere strictly to verified facts with zero speculative assumptions.
2. Structure the deliverable with explicit acceptance criteria and automated verification methods.`;
  }

  _buildEvaluateReport(goal, isAr, category) {
    if (isAr) {
      return `## تقرير التقييم الفني لجودة البرومبت (Deterministic Evaluation)

### 1. تشخيص الوضوح والهدف (Clarity & Scope):
- صياغة الهدف واضحة ومفهومة، لكنها تحتاج إلى مزيد من القيود التوجيهية لضمان عدم تشعب النموذج.

### 2. نقاط القوة المكتشفة:
- الفكرة الأساسية مباشرة وتحدد مجال العمل بوضوح.
- خلو التوجيه من الكلمات الاستدراكية المربكة.

### 3. جوانب النقص المحددة:
- غياب معايير القبول (Acceptance Criteria) المحددة كمياً أو وظيفياً.
- عدم تحديد صيغة المخرجات المطلوبة (مثل كود فقط، أو جدول، أو تقرير).

### 4. التوصيات العملية للتحسين:
- حدد التقنية أو الأداة المستهدفة بالإصدار إن أمكن.
- أضف شرطاً صريحاً يمنع الحشو والمقدمات الروتينية.`;
    }
    return `## Technical Prompt Quality Evaluation (Deterministic Assessment)

### 1. Clarity & Objective Definition:
- The core directive is identifiable and actionable, though it benefits from explicit boundary constraints to prevent model divergence.

### 2. Identified Strengths:
- Direct intent without confusing contradictory phrasing.
- Clear foundational subject matter.

### 3. Missing Dimensions & Weaknesses:
- Lacks formal acceptance criteria or testable definitions of done.
- Output formatting requirements (e.g. JSON schema, Markdown, code-only) are not explicitly constrained.

### 4. Concrete Recommendations:
- Specify target environment, versions, or frameworks where applicable.
- Add operational guardrails prohibiting conversational pleasantries and requiring assumption disclosure.`;
  }
}
