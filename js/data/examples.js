/**
 * Prompt Generator - Concrete, High-Impact Real-World Examples
 * Matches the 10 distinct task profiles with practical scenarios.
 */

export const promptExamples = [
  {
    id: "ex_general_learn_python",
    typeId: "general",
    title: {
      ar: "عام (تعلّم): أريد أن أتعلم Python من الصفر حتى بناء تطبيقات عملية",
      en: "General: Learning Python from scratch to practical projects"
    },
    description: {
      ar: "كيف يحول النظام طلباً بسيطاً مثل «أريد أن أتعلم Python» إلى خطة تعليمية تفاعلية شاملة.",
      en: "How a brief input like 'I want to learn Python' transforms into a structured Socratic curriculum."
    },
    style: "professional",
    targetLang: "ar",
    fields: {
      goal: "أريد أن أتعلم لغة Python من الصفر وبناء نماذج ذهنية قوية للبرمجة مع تمارين عملية أسبوعية.",
      context: "ليس لدي خلفية برمجية سابقة، ولكن لدي ساعتان يومياً. أهدفي هو الوصول للقدرة على أتمتة المهام وبناء سكربتات تحليل بيانات بسيطة.",
      desired_result: "خطة دراسية من 4 مراحل متدرجة، كل مرحلة تحتوي على المفهوم النظري، تشبيه واقعي، كود تطبيقي، وتمرين اختباري.",
      constraints: "تجنب المصطلحات الأكاديمية المعقدة دون شرحها بمثال واقعي، وركز على التطبيق العملي أكثر من النظريات المجردة.",
      target_audience: "مبتدئ تماماً في البرمجة"
    }
  },

  {
    id: "ex_general_compare_react_vue",
    typeId: "general",
    title: {
      ar: "عام (مقارنة): مقارنة تقنية معمقة بين React وVue لمشروع جديد",
      en: "General: In-depth technical comparison between React and Vue"
    },
    description: {
      ar: "مفاضلة موضوعية تشمل الأداء، ومنحنى التعلم، وقابلية التوسع، وتوصية محددة لحالات الاستخدام.",
      en: "Objective comparison covering performance, developer velocity, ecosystem, and scenario verdicts."
    },
    style: "professional",
    targetLang: "ar",
    fields: {
      goal: "قارن بين React وVue من حيث الأداء، سهولة الصيانة، ومنحنى التعلم، وسرعة إطلاق المنتج (Time to Market).",
      context: "نحن فريق مكون من 5 مطورين نبني لوحة تحكم سحابية لخدمة B2B SaaS. معظم الفريق يتقن JavaScript ولديه خبرة أساسية.",
      desired_result: "مصفوفة مقارنة بجدول، متبوعة بقرار نهائي واضح: متى نختار React ومتى نختار Vue ولماذا.",
      constraints: "حيادية كاملة، دعم المقارنة بحقائق معمارية بدلاً من الانطباعات الشخصية."
    }
  },

  {
    id: "ex_coding_cache",
    typeId: "coding",
    title: {
      ar: "برمجة: بناء نظام كاش (TTL Cache) متزامن في TypeScript",
      en: "Coding: Concurrent In-Memory TTL Cache in TypeScript"
    },
    description: {
      ar: "كود إنتاجي نظيف مع سياسة تفريغ LRU، وانتهاء الصلاحية، واختبارات شاملة للحالات الخاصة.",
      en: "Production-grade TypeScript class with TTL expiration, LRU eviction, and edge-case tests."
    },
    style: "detailed",
    targetLang: "en",
    fields: {
      task_objective: "Build a thread-safe, generic in-memory key-value cache class with automatic TTL expiration and LRU capacity eviction.",
      stack: "TypeScript 5.4, Node.js 20+, Jest",
      current_code_state: "// Currently using a raw Map object without expiration or size limits:\nconst cache = new Map();\nexport function get(k) { return cache.get(k); }",
      expected_behavior: "1. Generic class Cache<K, V>(maxCapacity, defaultTtlMs).\n2. get(k) returns undefined if expired and automatically removes item.\n3. set(k, v, ttl?) evicts least recently accessed entry if at capacity.\n4. Clean dispose() method clearing background cleanup interval.",
      technical_constraints: "Zero third-party npm dependencies. O(1) average lookup and eviction. Comprehensive JSDoc annotations and 100% unit test coverage."
    }
  },

  {
    id: "ex_research_ai_agents",
    typeId: "research",
    title: {
      ar: "بحث: أثر الوكلاء الأذكياء (AI Agents) على إنتاجية هندسة البرمجيات",
      en: "Research: Impact of Autonomous AI Agents on Software Engineering"
    },
    description: {
      ar: "دراسة استقصائية تقارن سرعة دمج التغييرات (PRs) بمعدلات ظهور الأخطاء المعمارية.",
      en: "Empirical investigation comparing merge velocity vs downstream architectural technical debt."
    },
    style: "professional",
    targetLang: "en",
    fields: {
      topic: "Empirical review of autonomous AI agent adoption on software development lifecycle velocity, defect density, and code review fatigue.",
      scope: "Enterprise tech organizations (2024-2026), quantitative pull-request telemetry, and qualitative developer satisfaction surveys.",
      sources_standard: "Peer-reviewed ACM/IEEE software engineering papers, DORA annual research, verified industry case studies.",
      methodology_depth: "Systematic comparative synthesis contrasting claimed velocity against measured long-term maintenance costs."
    }
  },

  {
    id: "ex_writing_essay_attention",
    typeId: "writing",
    title: {
      ar: "كتابة: مقال فكري عن استعادة التركيز العميق في بيئات العمل الحديثة",
      en: "Writing: Thought-leadership essay on reclaiming deep cognitive focus"
    },
    description: {
      ar: "مقال بأسلوب سردي رصين يناقش التكلفة الخفية لتشتت الانتباه اللحظي وكيفية بناء طقوس إنتاجية أصيلة.",
      en: "Compelling essay on attention economics, cognitive residue, and deep work architectures."
    },
    style: "professional",
    targetLang: "ar",
    fields: {
      concept: "استعادة التركيز العميق وبناء العزلة الإيجابية في عصر الإشعارات المتواصلة واجتماعات العمل المتتالية.",
      format_type: "مقال فكري تحليلي (Thought Leadership Essay)",
      readership: "المهنيون، القادة، وصناع المعرفة الذين يشعرون بالإرهاق الرقمي وانخفاض جودة عملهم الأصيل.",
      voice_tone: "تأملي عميق، هادئ، مدعوم بأمثلة واقعية، ومحفز على اتخاذ قرارات شجاعة.",
      narrative_points: "1. وهم الحركة والنشاط مقابل الإنتاجية الحقيقية.\n2. التكلفة الخفية لتشتت الانتباه (Attention Residue).\n3. كيف تحمي أول ساعتين من يومك وتبني أعمالاً لا يستطيع الذكاء الاصطناعي نسخها."
    }
  },

  {
    id: "ex_image_cyberpunk_city",
    typeId: "image",
    title: {
      ar: "صورة: مدينة مستقبلية عملاقة تدمج الطبيعة الحية والعمارة البيئية",
      en: "Image: Biophilic solarpunk megacity at twilight"
    },
    description: {
      ar: "برومبت بصري دقيق يجمع بين الأفق المستقبلي، الحدائق المعلقة، وتفاصيل الإضاءة والعدسة.",
      en: "High-fidelity visual prompt combining vertical biophilic forestry, twilight lighting, and Hasselblad optics."
    },
    style: "professional",
    targetLang: "en",
    fields: {
      subject: "A breathtaking futuristic megalopolis featuring organic spiral skyscrapers with lush vertical gardens, sky bridges, and flowing waterfalls between buildings.",
      scene_setting: "Atmospheric twilight, gentle volumetric mist rising from ground-level canals, glowing bioluminescent trees, and flying transit pods in the distant sky.",
      medium_style: "Cinematic 70mm film still, photorealistic architectural photography, ultra-detailed textures.",
      lighting_mood: "Dramatic golden hour dusk sunlight contrasting with cool cyan and amber architectural accents.",
      camera_optics: "Hasselblad H6D-100c, 24mm wide-angle lens, deep depth of field, razor-sharp focus across the city expanse.",
      aspect_ratio: "16:9",
      negative_prompt: "blurry, oversaturated, dystopian ruin, flat lighting, low resolution, bad geometry, cartoon"
    }
  },

  {
    id: "ex_video_deep_space",
    typeId: "video",
    title: {
      ar: "فيديو: تسلسل سينمائي لكبسولة استكشاف تعبر حزام كويكبات",
      en: "Video: Cinematic exploration probe navigating an icy asteroid belt"
    },
    description: {
      ar: "تسلسل حركي لنماذج Sora وRunway يحدد مسار الكاميرا والإضاءة والمؤثرات الصوتية.",
      en: "Cinematic shot choreography with slow tracking camera motion and ambient spatial soundscapes."
    },
    style: "professional",
    targetLang: "en",
    fields: {
      action_character: "A solitary science exploration probe with solar arrays slowly maneuvering past towering, reflective crystalline ice asteroids.",
      scene_story: "Deep space nebula glowing in subtle deep violet and emerald hues, with distant stars reflecting off the frozen surfaces.",
      camera_choreography: "Smooth slow-motion 24fps dolly roll from beneath the probe, revealing the scale of a giant ringed gas planet in the background.",
      soundscape: "Low resonant spatial drone, gentle thruster hisses, and subtle cosmic micro-frequencies."
    }
  },

  {
    id: "ex_marketing_ecommerce_store",
    typeId: "marketing",
    title: {
      ar: "تسويق: حملة إعلانية لإطلاق متجر إلكتروني للمنتجات العضوية",
      en: "Marketing: Direct-response launch campaign for organic health brand"
    },
    description: {
      ar: "نصوص إعلانية تركز على القيمة الفريدة ومعالجة اعتراضات الشراء مع عناوين جاذبة للانتباه.",
      en: "Direct-response ad hooks and conversion copy addressing price skepticism and quality verification."
    },
    style: "professional",
    targetLang: "ar",
    fields: {
      product_offer: "متجر إلكتروني يقدم أطعمة ومكملات غذائية عضوية 100% معتمدة، مع توصيل خلال 24 ساعة وضمان استرداد كامل.",
      target_persona: "الأمهات والمهتمون بالصحة واللياقة، الذين يعانون من غلاء المنتجات الصحية وعدم ثقتهم في مصداقية الملصقات التجارية.",
      channel: "إعلانات إنستغرام وتيك توك (Instagram & TikTok Ads) وصفحة هبوط مخصصة",
      core_hook: "توقف عن دفع ضعف السعر للطعام الصحي: منتجات عضوية أصلية مباشرة من المزارع إلى مائدتك بسعر الجملة.",
      cta: "احصل على خصم 25% على طلبك الأول مع سلة تجريبية مجانية وتوصيل في نفس اليوم."
    }
  },

  {
    id: "ex_analysis_software_audit",
    typeId: "analysis",
    title: {
      ar: "تحليل: تشخيص مشكلات الأداء وتراكم الديون التقنية في منصة سحابية",
      en: "Analysis: Performance bottlenecks and technical debt audit in SaaS platform"
    },
    description: {
      ar: "تحليل السبب الجذري لتراجع سرعة الاستجابة ومصفوفة أولويات للمعالجة السريعة.",
      en: "Root cause diagnosis of database query saturation and prioritized remediation matrix."
    },
    style: "professional",
    targetLang: "ar",
    fields: {
      dataset_problem: "تراجع زمن استجابة الـ API بنسبة 40% خلال فترات الذروة، وزيادة استهلاك الذاكرة في قواعد البيانات، وشكاوى متكررة من بطء التحميل لدى 20% من المستخدمين.",
      framework: "تحليل السبب الجذري (Root Cause Analysis / 5 Whys) ومصفوفة التأثير مقابل الجهد",
      decision_objective: "اتخاذ قرار هل نعيد هيكلة الاستعلامات ونضيف طبقة كاش، أم نقوم بترقية خوادم قواعد البيانات فوراً؟",
      key_variables: "تكلفة البنية التحتية، زمن التعطيل المحتمل، سرعة التنفيذ، الأثر على تجربة المستخدم النهائي."
    }
  }
];
