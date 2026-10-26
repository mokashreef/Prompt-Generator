/**
 * Prompt Generator - 10 Core Task Profiles
 * Every profile has a distinct, tailored architecture. No cookie-cutter repetition.
 */

export const taskProfiles = [
  {
    id: "general",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
    name: {
      ar: "برومبت عام (Adaptive)",
      en: "General Prompt"
    },
    tagline: {
      ar: "يتكيف تلقائياً مع أي مهمة أو فكرة تطرحها",
      en: "Intelligently adapts to any task or idea"
    },
    description: {
      ar: "النوع الأساسي والأكثر مرونة. يفهم طبيعة المهمة ويحدد الهيكل المناسب تلقائياً دون تعقيد.",
      en: "The primary adaptive engine. Detects intent and dynamically structures the prompt."
    },
    defaultIntent: "create",
    fields: [
      {
        id: "goal",
        label: { ar: "ماذا تريد أن تحقق؟ (What do you want to accomplish?)", en: "What do you want to accomplish?" },
        placeholder: { ar: "مثال: أريد أن أتعلم React، أو: أريد تحليل هذا المشروع، أو: اكتب مقالاً عن...", en: "e.g., I want to build a REST API in Go, or analyze customer churn data..." },
        helper: { ar: "اكتب فكرتك بأي طريقة وسيقوم النظام بتشخيص نيتك وهيكلتها.", en: "State your goal naturally; the system will detect your intent." },
        type: "textarea",
        rows: 3,
        required: true
      },
      {
        id: "context",
        label: { ar: "السياق والمعلومات التوضيحية (Context & Background)", en: "Background & Context" },
        placeholder: { ar: "أي معلومات سابقة، روابط، أو خلفية تساعد على فهم المطلوب بدقة...", en: "Relevant background, existing assets, constraints, or environment..." },
        type: "textarea",
        rows: 2,
        required: false
      },
      {
        id: "desired_result",
        label: { ar: "النتيجة النهائية المطلوبة (Desired Outcome)", en: "Specific Desired Deliverable" },
        placeholder: { ar: "مثال: خطة عمل أسبوعية، كود متكامل مع شرح، تقرير تنفيذي موجز...", en: "e.g., Working code implementation, step-by-step roadmap, executive brief..." },
        type: "text",
        required: false
      },
      {
        id: "constraints",
        label: { ar: "القيود وما يجب تجنبه (Constraints & Boundaries)", en: "Constraints & Guardrails" },
        placeholder: { ar: "بدون مكتبات خارجية، لا تتجاوز 400 كلمة، تجنب المصطلحات المعقدة...", en: "Zero third-party dependencies, keep under 500 words, avoid fluff..." },
        type: "text",
        required: false
      },
      {
        id: "target_audience",
        label: { ar: "الجمهور أو المستخدم النهائي (Target Audience)", en: "Target Audience / Reader" },
        placeholder: { ar: "مطورون مبتدئون، عملاء B2B، طلاب، إدارة عليا...", en: "Junior engineers, C-level executives, general consumers..." },
        type: "text",
        required: false
      }
    ],
    progressiveNudges: [
      {
        triggerWords: ["تعلم", "learn", "study", "تدريب"],
        promptSuggestionAr: "هل ترغب في إضافة مستواك المعرفي الحالي لضبط وتيرة الشرح؟",
        promptSuggestionEn: "Would you like to specify your current experience level to tailor the pace?",
        targetField: "context"
      },
      {
        triggerWords: ["كود", "code", "موقع", "تطبيق", "برنامج", "api", "react", "python"],
        promptSuggestionAr: "حدد لغة البرمجة أو إطار العمل المفضل لديك للحصول على كود مباشر.",
        promptSuggestionEn: "Specify your preferred framework or language for ready-to-run code.",
        targetField: "context"
      },
      {
        triggerWords: ["مقال", "article", "كتابة", "نص", "post"],
        promptSuggestionAr: "حدد نبرة الصوت (رسمي، ودي، حماسي) وطول النص التقريبي.",
        promptSuggestionEn: "Specify the desired tone and target length.",
        targetField: "desired_result"
      }
    ]
  },

  {
    id: "coding",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    name: {
      ar: "برمجة وهندسة برمجيات",
      en: "Coding & Engineering"
    },
    tagline: {
      ar: "هيكلية تقنية لكتابة كود نظيف وتصحيح الأخطاء",
      en: "Technical structure for clean code and debugging"
    },
    description: {
      ar: "ينتج برومبتات برمجية دقيقة تتضمن سياق المشروع، الكود الحالي، السلوك المتوقع، والتحقق من الأخطاء.",
      en: "Generates precise prompts with tech stack, reproduction context, edge cases, and test requirements."
    },
    defaultIntent: "build",
    fields: [
      {
        id: "task_objective",
        label: { ar: "المهمة والهدف البرمجي (Coding Task)", en: "Core Coding Objective" },
        placeholder: { ar: "ما الذي تريد بناؤه أو إصلاحه بالتحديد؟", en: "What feature, function, or bug fix do you need?" },
        type: "textarea",
        rows: 2,
        required: true
      },
      {
        id: "stack",
        label: { ar: "البيئة والتقنيات (Tech Stack & Environment)", en: "Tech Stack & Runtime" },
        placeholder: { ar: "مثال: TypeScript 5.4, React 19, Node.js 20, PostgreSQL...", en: "e.g., Python 3.12, FastAPI, SQLAlchemy, Docker..." },
        type: "text",
        required: true
      },
      {
        id: "current_code_state",
        label: { ar: "الكود الحالي أو رسالة الخطأ (Current Code / Error Trace)", en: "Existing Code / Error Trace" },
        placeholder: { ar: "الصق الكود ذي الصلة أو رسالة الخطأ إن وجدت...", en: "Paste your existing code snippet or terminal error stack..." },
        type: "textarea",
        rows: 4,
        required: false
      },
      {
        id: "expected_behavior",
        label: { ar: "السلوك المتوقع والتعامل مع الاستثناءات (Expected Behavior & Edge Cases)", en: "Expected Behavior & Edge Cases" },
        placeholder: { ar: "كيف يجب أن يعمل النظام عند النجاح وعند حدوث حالات استثنائية؟", en: "Describe expected return values, side effects, and boundary conditions..." },
        type: "textarea",
        rows: 2,
        required: false
      },
      {
        id: "technical_constraints",
        label: { ar: "القيود والمعايير البرمجية (Constraints & Conventions)", en: "Architectural Constraints" },
        placeholder: { ar: "كود نظيف، بدون مكتبات خارجية، Type-safe، تعقيد زمني O(n)...", en: "Zero external dependencies, pure functions, strict TypeScript, unit tests..." },
        type: "text",
        required: false
      }
    ]
  },

  {
    id: "research",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>`,
    name: {
      ar: "بحث ودراسة استقصائية",
      en: "Research & Investigation"
    },
    tagline: {
      ar: "هيكلية أكاديمية ومنهجية للأدلة والمصادر",
      en: "Academic rigor, hypotheses, and evidence standards"
    },
    description: {
      ar: "يصمم برومبتات للمراجعات المنهجية، واستخلاص الدراسات، وتقييم الأدلة والبراهين.",
      en: "Constructs prompts for systematic reviews, evidence evaluation, and empirical analysis."
    },
    defaultIntent: "research",
    fields: [
      {
        id: "topic",
        label: { ar: "موضوع البحث وسؤاله المركزي (Research Question)", en: "Research Topic & Question" },
        placeholder: { ar: "ما هي القضية أو الظاهرة التي تريد استقصاءها؟", en: "What specific empirical question are you investigating?" },
        type: "textarea",
        rows: 2,
        required: true
      },
      {
        id: "scope",
        label: { ar: "نطاق البحث والحدود (Scope & Boundaries)", en: "Scope & Boundaries" },
        placeholder: { ar: "النطاق الزمني (مثلاً: 2023-2026)، النطاق الجغرافي، القطاع المحدد...", en: "Time horizon (e.g., 2022-2026), target geography, specific sector..." },
        type: "text",
        required: false
      },
      {
        id: "sources_standard",
        label: { ar: "معايير المصادر والمراجع (Source & Citation Standards)", en: "Source Standards & Citations" },
        placeholder: { ar: "أوراق محكمة، بيانات رسمية، تقارير سنوية مع توثيق المصدر...", en: "Peer-reviewed papers, benchmark reports, empirical case studies..." },
        type: "text",
        required: false
      },
      {
        id: "methodology_depth",
        label: { ar: "عمق الدراسة ومنهج التحليل (Methodology & Depth)", en: "Methodological Depth" },
        placeholder: { ar: "مقارنة منهجية، نقد إحصائي، دراسة حالة استكشافية...", en: "Systematic literature review, meta-analysis summary, comparative synthesis..." },
        type: "text",
        required: false
      }
    ]
  },

  {
    id: "writing",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
    name: {
      ar: "كتابة ومحتوى إبداعي",
      en: "Writing & Content"
    },
    tagline: {
      ar: "هيكلية سردية لمقالات ونصوص ذات أثر وجاذبية",
      en: "Narrative architecture for high-impact writing"
    },
    description: {
      ar: "لهيكلة المقالات، القصص، التدوينات، والسيناريوهات مع ضبط النبرة والجمهور والبناء الدرامي.",
      en: "Structures long-form essays, storytelling, and copy with voice, pacing, and narrative arcs."
    },
    defaultIntent: "create",
    fields: [
      {
        id: "concept",
        label: { ar: "فكرة الموضوع والرسالة الأساسية (Core Concept & Premise)", en: "Core Concept & Central Premise" },
        placeholder: { ar: "ما الفكرة أو الرسالة التي تريد إيصالها للقارئ؟", en: "What is the core idea, thesis, or story you want to tell?" },
        type: "textarea",
        rows: 2,
        required: true
      },
      {
        id: "format_type",
        label: { ar: "قالب المحتوى (Content Format)", en: "Content Format" },
        placeholder: { ar: "مقال فكري، تدوينة موجهة للويب، قصة قصيرة، سيناريو، رأي تحليلي...", en: "Thought leadership essay, deep-dive blog post, narrative short story..." },
        type: "text",
        required: true
      },
      {
        id: "readership",
        label: { ar: "القراء المستهدفون (Target Readership)", en: "Target Readership" },
        placeholder: { ar: "من سيقرأ هذا العمل وما هي اهتماماتهم؟", en: "Who are you writing for and what resonates with them?" },
        type: "text",
        required: false
      },
      {
        id: "voice_tone",
        label: { ar: "الأسلوب والنبرة (Tone & Narrative Voice)", en: "Voice & Tone" },
        placeholder: { ar: "تأملي عميق، ساخر وذكي، تقريري مباشر، ملهم وحماسي...", en: "Reflective, analytical, witty, bold, conversational, cinematic..." },
        type: "text",
        required: false
      },
      {
        id: "narrative_points",
        label: { ar: "المحاور والأفكار التي يجب تغطيتها (Key Points / Sections)", en: "Core Sections / Arguments" },
        placeholder: { ar: "اذكر أهم المحطات أو النقاط التي ترغب في تسليط الضوء عليها...", en: "List the essential arguments, subtopics, or narrative milestones..." },
        type: "textarea",
        rows: 3,
        required: false
      }
    ]
  },

  {
    id: "image",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
    name: {
      ar: "توليد الصور الفنية",
      en: "Image Generation"
    },
    tagline: {
      ar: "أوامر بصرية دقيقة لنماذج Midjourney وFlux وDALL-E",
      en: "Visual prompt engineering for Midjourney & Flux"
    },
    description: {
      ar: "يبني برومبتات بصرية مخصصة لمحركات الذكاء الاصطناعي مع معايير الإضاءة، العدسة، والتكوين.",
      en: "Builds high-fidelity image prompts with optical, lighting, and composition parameters."
    },
    defaultIntent: "create",
    fields: [
      {
        id: "subject",
        label: { ar: "العنصر والموضوع الرئيسي (Primary Subject)", en: "Primary Subject" },
        placeholder: { ar: "ما الذي يجب أن يظهر في بؤرة الصورة؟", en: "e.g., A cybernetic samurai meditating in an ancient moss garden..." },
        type: "text",
        required: true
      },
      {
        id: "scene_setting",
        label: { ar: "البيئة والمشهد المحيط (Environment & Scene)", en: "Setting & Environment" },
        placeholder: { ar: "المكان، الطقس، التفاصيل المعمارية أو الطبيعية في الخلفية...", en: "Neon-drenched Tokyo alley at dawn, swirling mist, reflective puddles..." },
        type: "textarea",
        rows: 2,
        required: true
      },
      {
        id: "medium_style",
        label: { ar: "الوسط الفني والأسلوب (Artistic Medium & Style)", en: "Style & Aesthetic Medium" },
        placeholder: { ar: "تصوير سينمائي 35mm، فن رقمي مفهومي، لوحة زيتية، رسم ثلاثي أبعاد...", en: "Cinematic 70mm film still, analog Kodak Portra, Octane 3D render..." },
        type: "text",
        required: true
      },
      {
        id: "lighting_mood",
        label: { ar: "الإضاءة والجو العام (Lighting & Atmospheric Mood)", en: "Lighting & Atmosphere" },
        placeholder: { ar: "إضاءة الساعة الذهبية، ضوء نيون أزرق وبنفسجي، إضاءة استوديو درامية...", en: "Volumetric fog, dramatic rim lighting, golden hour amber tones..." },
        type: "text",
        required: false
      },
      {
        id: "camera_optics",
        label: { ar: "العدسة والتكوين (Camera, Lens & Framing)", en: "Camera & Framing" },
        placeholder: { ar: "عدسة 85mm f/1.4، زاوية منخفضة، لقطة مقربة، تناسق بصري...", en: "85mm prime lens f/1.2, shallow depth of field, wide low-angle shot..." },
        type: "text",
        required: false
      },
      {
        id: "aspect_ratio",
        label: { ar: "نسبة الأبعاد (Aspect Ratio)", en: "Aspect Ratio" },
        placeholder: { ar: "16:9, 1:1, 9:16, 21:9", en: "16:9, 1:1, 9:16, 21:9" },
        type: "text",
        required: false
      },
      {
        id: "negative_prompt",
        label: { ar: "المستبعدات (Negative Prompt / Avoid)", en: "Negative Prompt (What to Avoid)" },
        placeholder: { ar: "تشوهات، نصوص، علامات مائية، تشويش...", en: "blurry, low resolution, bad anatomy, text, watermarks..." },
        type: "text",
        required: false
      }
    ]
  },

  {
    id: "video",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>`,
    name: {
      ar: "توليد الفيديو السينمائي",
      en: "Cinematic Video Generation"
    },
    tagline: {
      ar: "توجيه حركي وإخراجي لنماذج Sora وRunway وKling",
      en: "Choreography & motion cues for Sora & Runway"
    },
    description: {
      ar: "لهندسة لقطات الفيديو مع وصف مسار الكاميرا، الحركة الفيزيائية، الإيقاع، والصوت.",
      en: "Directs dynamic video generations with camera kinematics, temporal motion, and soundscapes."
    },
    defaultIntent: "create",
    fields: [
      {
        id: "action_character",
        label: { ar: "الموضوع والحركة المستمرة (Subject & Action)", en: "Subject & Movement" },
        placeholder: { ar: "ما الذي يتحرك أو يحدث في اللقطة بدقة؟", en: "A vintage rally car drifting around a muddy mountain hairpin turn..." },
        type: "textarea",
        rows: 2,
        required: true
      },
      {
        id: "scene_story",
        label: { ar: "المشهد والسياق البصري (Scene & Environment)", en: "Scene Environment" },
        placeholder: { ar: "المكان والطقس والتفاصيل المكانية المحيطة...", en: "Dense Alpine forest during heavy rain, headlights cutting through mist..." },
        type: "text",
        required: true
      },
      {
        id: "camera_choreography",
        label: { ar: "حركة الكاميرا والإيقاع (Camera Motion & Pacing)", en: "Camera Dynamics & Speed" },
        placeholder: { ar: "تتبع سريع بمستوى الأرض، دوران درون علوي، تقريب بطيء وناعم...", en: "Low-angle chase cam tracking alongside the front wheel at 60fps..." },
        type: "text",
        required: true
      },
      {
        id: "soundscape",
        label: { ar: "المؤثرات الصوتية والموسيقى (Audio & Sound Cues)", en: "Audio & Soundscape Cues" },
        placeholder: { ar: "صوت هدير المحرك، صوت تطاير الحصى، رياح عاصفة...", en: "Roaring turbocharged engine, tires splashing through mud, distant thunder..." },
        type: "text",
        required: false
      }
    ]
  },

  {
    id: "marketing",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>`,
    name: {
      ar: "تسويق ونمو تجاري",
      en: "Marketing & Growth"
    },
    tagline: {
      ar: "نصوص إعلانية مقنعة وهندسة تحويل الزوار إلى عملاء",
      en: "Direct-response copy and conversion frameworks"
    },
    description: {
      ar: "يصمم رسائل إعلانية موجهة للتحويل المالي، وحملات البريد، وصفحات الهبوط مع معالجة الاعتراضات.",
      en: "Crafts conversion-focused copy, landing pages, and hooks that address buyer friction."
    },
    defaultIntent: "create",
    fields: [
      {
        id: "product_offer",
        label: { ar: "المنتج أو العرض التجاري (Product / Offer)", en: "Product / Core Offer" },
        placeholder: { ar: "ما الذي تبيعه وما هي القيمة الأساسية التي يحصل عليها العميل؟", en: "What are you selling and what tangible transformation does it deliver?" },
        type: "textarea",
        rows: 2,
        required: true
      },
      {
        id: "target_persona",
        label: { ar: "العميل المستهدف ونقاط ألمه (Target Persona & Pain Points)", en: "Buyer Persona & Pain Points" },
        placeholder: { ar: "من هو العميل المثالي؟ ما المشكلة المزعجة التي يسعى لحلها الآن؟", en: "Who is the ideal customer and what keeps them awake at night?" },
        type: "textarea",
        rows: 2,
        required: true
      },
      {
        id: "channel",
        label: { ar: "قناة النشر (Platform / Channel)", en: "Marketing Channel" },
        placeholder: { ar: "إعلانات Meta، لينكد إن B2B، بريد إلكتروني بارد، صفحة هبوط...", en: "LinkedIn sponsored post, Google search ad, cold email, landing page hero..." },
        type: "text",
        required: false
      },
      {
        id: "core_hook",
        label: { ar: "الزاوية الإعلانية والقيمة الفريدة (Hook & Unique Angle)", en: "Hook & Unique Selling Proposition" },
        placeholder: { ar: "لماذا يشتري منك دون المنافسين؟ ما الزاوية المفاجئة في العرض؟", en: "What makes this irresistible compared to existing alternatives?" },
        type: "text",
        required: false
      },
      {
        id: "cta",
        label: { ar: "الدعوة للإجراء (Call to Action - CTA)", en: "Call to Action (CTA)" },
        placeholder: { ar: "احجز جلسة تجريبية، ابدأ تجربة مجانية، اطلب تقريرك الآن...", en: "Claim 14-day trial, schedule a 15-min call, download the guide..." },
        type: "text",
        required: false
      }
    ]
  },

  {
    id: "analysis",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>`,
    name: {
      ar: "تحليل وتشخيص وتقييم",
      en: "Analysis & Evaluation"
    },
    tagline: {
      ar: "تفكير نقدي منظم وأطر تحليل المشكلات والقرارات",
      en: "Structured critical thinking and diagnostic frameworks"
    },
    description: {
      ar: "لتحليل البيانات، تشخيص أسباب المشاكل، مفاضلة الخيارات، ودراسة المخاطر والفرص.",
      en: "Dissects datasets, evaluates strategic dilemmas, and maps root causes and trade-offs."
    },
    defaultIntent: "analyze",
    fields: [
      {
        id: "dataset_problem",
        label: { ar: "المسألة أو البيانات محل التحليل (Subject / Dataset)", en: "Subject / Problem to Analyze" },
        placeholder: { ar: "صف الموقف أو البيانات أو المشكلة المراد تشريحها بدقة...", en: "Describe the operational breakdown, dataset, or decision dilemma..." },
        type: "textarea",
        rows: 3,
        required: true
      },
      {
        id: "framework",
        label: { ar: "إطار التحليل المقترح (Analytical Framework)", en: "Preferred Framework" },
        placeholder: { ar: "تحليل السبب الجذري (Root Cause)، تحليل سوات (SWOT)، التكلفة مقابل العائد...", en: "Root Cause / 5 Whys, SWOT, Cost-Benefit, First Principles, PESTEL..." },
        type: "text",
        required: false
      },
      {
        id: "decision_objective",
        label: { ar: "القرار المطلوب اتخاذه (Strategic Decision at Stake)", en: "Decision to Inform" },
        placeholder: { ar: "ما القرار العملي الذي سيبنى على نتائج هذا التحليل؟", en: "What specific decision or strategy will this analysis drive?" },
        type: "text",
        required: false
      },
      {
        id: "key_variables",
        label: { ar: "المتغيرات ومعايير التقييم (Key Variables & Risk Factors)", en: "Evaluation Criteria & Risks" },
        placeholder: { ar: "التكلفة، العائد المالي، سهولة التنفيذ، المخاطر التشغيلية...", en: "ROI, implementation friction, scalability, compliance exposure..." },
        type: "text",
        required: false
      }
    ]
  },

  {
    id: "learning",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>`,
    name: {
      ar: "تعلّم وتدريب مفاهيمي",
      en: "Learning & Education"
    },
    tagline: {
      ar: "طريقة فاينمان والمبادئ الأولى لتبسيط المفاهيم المعقدة",
      en: "Feynman technique and first principles mastery"
    },
    description: {
      ar: "يبني خططاً دراسية تفاعلية وتدريبات عملية ونماذج ذهنية لتفكيك أصعب العلوم والمهارات.",
      en: "Builds pedagogical prompts with analogies, active recall drills, and conceptual mental models."
    },
    defaultIntent: "teach",
    fields: [
      {
        id: "topic_skill",
        label: { ar: "الموضوع أو المهارة المراد إتقانها (Target Topic / Skill)", en: "Topic or Skill to Master" },
        placeholder: { ar: "مثال: ميكانيكا الكم، خوارزميات الرسوم البيانية، التحليل المالي...", en: "e.g., Docker containerization, Neural network backpropagation, Accounting..." },
        type: "text",
        required: true
      },
      {
        id: "current_proficiency",
        label: { ar: "مستواك الحالي (Current Knowledge Level)", en: "Current Knowledge Level" },
        placeholder: { ar: "مبتدئ تماماً (اشرح كأنني في العاشرة)، متوسط، متقدم...", en: "Complete beginner (no jargon), intermediate, advanced practitioner..." },
        type: "text",
        required: true
      },
      {
        id: "pedagogy",
        label: { ar: "أسلوب الشرح المفضل (Pedagogical Approach)", en: "Preferred Pedagogical Style" },
        placeholder: { ar: "تشبيهات من الحياة اليومية، أسلوب فاينمان، أسئلة سقراطية، خطة أسبوعية...", en: "Real-world analogies, Socratic questioning, practical project-based roadmap..." },
        type: "text",
        required: false
      },
      {
        id: "practice_focus",
        label: { ar: "نقاط الصعوبة أو متطلبات التطبيق (Pain Points / Drills)", en: "Pain Points & Practice Drills" },
        placeholder: { ar: "ما الذي تجد صعوبة في استيعابه؟ هل تحتاج تمارين واختبارات ذاتية؟", en: "Specific areas of confusion or request for interactive self-tests..." },
        type: "textarea",
        rows: 2,
        required: false
      }
    ]
  },

  {
    id: "business",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>`,
    name: {
      ar: "أعمال واستراتيجية شركات",
      en: "Business & Strategy"
    },
    tagline: {
      ar: "مذكرات تنفيذية وخطط دخول السوق والميزة التنافسية",
      en: "Executive memos, GTM playbooks, and competitive moats"
    },
    description: {
      ar: "يصوغ مذكرات إدارية، استراتيجيات التسعير، نماذج الإيرادات، ومخططات الاستثمار المؤسسي.",
      en: "Generates executive memos, pricing models, defensibility analysis, and operational roadmaps."
    },
    defaultIntent: "plan",
    fields: [
      {
        id: "venture_challenge",
        label: { ar: "المشروع أو التحدي المؤسسي (Business Challenge / Venture)", en: "Business Challenge or Venture" },
        placeholder: { ar: "صف المشروع التجاري، فرصة السوق، أو التحدي المؤسسي...", en: "Describe the commercial venture, market opportunity, or executive mandate..." },
        type: "textarea",
        rows: 2,
        required: true
      },
      {
        id: "industry_market",
        label: { ar: "القطاع والبيئة السوقية (Industry & Market Segment)", en: "Industry & Market" },
        placeholder: { ar: "التقنية المالية B2B، التجارة الإلكترونية، الرعاية الصحية، اللوجستيات...", en: "Enterprise B2B SaaS, FinTech, Digital Health, Supply Chain..." },
        type: "text",
        required: true
      },
      {
        id: "strategic_deliverable",
        label: { ar: "المخرج الاستراتيجي المطلوب (Strategic Deliverable)", en: "Strategic Deliverable" },
        placeholder: { ar: "خطة دخول السوق (GTM)، استراتيجية التسعير، تحليل الحصن التنافسي (Moat)...", en: "Go-to-market plan, pricing & packaging model, competitive defensibility analysis..." },
        type: "text",
        required: true
      },
      {
        id: "success_kpis",
        label: { ar: "مؤشرات الأداء المستهدفة (Success Metrics / KPIs)", en: "Target KPIs & Milestones" },
        placeholder: { ar: "CAC, LTV, Gross Margin, Retention, Payback Period...", en: "CAC, LTV, ARR growth, payback velocity, churn reduction..." },
        type: "text",
        required: false
      }
    ]
  },

  {
    id: "debugging",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>`,
    name: {
      ar: "تصحيح الأخطاء ومراجعة الكود",
      en: "Debugging & Code Review"
    },
    tagline: {
      ar: "تشخيص الأعطال، تتبع الـ Stack Traces، وفحص الثغرات",
      en: "Root-cause diagnosis, stack trace dissection, and vulnerability reviews"
    },
    description: {
      ar: "يحلل رسائل الخطأ، يكتشف التسريبات البرمجية، ويوجه النموذج لإيجاد الحل الجذري مع اختبارات مانعة للتكرار.",
      en: "Isolates runtime bugs, deadlocks, and edge-case exceptions with preventive regression tests."
    },
    defaultIntent: "create",
    fields: [
      {
        id: "bug_symptom",
        label: { ar: "العَرَض أو رسالة الخطأ (Bug Symptoms & Error Message)", en: "Error Symptoms & Stack Trace" },
        placeholder: { ar: "الصق رسالة الخطأ، كود الاستثناء، أو السلوك غير المتوقع...", en: "Paste the exact error message, stack trace, or unexpected behavior..." },
        type: "textarea",
        rows: 3,
        required: true
      },
      {
        id: "tech_stack_env",
        label: { ar: "بيئة العمل والتقنيات (Environment & Tech Stack)", en: "Runtime Environment & Versions" },
        placeholder: { ar: "Node.js v20, PostgreSQL 15, Docker, React 18...", en: "e.g., Python 3.11, Django 4.2, Redis 7, deployed on AWS ECS..." },
        type: "text",
        required: true
      },
      {
        id: "expected_behavior",
        label: { ar: "السلوك المتوقع (Expected Behavior)", en: "Expected Behavior" },
        placeholder: { ar: "ما الذي كان ينبغي أن يحدث بدلاً من الخطأ؟", en: "What should have happened instead of this failure?" },
        type: "textarea",
        rows: 2,
        required: false
      },
      {
        id: "repro_steps",
        label: { ar: "خطوات إعادة الإنتاج (Reproduction Steps / Constraints)", en: "Reproduction Steps or Constraints" },
        placeholder: { ar: "يحدث عند إرسال طلب POST بحجم يتجاوز 5MB...", en: "Occurs when concurrent requests exceed 500, or payload has null values..." },
        type: "text",
        required: false
      }
    ]
  },

  {
    id: "architecture",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="8" x="3" y="3" rx="2"/><rect width="8" height="8" x="13" y="3" rx="2"/><rect width="8" height="8" x="8" y="13" rx="2"/><path d="M7 11v2a2 2 0 0 0 2 2h2"/><path d="M17 11v2a2 2 0 0 1-2 2h-2"/></svg>`,
    name: {
      ar: "هندسة ومعمارية الأنظمة",
      en: "System Architecture & Design"
    },
    tagline: {
      ar: "تصميم النظم الموزعة، قابلية التوسع، والمفاضلات المعمارية",
      en: "Distributed systems, fault tolerance, scalability, and ADR trade-offs"
    },
    description: {
      ar: "يصيغ متطلبات معمارية للأنظمة الضخمة، الميكروسيرفس، والتطبيقات السحابية مع ضوابط الأمان والـ SLAs.",
      en: "Architects scalable microservices, event-driven pipelines, caching layers, and high-availability systems."
    },
    defaultIntent: "create",
    fields: [
      {
        id: "system_goal",
        label: { ar: "طبيعة النظام والهدف المعماري (System Scope & Objectives)", en: "System Scope & Strategic Objective" },
        placeholder: { ar: "نظام دفع إلكتروني عالي التوافر، محرك تدفق بيانات آنية...", en: "Real-time payment gateway, event-driven analytics pipeline, multi-tenant SaaS..." },
        type: "textarea",
        rows: 3,
        required: true
      },
      {
        id: "scale_traffic",
        label: { ar: "معدل الحمل والتوسع (Scale, Traffic & SLA Requirements)", en: "Scale, Throughput & SLAs" },
        placeholder: { ar: "10,000 req/sec, 99.99% uptime, p99 latency < 50ms...", en: "10k RPS peak, 99.99% availability SLA, sub-50ms p99 latency..." },
        type: "text",
        required: true
      },
      {
        id: "infra_constraints",
        label: { ar: "القيود التقنية والبنية التحتية (Infrastructure Constraints)", en: "Infrastructure & Technology Constraints" },
        placeholder: { ar: "AWS EKS, Kafka, PostgreSQL, Zero-trust security...", en: "Kubernetes, Apache Kafka, Cassandra, strictly open-source components..." },
        type: "text",
        required: false
      },
      {
        id: "deliverable_focus",
        label: { ar: "محور المخرجات المعمارية (Architectural Deliverables)", en: "Target Architectural Output" },
        placeholder: { ar: "مخطط C4، سجل قرارات معمارية (ADR)، نموذج تدفق البيانات وتفادي الأعطال...", en: "C4 model diagram description, ADR trade-off matrix, disaster recovery protocols..." },
        type: "text",
        required: false
      }
    ]
  },

  {
    id: "automation",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>`,
    name: {
      ar: "الأتمتة والسكربتات",
      en: "Automation & Scripting"
    },
    tagline: {
      ar: "أتمتة المهام المتكررة، الـ Webhooks، والتكامل عبر الـ APIs",
      en: "Workflow automation, API integrations, ETL scripts, and CI/CD jobs"
    },
    description: {
      ar: "يبني تعليمات دقيقة لتطوير سكربتات الأتمتة (Bash, Python, Zapier, GitHub Actions) مع تدابير المعالجة التلقائية للأخطاء.",
      en: "Engineers robust automation scripts with error recovery, retry backoff, and state idempotency."
    },
    defaultIntent: "create",
    fields: [
      {
        id: "automation_task",
        label: { ar: "المهمة المراد أتمتتها (Task to Automate)", en: "Automation Workflow Directive" },
        placeholder: { ar: "سحب التقارير اليومية من Stripe وتحديث جداول Google Sheets وتنبيه Slack...", en: "Extract daily Stripe invoices, transform data, update BigQuery, and alert via Slack webhook..." },
        type: "textarea",
        rows: 3,
        required: true
      },
      {
        id: "tools_platforms",
        label: { ar: "الأدوات والمنصات (Tools, Runtimes & APIs)", en: "Runtimes, APIs & Tooling" },
        placeholder: { ar: "Python, Requests, GitHub Actions, AWS Lambda, CRON...", en: "Python 3.12, GitHub Actions, Docker, Webhooks, Cron..." },
        type: "text",
        required: true
      },
      {
        id: "trigger_schedule",
        label: { ar: "المحفز أو جدول التشغيل (Trigger Mechanism / Schedule)", en: "Trigger or Schedule" },
        placeholder: { ar: "تشغيل كل ساعة (CRON)، عند وصول Webhook، أو يدوي...", en: "Every 15 minutes, on Git push, upon inbound Webhook payload..." },
        type: "text",
        required: false
      },
      {
        id: "failure_handling",
        label: { ar: "التعامل مع الفشل والقيود (Retry & Failure Handling)", en: "Failure Modes & Edge Cases" },
        placeholder: { ar: "إعادة المحاولة 3 مرات بفاصل تراكمي وإشعار المسؤول عند الفشل...", en: "Exponential backoff on 429/5xx, idempotent retries, dead-letter queue..." },
        type: "text",
        required: false
      }
    ]
  },

  {
    id: "translation",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    name: {
      ar: "الترجمة والتعريب التقني",
      en: "Translation & Localization"
    },
    tagline: {
      ar: "تعريب تقني احترافي يحافظ على المصطلحات وهياكل الأكواد",
      en: "Technical localization preserving identifiers, tone, and cultural nuances"
    },
    description: {
      ar: "يوجه النماذج لترجمة المحتوى المعقد تقنياً أو تسويقياً بدقة مع الحفاظ على مصطلحات الـ API والتنسيق الأصلي.",
      en: "Directs AI to localize documentation, UI strings, and articles while safeguarding technical identifiers."
    },
    defaultIntent: "rewrite",
    fields: [
      {
        id: "source_text",
        label: { ar: "النص أو المادة المراد تعريبها (Source Content or Context)", en: "Source Content or Material" },
        placeholder: { ar: "الصق النص أو صف نوع الوثائق المطلوب ترجمتها...", en: "Paste source documentation, UI string catalog, or article context..." },
        type: "textarea",
        rows: 3,
        required: true
      },
      {
        id: "source_target_lang",
        label: { ar: "اللغات المستهدفة (Source & Target Languages / Dialect)", en: "Source & Target Languages" },
        placeholder: { ar: "من الإنجليزية إلى العربية الفصحى المعاصرة...", en: "English to Modern Standard Arabic (or vice versa)..." },
        type: "text",
        required: true
      },
      {
        id: "glossary_terms",
        label: { ar: "المصطلحات الثابتة الواجب حفظها (Protected Technical Terms / Glossary)", en: "Protected Terms & Glossary" },
        placeholder: { ar: "الاحتفاظ بأسماء المتغيرات، أسماء الـ APIs، ومصطلحات مثل Pipeline و Token...", en: "Keep variable names, JSON keys, and terms like 'Webhook', 'Middleware', 'Payload' in English..." },
        type: "text",
        required: false
      },
      {
        id: "tone_style",
        label: { ar: "النبرة والأسلوب المعتمد (Tone & Target Audience)", en: "Tone & Voice" },
        placeholder: { ar: "تقني رصين، واجهات مستخدم مقتضبة، تسويقي جذاب...", en: "Authoritative technical guide, concise UI UX copy, academic journal..." },
        type: "text",
        required: false
      }
    ]
  }
];
