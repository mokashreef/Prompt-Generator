/**
 * Prompt Generator - Intent Detection Engine
 * Analyzes user inputs to determine the operational intent behind the task.
 * 100% Client-side heuristic linguistics. Zero AI APIs.
 */

export const INTENTS = {
  create: {
    id: "create",
    name: { ar: "إنشاء وبناء", en: "Create & Build" },
    verbsAr: ["أنشئ", "ابن", "اصنع", "اعمل", "صمم", "اكتب كود", "انشاء", "بناء", "تطوير"],
    verbsEn: ["create", "build", "generate", "make", "develop", "construct", "code", "design"],
    preferredBlocks: ["directive", "context", "requirements", "implementation", "deliverable"]
  },
  explain: {
    id: "explain",
    name: { ar: "شرح وتوضيح", en: "Explain & Clarify" },
    verbsAr: ["اشرح", "وضح", "بسط", "فسر", "ما هو", "كيف يعمل", "شرح", "توضيح"],
    verbsEn: ["explain", "clarify", "demystify", "break down", "how does", "what is", "walkthrough"],
    preferredBlocks: ["directive", "target_audience", "pedagogy", "analogies", "deliverable"]
  },
  analyze: {
    id: "analyze",
    name: { ar: "تحليل وتشخيص", en: "Analyze & Diagnose" },
    verbsAr: ["حلل", "افحص", "شخص", "استخرج", "تحليل", "تقييم أداء", "دراسة"],
    verbsEn: ["analyze", "dissect", "diagnose", "audit", "investigate", "inspect", "assess"],
    preferredBlocks: ["directive", "context", "methodology", "dimensions", "risks", "recommendations"]
  },
  compare: {
    id: "compare",
    name: { ar: "مقارنة ومفاضلة", en: "Compare & Contrast" },
    verbsAr: ["قارن", "الفرق بين", "مقارنة", "فاضل بين", "أيهما أفضل", "مقابل"],
    verbsEn: ["compare", "contrast", "versus", "vs", "difference between", "which is better", "trade-offs"],
    preferredBlocks: ["directive", "comparison_subjects", "criteria", "trade_offs", "verdict"]
  },
  research: {
    id: "research",
    name: { ar: "بحث واستقصاء", en: "Research & Investigate" },
    verbsAr: ["ابحث", "استقص", "دراسة", "أحدث الدراسات", "مراجع", "بحث عن"],
    verbsEn: ["research", "investigate", "explore", "literature review", "empirical", "survey"],
    preferredBlocks: ["directive", "scope", "sources", "evidence_standards", "deliverable"]
  },
  solve: {
    id: "solve",
    name: { ar: "حل مشكلة وإصلاح", en: "Solve & Debug" },
    verbsAr: ["حل", "أصلح", "عالج", "مشكلة", "خطأ", "استثناء", "معالجة", "تصحيح"],
    verbsEn: ["solve", "fix", "debug", "resolve", "troubleshoot", "error", "bug", "patch"],
    preferredBlocks: ["directive", "error_context", "root_cause_analysis", "solution_steps", "verification"]
  },
  improve: {
    id: "improve",
    name: { ar: "تحسين وتطوير", en: "Improve & Optimize" },
    verbsAr: ["حسن", "طور", "سرع", "رفع كفاءة", "تحسين", "تطوير"],
    verbsEn: ["improve", "optimize", "refactor", "enhance", "speed up", "streamline", "upgrade"],
    preferredBlocks: ["directive", "current_baseline", "bottlenecks", "target_metrics", "deliverable"]
  },
  rewrite: {
    id: "rewrite",
    name: { ar: "إعادة صياغة وتحرير", en: "Rewrite & Polish" },
    verbsAr: ["أعد صياغة", "عدل", "دقق", "حرر", "إعادة كتابة", "تنقيح"],
    verbsEn: ["rewrite", "rephrase", "edit", "proofread", "polish", "revise", "condense"],
    preferredBlocks: ["directive", "source_text", "target_voice", "preservation_rules", "deliverable"]
  },
  teach: {
    id: "teach",
    name: { ar: "تعليم وتدريب", en: "Teach & Tutor" },
    verbsAr: ["علمني", "أريد أن أتعلم", "كيف أتعلم", "خطة تعلم", "تدريب", "منهاج", "دروس"],
    verbsEn: ["teach me", "learn", "how to learn", "curriculum", "study plan", "tutorial", "guide me"],
    preferredBlocks: ["directive", "current_level", "learning_pathway", "practical_drills", "comprehension_check"]
  },
  summarize: {
    id: "summarize",
    name: { ar: "تلخيص وإيجاز", en: "Summarize & Condense" },
    verbsAr: ["لخص", "أوجز", "اختصر", "تلخيص", "خلاصة", "أهم النقاط"],
    verbsEn: ["summarize", "condense", "tldr", "executive summary", "key takeaways", "brief"],
    preferredBlocks: ["directive", "source_material", "length_limit", "focus_areas", "deliverable"]
  },
  evaluate: {
    id: "evaluate",
    name: { ar: "تقييم ومراجعة", en: "Evaluate & Review" },
    verbsAr: ["قيم", "راجع", "نقد", "مراجعة", "ما رأيك في", "تدقيق"],
    verbsEn: ["evaluate", "review", "critique", "rate", "appraise", "peer review"],
    preferredBlocks: ["directive", "evaluation_rubric", "strengths_weaknesses", "score", "actionable_feedback"]
  }
};

export const intentDetector = {
  /**
   * Detects the dominant intent from text
   * @param {string} text - User prompt or goal text
   * @returns {{ id: string, name: { ar: string, en: string }, confidence: number }}
   */
  detect(text) {
    if (!text || typeof text !== "string" || !text.trim()) {
      return { id: "create", name: INTENTS.create.name, confidence: 0 };
    }

    const clean = text.toLowerCase();
    let bestMatch = "create";
    let highestScore = 0;

    for (const [key, intent] of Object.entries(INTENTS)) {
      let score = 0;

      // Check Arabic keywords
      for (const word of intent.verbsAr) {
        if (clean.includes(word)) {
          score += 3;
        }
      }

      // Check English keywords
      for (const word of intent.verbsEn) {
        if (clean.includes(word)) {
          score += 3;
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = key;
      }
    }

    const confidence = Math.min(100, highestScore > 0 ? (highestScore >= 6 ? 90 : 65) : 30);

    return {
      id: bestMatch,
      name: INTENTS[bestMatch].name,
      confidence
    };
  },

  getIntent(id) {
    return INTENTS[id] || INTENTS.create;
  },

  getAllIntents() {
    return Object.values(INTENTS);
  }
};
