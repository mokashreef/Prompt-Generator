/**
 * Prompt Generator - Bilingual Localization Dictionary
 * High precision, authentic terminology in Arabic and English.
 */

export const translations = {
  ar: {
    // App Meta & Brand
    appTitle: "Prompt Generator",
    appSubtitle: "محرك هندسة البرومبتات بالذكاء الاصطناعي",
    brandBy: "برمجة وتصميم محمد أبو خشريف • كود التطور",
    footerCredit: "برمجة وتصميم <a href=\"https://github.com/mokashreef\" target=\"_blank\" rel=\"noopener noreferrer\">محمد أبو خشريف</a> • جزء من منظومة كود التطور",
    brandTagline: "منظومة هندسة برومبتات ذكية مدعومة بالذكاء الاصطناعي الحقيقي والمحرك الحتمي الاحتياطي",

    // Hero
    heroBadge: "ذكاء اصطناعي حقيقي • استدلال فعلي • حماية الخصوصية • محرك احتياطي حتمي",
    heroTitle: "هندسة برومبتات احترافية بالذكاء الاصطناعي",
    heroDesc: "حوّل أفكارك الأولية ومتطلباتك المعقدة إلى برومبتات فائقة الدقة والفاعلية باستخدام استدلال الذكاء الاصطناعي الفعلي عبر Pollinations AI ونماذج مفتوحة ومحلية، مع محرك حتمي شفاف عند عدم توفر الاتصال.",

    featureAiReal: "استدلال ذكاء اصطناعي حقيقي",
    featurePrivate: "حماية تامة للمفاتيح محلياً",
    featureMultiProvider: "مزودات متعددة ودعم Ollama",
    featureFallback: "محرك حتمي احتياطي شفاف",

    // Task Profiles Section
    profilesHeading: "نوع ومجال المهمة (Task Domain)",
    profilesSubtitle: "اختر مجال المهمة لضبط سياق البرومبت أو ابدأ بالعام للتكيف التلقائي:",
    searchPlaceholder: "ابحث في أنواع المهام (برمجة، تحليل، تصاميم، أتمتة...)...",
    noProfilesFound: "لم يتم العثور على مهمة تطابق بحثك.",

    // Modes & Controls
    generationModesTitle: "نمط توليد البرومبت (Prompt Generation Mode):",
    targetPlatformLabel: "النموذج أو المنصة المستهدفة:",
    targetLangLabel: "لغة إخراج البرومبت:",
    langAuto: "نفس لغة الإدخال (تلقائي)",
    langEn: "الإنجليزية (موصى بها لأغلب النماذج)",
    langAr: "العربية الفصحى (مع حماية الأكواد والمصطلحات)",

    // Advanced Drawer
    advancedDirectivesTitle: "محددات وتوجيهات إضافية متقدمة (Advanced Parameters)",
    advancedDirectivesSub: "حدد الجمهور، القيود، البيئة التقنية، وشكل المخرجات لرفع الدقة:",

    // AI Provider Status & Header
    navAiSettings: "إعدادات الذكاء الاصطناعي",
    statusAiReal: "ذكاء اصطناعي حقيقي",
    statusFallback: "محرك احتياطي حتمي (Zero-API)",

    // AI Settings Modal
    aiSettingsTitle: "إعدادات محرك ومزود الذكاء الاصطناعي",
    aiSettingsDesc: "اختر مزود الاستدلال، النموذج النشط، وقم بإدارة المفاتيح بأمان محلي 100%.",
    aiProviderLabel: "مزود الذكاء الاصطناعي (AI Provider):",
    aiModelLabel: "النموذج النشط (Active Model):",
    apiKeyLabel: "مفتاح API الخاص بك (اختياري/حسب المزود):",
    apiKeyPlaceholder: "sk-...",
    apiKeyHelp: "يُحفظ المفتاح في متصفحك محلياً فقط (localStorage) ولا يُنقل لأي خوادم خارجية.",
    customUrlLabel: "رابط الـ Base URL المخصص (OpenAI-Compatible):",
    vendorPresetLabel: "خدمة مزودة متوافقة جاهزة:",
    btnTestConnection: "فحص الاتصال والاستجابة",
    testingConnection: "جارٍ فحص الاتصال...",
    autoFallbackLabel: "تفعيل التبديل التلقائي للمحرك الحتمي عند انقطاع الشبكة أو نفاد الرصيد",
    btnSaveSettings: "حفظ الإعدادات",

    // Form Section
    formHeading: "معطيات ومحددات المهمة",
    btnGenerate: "إنشاء البرومبت بالذكاء الاصطناعي",
    btnGenerating: "جارٍ المعالجة والهندسة...",
    btnLoadExample: "تحميل مثال جاهز",
    btnClear: "مسح الحقول",

    // Quality Score Box
    qualityHeading: "مقياس جودة البرومبت (Quality Evaluation Rubric)",
    qualityTip: "يقاس البرومبت عبر 6 معايير: وضوح الهدف، السياق، التخصيص، القيود السلبية، صيغة المخرجات، ومعايير القبول.",
    suggestionsHeading: "خطوات موصى بها لرفع جودة البرومبت:",

    // Output Section
    outputHeading: "البرومبت الناتج",
    outputEmptyState: "اكتب متطلبات مهمتك واضغط على «إنشاء البرومبت» لتوليد أمر احترافي مخصص وموجه هندسياً.",
    btnCopy: "نسخ البرومبت",
    btnCopied: "تم النسخ بنجاح!",
    btnEdit: "تعديل حر",
    btnSaveEdit: "حفظ التعديل",
    btnFavorite: "إضافة للمفضلة",
    btnFavorited: "في المفضلة",
    btnClearOutput: "مسح النتيجة",
    btnRegenerate: "إعادة إنشاء",
    btnAlternatives: "3 بدائل هندسية",
    btnEvaluate: "تقييم الجودة",
    btnImprove: "تطوير وتحسين",

    // Provenance Banner
    provenanceRealAi: "✓ تم التوليد بنجاح عبر استدلال الذكاء الاصطناعي الحقيقي",
    provenanceFallback: "ℹ تم التوليد عبر المحرك الحتمي الاحتياطي (لم يُستخدم ذكاء اصطناعي خارجي)",

    statsWords: "كلمة",
    statsChars: "حرف",
    statsTokens: "tokens تقريبية",

    // Navigation & Modals
    navExamples: "أمثلة سريعة",
    navHistory: "السجل",
    navFavorites: "المفضلة",
    navExtension: "إضافة Chrome",
    historyTitle: "سجل البرومبتات المولّدة",
    historyEmpty: "لا توجد برومبتات في السجل بعد. سيتم حفظ أي برومبت تنشئه هنا تلقائياً.",
    btnClearHistory: "مسح السجل بالكامل",
    confirmClearHistory: "هل أنت متأكد من مسح جميع عناصر السجل؟",
    favoritesTitle: "البرومبتات المفضلة",
    favoritesEmpty: "لا توجد عناصر مفضلة بعد. اضغط على النجمة لحفظ البرومبت هنا.",
    btnLoadIntoForm: "تعبئة في النموذج",
    btnDelete: "حذف",
    itemDeleted: "تم الحذف",
    historyCleared: "تم مسح السجل بالكامل",

    // Alternatives Modal
    alternativesModalTitle: "3 بدائل هندسية مختلفة لنفس المهمة",
    alternativesModalDesc: "ثلاثة توجهات هيكلية مختلفة تماماً تم توليدها بالذكاء الاصطناعي لنفس الهدف:",
    useAlternative: "استخدام هذا البديل",

    // Evaluation Modal
    evaluationModalTitle: "التقييم الهندسي لجودة البرومبت",
    evaluationModalDesc: "تحليل تشخيصي عميق للأبعاد الستة مع تشخيص نقاط الضعف وخطة التحسين:",
    applyImprovements: "تطبيق التعديلات المحسنة",

    examplesTitle: "نماذج وأمثلة عملية جاهزة",
    examplesDesc: "نماذج حقيقية توضح كيف يختلف هيكل البرومبت جذرياً باختلاف طبيعة المهمة والنموذج المستهدف:",
    btnUseExample: "استخدام هذا المثال",

    // Privacy & Extension
    privacyTitle: "أمان تام وشفافية مطلقة",
    privacyNotice: "مفاتيح الـ API وبياناتك لا تغادر متصفحك إطلاقاً؛ يتم استدعاء مزود الذكاء الاصطناعي مباشرة من جهازك.",
    offlineReadyNotice: "يعمل المحرك الحتمي بالكامل دون إنترنت",
    btnDownloadExtZip: "تحميل إضافة Chrome (ZIP)",
    btnExtGuide: "طريقة التثبيت",
    extModalTitle: "إضافة Chrome لـ Prompt Generator",
    extModalDesc: "حسّن وأعد صياغة أي برومبت مباشرة في أي صفحة (ChatGPT, Claude, Gemini, وغيرها) بنقرة واحدة.",
    extDownloadHeading: "حزمة الإضافة الجاهزة للمتصفح (ZIP)",
    extDownloadSub: "تتضمن محرك الذكاء الاصطناعي المدمج والمحرك الاحترافي جاهزة للتحميل (~57 KB)",
    downloadStartedToast: "بدأ تحميل ملف الإضافة (ZIP)! فك الضغط ثم حمّلها في chrome://extensions",
    backToTop: "للأعلى ↑",
    closeModal: "إغلاق"
  },

  en: {
    // App Meta & Brand
    appTitle: "Prompt Generator",
    appSubtitle: "AI-Powered Prompt Engineering Engine",
    brandBy: "Built by Mohammad Abu Khashreef • Code Elta6ur",
    footerCredit: "Designed and developed by <a href=\"https://github.com/mokashreef\" target=\"_blank\" rel=\"noopener noreferrer\">Mohammad Abu Khashreef</a> • Part of Code Elta6ur ecosystem",
    brandTagline: "A real AI prompt engineering workspace with multi-provider inference and transparent deterministic fallback",

    // Hero
    heroBadge: "Real AI Inference • Active Models • Client-Side Security • Transparent Fallback",
    heroTitle: "Engineer Better AI Prompts in Seconds",
    heroDesc: "Transform raw ideas, incomplete briefs, and complex software directives into high-precision, production-grade prompts using live AI models (Pollinations, Groq, OpenRouter, local Ollama) or an explicit offline deterministic fallback.",

    featureAiReal: "Real AI Model Inference",
    featurePrivate: "100% Client-Side Key Storage",
    featureMultiProvider: "Multi-Provider & Ollama Ready",
    featureFallback: "Transparent Deterministic Fallback",

    // Task Profiles Section
    profilesHeading: "Task Domain & Architecture",
    profilesSubtitle: "Select a specialized task domain or use General for automatic context adaptation:",
    searchPlaceholder: "Search task domains (coding, analysis, vision, automation...)...",
    noProfilesFound: "No task domains match your query.",

    // Modes & Controls
    generationModesTitle: "Prompt Generation Mode:",
    targetPlatformLabel: "Target Model Architecture:",
    targetLangLabel: "Prompt Output Language:",
    langAuto: "Match Form Input (Auto)",
    langEn: "English (Recommended for most LLMs)",
    langAr: "Modern Standard Arabic (Code Protected)",

    // Advanced Drawer
    advancedDirectivesTitle: "Advanced Parameters & Operational Guardrails",
    advancedDirectivesSub: "Configure target persona, operational environment, negative constraints, and output format:",

    // AI Provider Status & Header
    navAiSettings: "AI Settings",
    statusAiReal: "Real AI Inference",
    statusFallback: "Deterministic Fallback (Zero-API)",

    // AI Settings Modal
    aiSettingsTitle: "AI Inference & Provider Settings",
    aiSettingsDesc: "Configure active model providers, API keys, and failover behavior securely in your browser.",
    aiProviderLabel: "AI Inference Provider:",
    aiModelLabel: "Active Text Model:",
    apiKeyLabel: "Your API Key (Optional / Based on Provider):",
    apiKeyPlaceholder: "sk-...",
    apiKeyHelp: "Saved strictly in your browser's localStorage. Never sent to any third-party intermediary.",
    customUrlLabel: "Custom Base URL (OpenAI-Compatible):",
    vendorPresetLabel: "Preconfigured Vendor Preset:",
    btnTestConnection: "Test Connection & Latency",
    testingConnection: "Testing connectivity...",
    autoFallbackLabel: "Enable automatic failover to deterministic engine if provider is offline or quota exceeded",
    btnSaveSettings: "Save Settings",

    // Form Section
    formHeading: "Task Specifications & Directive",
    btnGenerate: "Generate Prompt with AI",
    btnGenerating: "Engineering Prompt...",
    btnLoadExample: "Load Preset Example",
    btnClear: "Clear Fields",

    // Quality Score Box
    qualityHeading: "Prompt Quality Score (Calibrated Rubric)",
    qualityTip: "Evaluated across 6 dimensions: Objective Clarity, Context Sufficiency, Specificity, Guardrails, Output Format, and Testability.",
    suggestionsHeading: "Actionable steps to elevate this prompt:",

    // Output Section
    outputHeading: "Generated Prompt Artifact",
    outputEmptyState: "State what you want to achieve and click \"Generate Prompt with AI\" to construct an optimized prompt here.",
    btnCopy: "Copy Prompt",
    btnCopied: "Copied to Clipboard!",
    btnEdit: "Edit In-Place",
    btnSaveEdit: "Save Changes",
    btnFavorite: "Favorite",
    btnFavorited: "Favorited",
    btnClearOutput: "Clear Output",
    btnRegenerate: "Regenerate",
    btnAlternatives: "3 Alternatives",
    btnEvaluate: "Evaluate Quality",
    btnImprove: "Improve Further",

    // Provenance Banner
    provenanceRealAi: "✓ Generated with live AI model inference",
    provenanceFallback: "ℹ Generated using the offline Deterministic Fallback Engine (No AI API invoked)",

    statsWords: "words",
    statsChars: "characters",
    statsTokens: "approx tokens",

    // Navigation & Modals
    navExamples: "Presets",
    navHistory: "History",
    navFavorites: "Favorites",
    navExtension: "Extension",
    historyTitle: "Generated Prompt History",
    historyEmpty: "No generated prompts in history yet. Your work is saved locally in your browser.",
    btnClearHistory: "Clear All History",
    confirmClearHistory: "Are you sure you want to clear your local history?",
    favoritesTitle: "Saved Favorites",
    favoritesEmpty: "No favorites saved yet. Click the star icon on any prompt to bookmark it here.",
    btnLoadIntoForm: "Load into Form",
    btnDelete: "Delete",
    itemDeleted: "Item removed",
    historyCleared: "All history cleared",

    // Alternatives Modal
    alternativesModalTitle: "3 Distinct Architectural Alternatives",
    alternativesModalDesc: "Three fundamentally different prompt engineering methodologies generated for this exact task:",
    useAlternative: "Use this Alternative",

    // Evaluation Modal
    evaluationModalTitle: "Prompt Quality Diagnostic Report",
    evaluationModalDesc: "In-depth audit across 6 structural dimensions with actionable remediation roadmap:",
    applyImprovements: "Apply Recommended Improvements",

    examplesTitle: "Concrete Real-World Presets",
    examplesDesc: "Realistic scenarios showcasing how prompt architectures fundamentally differ by domain and model target:",
    btnUseExample: "Use this Example",

    // Privacy & Extension
    privacyTitle: "Client-Side Privacy & Security Guarantee",
    privacyNotice: "API keys and prompts remain in your browser sandbox. Model inference calls are dispatched directly to your chosen provider.",
    offlineReadyNotice: "Deterministic fallback is 100% operational offline",
    btnDownloadExtZip: "Download Extension (ZIP)",
    btnExtGuide: "Install Guide",
    extModalTitle: "Chrome Extension for Prompt Generator",
    extModalDesc: "Enhance, rewrite, and structure any prompt directly inside ChatGPT, Claude, Gemini, or any webpage without leaving the tab.",
    extDownloadHeading: "Chrome Extension Package (ZIP)",
    extDownloadSub: "Includes bundled AI engine, icons, and Manifest V3 manifest ready for one-click download (~57 KB)",
    downloadStartedToast: "Extension ZIP download started! Unpack and load into chrome://extensions",
    backToTop: "Back to Top ↑",
    closeModal: "Close"
  }
};
