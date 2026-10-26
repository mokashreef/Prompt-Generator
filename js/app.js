/**
 * Prompt Generator - Main Application Controller
 * Rebuilt from the ground up as a professional AI Prompt Engineering Workspace.
 * 
 * Core Architectural Responsibilities:
 * 1. AI Inference Orchestration: Manages live provider connectivity, dynamic model discovery,
 *    and transparent failover to the deterministic engine when offline.
 * 2. Progressive Disclosure UX: Exposes essential inputs first (objective, domain profile, mode),
 *    while offering an advanced collapsible drawer for operational guardrails.
 * 3. Provenance & Transparency: Distinctly labels Real AI generated artifacts from
 *    Deterministic Fallback artifacts with live provider metadata and model IDs.
 * 4. Superpower Actions: Instant 3-alternative generation, deep structural evaluations,
 *    and iterative prompt improvement loops.
 * 5. Full Bilingual Support: Pixel-perfect Arabic (RTL) & English (LTR) layouts with protected
 *    code identifiers and syntax blocks.
 */

import { translations } from "./data/translations.js";
import { taskProfiles } from "./data/taskProfiles.js";
import { promptExamples } from "./data/examples.js";
import { providerManager } from "./ai/ProviderManager.js";
import { aiPromptPipeline, GENERATION_MODES } from "./engine/aiPromptPipeline.js";
import { qualityEvaluator } from "./engine/qualityEvaluator.js";
import { storage } from "./engine/storage.js";
import { formRenderer } from "./ui/formRenderer.js";
import { modals } from "./ui/modals.js";
import { toast } from "./ui/toast.js";

class App {
  constructor() {
    this.currentLang = storage.getLanguage("ar");
    this.currentTheme = storage.getTheme("dark");
    this.selectedProfileId = "general";
    this.searchQuery = "";

    // Generation Parameters
    this.currentMode = "professional";
    this.targetPlatform = "general";
    this.currentTargetLang = "auto";
    this.isGenerating = false;

    // Output State
    this.currentGeneratedItem = null;
    this.isEditingOutput = false;

    this.init();
  }

  init() {
    this._cacheDom();

    // Initialize Dialogs & Drawers
    modals.init({
      onLoadItem: (item) => this.loadFromHistoryOrFavorite(item),
      onUseExample: (example) => this.loadFromExample(example),
      t: translations,
      getLang: () => this.currentLang,
      taskProfiles
    });

    this.applyTheme(this.currentTheme);
    this.applyLanguage(this.currentLang);

    // Initialize Dynamic Form Renderer with live change listener
    const formContainer = document.getElementById("dynamic-form-container");
    formRenderer.init(formContainer, (values) => this.handleLiveFormChange(values));

    // Render 14 Task Profile Cards
    this.renderProfileSelector();

    // Render Generation Mode Pills
    this.renderModePills();

    // Select Default Profile (General)
    this.selectTaskProfile(this.selectedProfileId);

    // Bind Event Listeners
    this._bindEvents();

    // Subscribe to AI Provider Status Changes
    this._subscribeToProvider();

    // Register Service Worker for Offline Fallback Cache
    this._registerServiceWorker();

    this.updateBadges();
  }

  _cacheDom() {
    this.dom = {
      html: document.documentElement,
      langBtn: document.getElementById("btn-lang-toggle"),
      themeBtn: document.getElementById("btn-theme-toggle"),
      profileSelectorContainer: document.getElementById("task-profile-grid"),
      searchInput: document.getElementById("search-task-profiles"),

      // Header AI Status
      btnAiStatusToggle: document.getElementById("btn-ai-status-toggle"),
      headerStatusDot: document.getElementById("header-status-dot"),
      headerAiLabel: document.getElementById("header-ai-label"),
      navAiSettingsBtn: document.getElementById("nav-ai-settings-btn"),

      // Selected Profile Header
      currentProfileName: document.getElementById("current-profile-name"),
      currentProfileDesc: document.getElementById("current-profile-desc"),
      currentProfileIcon: document.getElementById("current-profile-icon"),
      btnGenerate: document.getElementById("btn-generate-prompt"),
      btnGenerateText: document.getElementById("btn-generate-text"),
      btnClearForm: document.getElementById("btn-clear-form"),
      btnLoadExample: document.getElementById("btn-load-type-example"),

      // Mode & Controls
      modePillsContainer: document.getElementById("mode-pills-container"),
      targetPlatformSelect: document.getElementById("select-target-platform"),
      targetLangSelect: document.getElementById("select-target-lang"),

      // Advanced Parameters Drawer
      btnToggleAdvancedDrawer: document.getElementById("btn-toggle-advanced-drawer"),
      advancedDrawerContent: document.getElementById("advanced-drawer-content"),
      advAudience: document.getElementById("adv-audience"),
      advConstraints: document.getElementById("adv-constraints"),
      advDeliverable: document.getElementById("adv-deliverable"),
      advTechEnv: document.getElementById("adv-tech-env"),

      // Quality Score Box
      qualityCard: document.getElementById("quality-score-card"),
      qualityScoreNum: document.getElementById("quality-score-num"),
      qualityProgressBar: document.getElementById("quality-progress-bar"),
      qualityRatingLabel: document.getElementById("quality-rating-label"),
      qualityChecklist: document.getElementById("quality-checklist"),
      qualitySuggestions: document.getElementById("quality-suggestions-list"),

      // Provenance Banner
      provenanceBanner: document.getElementById("provenance-banner"),
      provenanceIcon: document.getElementById("provenance-icon"),
      provenanceText: document.getElementById("provenance-text"),
      provenanceMeta: document.getElementById("provenance-meta"),

      // Output Elements
      outputSection: document.getElementById("output-section"),
      outputWrapper: document.getElementById("output-wrapper"),
      outputView: document.getElementById("output-display"),
      outputEditor: document.getElementById("output-editor"),
      outputEmptyState: document.getElementById("output-empty-state"),
      statWords: document.getElementById("stat-words"),
      statChars: document.getElementById("stat-chars"),
      statTokens: document.getElementById("stat-tokens"),

      // Output Toolbar
      btnCopy: document.getElementById("btn-copy-output"),
      btnEdit: document.getElementById("btn-edit-output"),
      btnRegenerate: document.getElementById("btn-regenerate-output"),
      btnAlternatives: document.getElementById("btn-alternatives-output"),
      btnEvaluate: document.getElementById("btn-evaluate-output"),
      btnImprove: document.getElementById("btn-improve-output"),
      btnFav: document.getElementById("btn-favorite-output"),
      btnDownloadTxt: document.getElementById("btn-download-txt"),
      btnDownloadMd: document.getElementById("btn-download-md"),
      btnDownloadJson: document.getElementById("btn-download-json"),
      btnClearOutput: document.getElementById("btn-clear-output"),

      // Nav Triggers
      btnOpenHistory: document.getElementById("nav-history-btn"),
      btnOpenFavorites: document.getElementById("nav-favorites-btn"),
      btnOpenExamples: document.getElementById("nav-examples-btn"),
      btnOpenExtension: document.getElementById("nav-extension-btn"),
      btnClearHistoryModal: document.getElementById("btn-clear-history-all"),
      modalCloseBtns: document.querySelectorAll(".btn-close-modal"),

      // Badges
      historyBadge: document.getElementById("nav-history-badge"),
      favoritesBadge: document.getElementById("nav-favorites-badge")
    };
  }

  _bindEvents() {
    this.dom.langBtn.addEventListener("click", () => {
      const newLang = this.currentLang === "ar" ? "en" : "ar";
      this.applyLanguage(newLang);
    });

    this.dom.themeBtn.addEventListener("click", () => {
      const newTheme = this.currentTheme === "dark" ? "light" : "dark";
      this.applyTheme(newTheme);
    });

    // AI Settings Modal Triggers
    if (this.dom.btnAiStatusToggle) {
      this.dom.btnAiStatusToggle.addEventListener("click", () => {
        modals.openAiSettings(providerManager, () => this.updateProviderStatus());
      });
    }

    if (this.dom.navAiSettingsBtn) {
      this.dom.navAiSettingsBtn.addEventListener("click", () => {
        modals.openAiSettings(providerManager, () => this.updateProviderStatus());
      });
    }

    // Task Search Filter
    this.dom.searchInput.addEventListener("input", (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.renderProfileSelector();
    });

    // Target Platform
    if (this.dom.targetPlatformSelect) {
      this.dom.targetPlatformSelect.addEventListener("change", (e) => {
        this.targetPlatform = e.target.value;
      });
    }

    // Output Language
    if (this.dom.targetLangSelect) {
      this.dom.targetLangSelect.addEventListener("change", (e) => {
        this.currentTargetLang = e.target.value;
      });
    }

    // Advanced Drawer Toggle
    if (this.dom.btnToggleAdvancedDrawer) {
      this.dom.btnToggleAdvancedDrawer.addEventListener("click", () => {
        const drawer = this.dom.advancedDrawerContent;
        drawer.classList.toggle("open");
      });
    }

    // Primary AI Generate
    this.dom.btnGenerate.addEventListener("click", () => {
      this.handleGenerate();
    });

    this.dom.btnClearForm.addEventListener("click", () => {
      formRenderer.clear();
      this.renderQualityScore({
        score: 0,
        rating: { ar: "ابدأ بالكتابة", en: "Start typing" },
        checklist: [],
        suggestions: []
      });
      toast.show(this.currentLang === "ar" ? "تم مسح حقول النموذج" : "Fields cleared", "info");
    });

    this.dom.btnLoadExample.addEventListener("click", () => {
      const match = promptExamples.find((ex) => ex.typeId === this.selectedProfileId);
      if (match) {
        this.loadFromExample(match);
      } else {
        modals.openExamples(promptExamples);
      }
    });

    // Output Toolbar Actions
    this.dom.btnCopy.addEventListener("click", () => this.handleCopy());
    this.dom.btnRegenerate.addEventListener("click", () => this.handleGenerate());
    this.dom.btnEdit.addEventListener("click", () => this.toggleEditOutput());
    this.dom.btnFav.addEventListener("click", () => this.handleToggleFavorite());
    this.dom.btnClearOutput.addEventListener("click", () => this.clearOutput());

    // Superpower Action: 3 Alternatives
    if (this.dom.btnAlternatives) {
      this.dom.btnAlternatives.addEventListener("click", () => this.handleGenerateAlternatives());
    }

    // Superpower Action: Evaluate Quality
    if (this.dom.btnEvaluate) {
      this.dom.btnEvaluate.addEventListener("click", () => this.handleEvaluateCurrentPrompt());
    }

    // Superpower Action: Improve Further
    if (this.dom.btnImprove) {
      this.dom.btnImprove.addEventListener("click", () => this.handleImproveCurrentPrompt());
    }

    // Downloads
    this.dom.btnDownloadTxt.addEventListener("click", () => this.downloadOutput("txt"));
    this.dom.btnDownloadMd.addEventListener("click", () => this.downloadOutput("md"));
    if (this.dom.btnDownloadJson) {
      this.dom.btnDownloadJson.addEventListener("click", () => this.downloadOutput("json"));
    }

    // Navigation Modals
    this.dom.btnOpenHistory.addEventListener("click", () => modals.openHistory());
    this.dom.btnOpenFavorites.addEventListener("click", () => modals.openFavorites());
    this.dom.btnOpenExamples.addEventListener("click", () => modals.openExamples(promptExamples));
    if (this.dom.btnOpenExtension) {
      this.dom.btnOpenExtension.addEventListener("click", () => modals.open("extension-modal"));
    }

    const heroExtGuideBtn = document.getElementById("hero-btn-ext-guide");
    if (heroExtGuideBtn) {
      heroExtGuideBtn.addEventListener("click", () => modals.open("extension-modal"));
    }

    // Chrome Extension Direct ZIP Downloads
    const downloadZipButtons = document.querySelectorAll("#hero-btn-download-zip, #modal-btn-download-zip");
    downloadZipButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const t = translations[this.currentLang];
        toast.show(t.downloadStartedToast, "success");

        const targetFilename = "prompt-generator-extension.zip";
        const localZipPath = "./prompt-generator-extension.zip";
        const fallbackGitHubUrl = "https://raw.githubusercontent.com/mokashreef/Prompt-Generator/main/prompt-generator-extension.zip";

        fetch(localZipPath)
          .then((res) => {
            if (!res.ok) throw new Error("Local zip fetch failed: " + res.status);
            return res.blob();
          })
          .then((blob) => {
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = blobUrl;
            a.download = targetFilename;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
              window.URL.revokeObjectURL(blobUrl);
              a.remove();
            }, 1000);
          })
          .catch((err) => {
            console.warn("Blob download fallback to GitHub raw link:", err);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = fallbackGitHubUrl;
            a.download = targetFilename;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => a.remove(), 1000);
          });
      });
    });

    this.dom.modalCloseBtns.forEach((btn) => {
      btn.addEventListener("click", () => modals.close());
    });

    if (this.dom.btnClearHistoryModal) {
      this.dom.btnClearHistoryModal.addEventListener("click", () => {
        const t = translations[this.currentLang];
        if (confirm(t.confirmClearHistory)) {
          storage.clearHistory();
          toast.show(t.historyCleared);
          modals.openHistory();
          this.updateBadges();
        }
      });
    }
  }

  _subscribeToProvider() {
    providerManager.subscribe(() => {
      this.updateProviderStatus();
    });
    this.updateProviderStatus();
  }

  updateProviderStatus() {
    const status = providerManager.getPublicStatus();
    if (!this.dom.headerAiLabel || !this.dom.headerStatusDot) return;

    if (status.isFallback) {
      this.dom.headerStatusDot.className = "status-dot fallback-dot";
      this.dom.headerAiLabel.textContent = this.currentLang === "ar" ? "المحرك الحتمي (Offline)" : "Deterministic Fallback";
    } else {
      this.dom.headerStatusDot.className = "status-dot";
      const shortModel = (status.model || "").split("/").pop() || status.providerName;
      this.dom.headerAiLabel.textContent = `${status.providerName}: ${shortModel}`;
    }
  }

  applyLanguage(lang) {
    this.currentLang = lang;
    storage.setLanguage(lang);

    this.dom.html.setAttribute("lang", lang);
    this.dom.html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");

    const t = translations[lang];

    this.dom.langBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      <span>${lang === "ar" ? "English" : "العربية"}</span>
    `;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (t[key]) {
        if (t[key].includes("<a ") || t[key].includes("<span ")) {
          el.innerHTML = t[key];
        } else {
          el.textContent = t[key];
        }
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (t[key]) el.setAttribute("placeholder", t[key]);
    });

    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      if (t[key]) el.setAttribute("title", t[key]);
    });

    this.renderProfileSelector();
    this.renderModePills();
    this.updateProviderStatus();

    const currentValues = formRenderer.getValues();
    const currentProfile = taskProfiles.find((p) => p.id === this.selectedProfileId);
    if (currentProfile) {
      this._updateSelectedProfileHeader(currentProfile);
      formRenderer.render(currentProfile, lang, currentValues);
      this.handleLiveFormChange(currentValues);
    }
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    storage.setTheme(theme);

    if (theme === "light") {
      this.dom.html.classList.remove("theme-dark");
      this.dom.html.classList.add("theme-light");
      this.dom.themeBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      `;
    } else {
      this.dom.html.classList.remove("theme-light");
      this.dom.html.classList.add("theme-dark");
      this.dom.themeBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
      `;
    }
  }

  renderModePills() {
    const container = this.dom.modePillsContainer;
    if (!container) return;
    container.innerHTML = "";

    GENERATION_MODES.forEach((m) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `mode-pill-btn ${m.id === this.currentMode ? "active" : ""}`;
      btn.innerHTML = `
        <span class="mode-pill-header">
          <span>${m.icon}</span>
          <span>${m.name[this.currentLang] || m.name.en}</span>
        </span>
        <span class="mode-pill-desc">${m.description[this.currentLang] || m.description.en}</span>
      `;

      btn.addEventListener("click", () => {
        this.currentMode = m.id;
        document.querySelectorAll(".mode-pill-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.handleLiveFormChange(formRenderer.getValues());
      });

      container.appendChild(btn);
    });
  }

  renderProfileSelector() {
    const container = this.dom.profileSelectorContainer;
    container.innerHTML = "";

    const filtered = taskProfiles.filter((p) => {
      if (!this.searchQuery) return true;
      const nameAr = p.name.ar.toLowerCase();
      const nameEn = p.name.en.toLowerCase();
      const descAr = p.description.ar.toLowerCase();
      const descEn = p.description.en.toLowerCase();
      return (
        nameAr.includes(this.searchQuery) ||
        nameEn.includes(this.searchQuery) ||
        descAr.includes(this.searchQuery) ||
        descEn.includes(this.searchQuery)
      );
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="no-results-card">
          <p>${translations[this.currentLang].noProfilesFound}</p>
        </div>
      `;
      return;
    }

    filtered.forEach((profile) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = `prompt-type-card ${profile.id === this.selectedProfileId ? "active" : ""}`;
      card.setAttribute("data-profile-id", profile.id);

      card.innerHTML = `
        <div class="type-card-header">
          <div class="type-icon">${profile.icon}</div>
          <span class="type-name">${profile.name[this.currentLang] || profile.name.en}</span>
        </div>
        <p class="type-desc">${profile.description[this.currentLang] || profile.description.en}</p>
        <span class="type-tagline">${profile.tagline[this.currentLang] || profile.tagline.en}</span>
      `;

      card.addEventListener("click", () => {
        this.selectTaskProfile(profile.id);
      });

      container.appendChild(card);
    });
  }

  selectTaskProfile(profileId) {
    this.selectedProfileId = profileId;
    const profile = taskProfiles.find((p) => p.id === profileId) || taskProfiles[0];

    document.querySelectorAll(".prompt-type-card").forEach((card) => {
      card.classList.toggle("active", card.getAttribute("data-profile-id") === profileId);
    });

    this._updateSelectedProfileHeader(profile);
    const preservedValues = formRenderer.getValues();
    formRenderer.render(profile, this.currentLang, preservedValues);

    const hasExample = promptExamples.some((ex) => ex.typeId === profile.id);
    if (this.dom.btnLoadExample) {
      this.dom.btnLoadExample.style.display = hasExample ? "inline-flex" : "none";
    }

    this.handleLiveFormChange(preservedValues);
  }

  _updateSelectedProfileHeader(profile) {
    if (this.dom.currentProfileName) {
      this.dom.currentProfileName.textContent = profile.name[this.currentLang] || profile.name.en;
    }
    if (this.dom.currentProfileDesc) {
      this.dom.currentProfileDesc.textContent = profile.description[this.currentLang] || profile.description.en;
    }
    if (this.dom.currentProfileIcon) {
      this.dom.currentProfileIcon.innerHTML = profile.icon;
    }
  }

  handleLiveFormChange(values) {
    const primaryText = this._extractPrimaryText(values);
    const quality = qualityEvaluator.evaluate({
      typeId: this.selectedProfileId,
      fields: values,
      promptText: primaryText
    });
    this.renderQualityScore(quality);
  }

  renderQualityScore(quality) {
    if (!this.dom.qualityScoreNum) return;

    const score = quality.score || 0;
    this.dom.qualityScoreNum.textContent = `${score}%`;
    this.dom.qualityProgressBar.style.width = `${score}%`;

    if (score >= 80) {
      this.dom.qualityProgressBar.style.backgroundColor = "var(--color-success)";
    } else if (score >= 50) {
      this.dom.qualityProgressBar.style.backgroundColor = "var(--color-warning)";
    } else {
      this.dom.qualityProgressBar.style.backgroundColor = "var(--accent-primary)";
    }

    const ratingText = quality.rating ? (quality.rating[this.currentLang] || quality.rating.en) : "";
    this.dom.qualityRatingLabel.textContent = ratingText;

    if (this.dom.qualityChecklist) {
      this.dom.qualityChecklist.innerHTML = "";
      (quality.checklist || []).forEach((c) => {
        const item = document.createElement("div");
        item.className = `quality-check-item ${c.passed ? "passed" : "pending"}`;
        item.innerHTML = `
          <span class="check-icon">${c.passed ? "✓" : "○"}</span>
          <span class="check-label">${c.label[this.currentLang] || c.label.en}</span>
        `;
        this.dom.qualityChecklist.appendChild(item);
      });
    }

    if (this.dom.qualitySuggestions) {
      this.dom.qualitySuggestions.innerHTML = "";
      if (quality.suggestions && quality.suggestions.length > 0) {
        quality.suggestions.forEach((s) => {
          const li = document.createElement("li");
          li.className = "quality-suggestion-item";
          li.textContent = s[this.currentLang] || s.en;
          this.dom.qualitySuggestions.appendChild(li);
        });
        document.getElementById("quality-suggestions-box").style.display = "block";
      } else {
        document.getElementById("quality-suggestions-box").style.display = "none";
      }
    }
  }

  /**
   * Main Execution: Invokes real AI inference pipeline with full fallback safety.
   */
  async handleGenerate() {
    if (this.isGenerating) return;

    const values = formRenderer.getValues();
    const primaryText = this._extractPrimaryText(values);

    if (!primaryText.trim()) {
      toast.show(this.currentLang === "ar" ? "يرجى كتابة متطلب أو هدف المهمة أولاً." : "Please describe your task objective.", "error");
      formRenderer.validateRequired();
      return;
    }

    // Merge advanced drawer fields into context
    const extendedFields = {
      ...values,
      target_audience: this.dom.advAudience?.value.trim() || values.target_audience || "",
      negative_constraints: this.dom.advConstraints?.value.trim() || values.constraints || "",
      deliverable_format: this.dom.advDeliverable?.value.trim() || values.desired_result || "",
      tech_environment: this.dom.advTechEnv?.value.trim() || values.tech_stack_env || ""
    };

    this._setGeneratingState(true);

    try {
      const result = await aiPromptPipeline.execute({
        taskGoal: primaryText,
        mode: this.currentMode,
        category: this.selectedProfileId,
        targetPlatform: this.targetPlatform,
        targetLang: this.currentTargetLang,
        uiLang: this.currentLang,
        fields: extendedFields
      });

      storage.saveToHistory(result);
      this.currentGeneratedItem = result;

      this.displayOutput(result);
      this.renderQualityScore(result.quality);
      this.updateBadges();

      if (result.warning) {
        toast.show(result.warning, "warning");
      } else {
        toast.show(
          this.currentLang === "ar"
            ? (result.isAiGenerated ? "تم هندسة البرومبت بالذكاء الاصطناعي بنجاح!" : "تم إنشاء البرومبت عبر المحرك الحتمي.")
            : (result.isAiGenerated ? "Engineered with live AI inference!" : "Generated via Deterministic Fallback."),
          "success"
        );
      }

      this.dom.outputSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      console.error("AI Generation failed:", err);
      toast.show(`${err.message}`, "error");
    } finally {
      this._setGeneratingState(false);
    }
  }

  /**
   * Superpower: Generates 3 distinctly different architectural alternatives.
   */
  async handleGenerateAlternatives() {
    if (this.isGenerating) return;

    const values = formRenderer.getValues();
    const primaryText = this._extractPrimaryText(values) || this.dom.outputView.textContent;

    if (!primaryText.trim()) {
      toast.show(this.currentLang === "ar" ? "اكتب هدف المهمة أولاً لتوليد البدائل." : "Enter a task directive first.", "error");
      return;
    }

    toast.show(this.currentLang === "ar" ? "جارٍ توليد 3 بدائل هندسية بالذكاء الاصطناعي..." : "Generating 3 distinct alternatives...", "info");

    try {
      const result = await aiPromptPipeline.execute({
        taskGoal: primaryText,
        mode: "alternatives",
        category: this.selectedProfileId,
        targetPlatform: this.targetPlatform,
        targetLang: this.currentTargetLang,
        uiLang: this.currentLang,
        fields: values
      });

      modals.openAlternatives(result.prompt, (selectedText) => {
        this.dom.outputView.textContent = selectedText;
        this.dom.outputEditor.value = selectedText;
        if (this.currentGeneratedItem) {
          this.currentGeneratedItem.prompt = selectedText;
          storage.saveToHistory(this.currentGeneratedItem);
        }
        toast.show(this.currentLang === "ar" ? "تم اعتماد البديل المختار في مساحة العمل" : "Selected alternative loaded into editor", "success");
      });
    } catch (err) {
      toast.show(err.message, "error");
    }
  }

  /**
   * Superpower: Conducts deep quality evaluation and opens diagnostic modal.
   */
  async handleEvaluateCurrentPrompt() {
    const promptText = (this.dom.outputView.textContent || "").trim();
    if (!promptText) {
      toast.show(this.currentLang === "ar" ? "لا يوجد برومبت ناتج لتقييمه بعد." : "No generated prompt to evaluate.", "error");
      return;
    }

    toast.show(this.currentLang === "ar" ? "جارٍ الفحص والتقييم الهيكلي للبرومبت..." : "Evaluating prompt architecture...", "info");

    const evaluation = qualityEvaluator.evaluate({
      typeId: this.selectedProfileId,
      fields: formRenderer.getValues(),
      promptText
    });

    modals.openEvaluation(evaluation, () => {
      this.handleImproveCurrentPrompt();
    });
  }

  /**
   * Superpower: Upgrades the current prompt via improvement loop.
   */
  async handleImproveCurrentPrompt() {
    const promptText = (this.dom.outputView.textContent || "").trim();
    if (!promptText) return;

    this.currentMode = "improve";
    this.renderModePills();

    toast.show(this.currentLang === "ar" ? "جارٍ تطوير وتحسين البرومبت بالذكاء الاصطناعي..." : "Improving prompt with AI...", "info");

    try {
      const result = await aiPromptPipeline.execute({
        taskGoal: promptText,
        mode: "improve",
        category: this.selectedProfileId,
        targetPlatform: this.targetPlatform,
        targetLang: this.currentTargetLang,
        uiLang: this.currentLang,
        fields: formRenderer.getValues()
      });

      storage.saveToHistory(result);
      this.currentGeneratedItem = result;
      this.displayOutput(result);
      this.renderQualityScore(result.quality);
      toast.show(this.currentLang === "ar" ? "تم رفع كفاءة البرومبت بنجاح!" : "Prompt upgraded successfully!", "success");
    } catch (err) {
      toast.show(err.message, "error");
    }
  }

  displayOutput(item) {
    this.dom.outputEmptyState.style.display = "none";
    this.dom.outputWrapper.style.display = "block";

    this.dom.outputView.textContent = item.prompt;
    this.dom.outputEditor.value = item.prompt;
    this.dom.outputEditor.style.display = "none";
    this.dom.outputView.style.display = "block";
    this.isEditingOutput = false;

    this.dom.statWords.textContent = item.wordCount;
    this.dom.statChars.textContent = item.charCount;
    this.dom.statTokens.textContent = item.approxTokens;

    // Display Provenance Banner
    if (this.dom.provenanceBanner) {
      this.dom.provenanceBanner.style.display = "flex";
      if (item.isAiGenerated) {
        this.dom.provenanceBanner.className = "provenance-banner provenance-real-ai";
        this.dom.provenanceIcon.textContent = "✓";
        this.dom.provenanceText.textContent = translations[this.currentLang].provenanceRealAi;
        this.dom.provenanceMeta.textContent = `${item.providerName || item.provider} • ${item.model}`;
      } else {
        this.dom.provenanceBanner.className = "provenance-banner provenance-fallback";
        this.dom.provenanceIcon.textContent = "ℹ";
        this.dom.provenanceText.textContent = translations[this.currentLang].provenanceFallback;
        this.dom.provenanceMeta.textContent = `Deterministic Rule Engine (No AI API)`;
      }
    }

    this._updateFavButtonState(storage.isFavorite(item.id));
  }

  handleCopy() {
    const text = this.isEditingOutput ? this.dom.outputEditor.value : this.dom.outputView.textContent;
    if (!text) return;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.show(translations[this.currentLang].btnCopied, "success");
        const copyBtn = this.dom.btnCopy;
        copyBtn.classList.add("btn-copied");
        setTimeout(() => copyBtn.classList.remove("btn-copied"), 2000);
      })
      .catch(() => {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        toast.show(translations[this.currentLang].btnCopied, "success");
      });
  }

  toggleEditOutput() {
    this.isEditingOutput = !this.isEditingOutput;
    const t = translations[this.currentLang];

    if (this.isEditingOutput) {
      this.dom.outputView.style.display = "none";
      this.dom.outputEditor.style.display = "block";
      this.dom.outputEditor.value = this.dom.outputView.textContent;
      this.dom.outputEditor.focus();
      this.dom.btnEdit.querySelector("span").textContent = t.btnSaveEdit;
    } else {
      const updatedText = this.dom.outputEditor.value;
      this.dom.outputView.textContent = updatedText;
      this.dom.outputEditor.style.display = "none";
      this.dom.outputView.style.display = "block";
      this.dom.btnEdit.querySelector("span").textContent = t.btnEdit;

      if (this.currentGeneratedItem) {
        this.currentGeneratedItem.prompt = updatedText;
        this.currentGeneratedItem.wordCount = updatedText.split(/\s+/).filter(Boolean).length;
        this.currentGeneratedItem.charCount = updatedText.length;
        storage.saveToHistory(this.currentGeneratedItem);
      }
      toast.show(this.currentLang === "ar" ? "تم حفظ التعديلات" : "Changes saved");
    }
  }

  handleToggleFavorite() {
    if (!this.currentGeneratedItem) return;
    const isFav = storage.toggleFavorite(this.currentGeneratedItem);
    this._updateFavButtonState(isFav);
    this.updateBadges();

    const t = translations[this.currentLang];
    toast.show(isFav ? t.btnFavorited : t.itemDeleted, isFav ? "success" : "info");
  }

  _updateFavButtonState(isFav) {
    const t = translations[this.currentLang];
    const span = this.dom.btnFav.querySelector("span");
    if (isFav) {
      this.dom.btnFav.classList.add("btn-favorited");
      span.textContent = t.btnFavorited;
    } else {
      this.dom.btnFav.classList.remove("btn-favorited");
      span.textContent = t.btnFavorite;
    }
  }

  downloadOutput(format) {
    const text = this.isEditingOutput ? this.dom.outputEditor.value : this.dom.outputView.textContent;
    if (!text) return;

    let content = text;
    let mimeType = "text/plain";
    let filename = `prompt_${Date.now()}.${format}`;

    if (format === "json") {
      mimeType = "application/json";
      content = JSON.stringify(this.currentGeneratedItem || { prompt: text }, null, 2);
    } else if (format === "md") {
      mimeType = "text/markdown";
    }

    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 500);
  }

  clearOutput() {
    this.dom.outputWrapper.style.display = "none";
    this.dom.outputEmptyState.style.display = "flex";
    if (this.dom.provenanceBanner) this.dom.provenanceBanner.style.display = "none";
    this.dom.outputView.textContent = "";
    this.dom.outputEditor.value = "";
    this.currentGeneratedItem = null;
    this.isEditingOutput = false;
  }

  loadFromHistoryOrFavorite(item) {
    if (item.typeId) {
      this.selectTaskProfile(item.typeId);
    }
    if (item.fields) {
      formRenderer.setValues(item.fields);
    }
    if (item.mode) {
      this.currentMode = item.mode;
      this.renderModePills();
    }
    this.currentGeneratedItem = item;
    this.displayOutput(item);
    modals.close();
    this.dom.outputSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  loadFromExample(example) {
    this.selectTaskProfile(example.typeId);
    if (example.fields) {
      formRenderer.setValues(example.fields);
    }
    this.handleLiveFormChange(example.fields);
    modals.close();
    toast.show(this.currentLang === "ar" ? "تم تحميل المثال بنجاح" : "Preset loaded successfully", "success");
  }

  updateBadges() {
    const historyCount = storage.getHistory().length;
    const favoritesCount = storage.getFavorites().length;

    if (this.dom.historyBadge) this.dom.historyBadge.textContent = historyCount;
    if (this.dom.favoritesBadge) this.dom.favoritesBadge.textContent = favoritesCount;
  }

  _extractPrimaryText(values) {
    return (
      values.goal ||
      values.task_objective ||
      values.topic ||
      values.concept ||
      values.subject ||
      values.action_character ||
      values.product_offer ||
      values.dataset_problem ||
      values.topic_skill ||
      values.venture_challenge ||
      values.bug_symptom ||
      values.system_goal ||
      values.automation_task ||
      values.source_text ||
      ""
    );
  }

  _setGeneratingState(isGenerating) {
    this.isGenerating = isGenerating;
    const btn = this.dom.btnGenerate;
    const btnText = this.dom.btnGenerateText;

    if (isGenerating) {
      btn.disabled = true;
      btn.classList.add("btn-generating");
      btnText.textContent = translations[this.currentLang].btnGenerating;
    } else {
      btn.disabled = false;
      btn.classList.remove("btn-generating");
      btnText.textContent = translations[this.currentLang].btnGenerate;
    }
  }

  _registerServiceWorker() {
    if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
      navigator.serviceWorker
        .register("./service-worker.js")
        .then(() => console.log("Service Worker registered successfully."))
        .catch((err) => console.warn("SW Registration skipped:", err));
    }
  }
}

// Bootstrap application on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = new App();
});
