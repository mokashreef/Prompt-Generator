/**
 * Prompt Generator - Main Application Controller
 * Rebuilt from scratch with intent-driven modular prompt architecture.
 * 100% Client-Side, Zero AI API, Zero Backend.
 */

import { translations } from "./data/translations.js";
import { taskProfiles } from "./data/taskProfiles.js";
import { promptExamples } from "./data/examples.js";
import { intentDetector, INTENTS } from "./engine/intentDetector.js";
import { promptEngine } from "./engine/promptEngine.js";
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

    // Generation parameters
    this.currentStyle = "professional";
    this.selectedIntentId = "create";
    this.currentTargetLang = "auto";

    // Current output state
    this.currentGeneratedItem = null;
    this.isEditingOutput = false;

    this.init();
  }

  init() {
    this._cacheDom();

    // Modals
    modals.init({
      onLoadItem: (item) => this.loadFromHistoryOrFavorite(item),
      onUseExample: (example) => this.loadFromExample(example),
      t: translations,
      getLang: () => this.currentLang,
      taskProfiles
    });

    this.applyTheme(this.currentTheme);
    this.applyLanguage(this.currentLang);

    // Initialize Form Renderer with live change listener
    const formContainer = document.getElementById("dynamic-form-container");
    formRenderer.init(formContainer, (values) => this.handleLiveFormChange(values));

    // Render 10 Task Profile cards
    this.renderProfileSelector();

    // Populate Intent dropdown
    this.populateIntentSelector();

    // Select default Profile (General)
    this.selectTaskProfile(this.selectedProfileId);

    // Bind global events
    this._bindEvents();

    // Register Service Worker
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
      
      // Selected Profile Header
      currentProfileName: document.getElementById("current-profile-name"),
      currentProfileDesc: document.getElementById("current-profile-desc"),
      currentProfileIcon: document.getElementById("current-profile-icon"),
      btnGenerate: document.getElementById("btn-generate-prompt"),
      btnClearForm: document.getElementById("btn-clear-form"),
      btnLoadExample: document.getElementById("btn-load-type-example"),

      // Controls
      detectedIntentBadge: document.getElementById("detected-intent-badge"),
      intentSelect: document.getElementById("select-task-intent"),
      styleRadios: document.querySelectorAll("input[name='prompt-style']"),
      targetLangSelect: document.getElementById("select-target-lang"),

      // Quality Score Box
      qualityCard: document.getElementById("quality-score-card"),
      qualityScoreNum: document.getElementById("quality-score-num"),
      qualityProgressBar: document.getElementById("quality-progress-bar"),
      qualityRatingLabel: document.getElementById("quality-rating-label"),
      qualityChecklist: document.getElementById("quality-checklist"),
      qualitySuggestions: document.getElementById("quality-suggestions-list"),

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
      btnFav: document.getElementById("btn-favorite-output"),
      btnDownloadTxt: document.getElementById("btn-download-txt"),
      btnDownloadMd: document.getElementById("btn-download-md"),
      btnClearOutput: document.getElementById("btn-clear-output"),

      // Nav triggers
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

    this.dom.searchInput.addEventListener("input", (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.renderProfileSelector();
    });

    this.dom.styleRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        if (e.target.checked) {
          this.currentStyle = e.target.value;
          this.handleLiveFormChange(formRenderer.getValues());
        }
      });
    });

    this.dom.intentSelect.addEventListener("change", (e) => {
      this.selectedIntentId = e.target.value;
      this.handleLiveFormChange(formRenderer.getValues());
    });

    this.dom.targetLangSelect.addEventListener("change", (e) => {
      this.currentTargetLang = e.target.value;
      this.handleLiveFormChange(formRenderer.getValues());
    });

    this.dom.btnGenerate.addEventListener("click", () => {
      this.handleGenerate(true);
    });

    this.dom.btnClearForm.addEventListener("click", () => {
      formRenderer.clear();
      this.renderQualityScore({ score: 0, rating: { ar: "ابدأ بالكتابة", en: "Start typing" }, checklist: [], suggestions: [] });
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

    this.dom.btnCopy.addEventListener("click", () => this.handleCopy());
    this.dom.btnRegenerate.addEventListener("click", () => this.handleGenerate(true));
    this.dom.btnEdit.addEventListener("click", () => this.toggleEditOutput());
    this.dom.btnFav.addEventListener("click", () => this.handleToggleFavorite());
    this.dom.btnDownloadTxt.addEventListener("click", () => this.downloadOutput("txt"));
    this.dom.btnDownloadMd.addEventListener("click", () => this.downloadOutput("md"));
    this.dom.btnClearOutput.addEventListener("click", () => this.clearOutput());

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
    this.populateIntentSelector();

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

  renderProfileSelector() {
    const container = this.dom.profileSelectorContainer;
    container.innerHTML = "";

    const filtered = taskProfiles.filter((p) => {
      if (!this.searchQuery) return true;
      const nameAr = p.name.ar.toLowerCase();
      const nameEn = p.name.en.toLowerCase();
      const descAr = p.description.ar.toLowerCase();
      const descEn = p.description.en.toLowerCase();
      return nameAr.includes(this.searchQuery) || nameEn.includes(this.searchQuery) || descAr.includes(this.searchQuery) || descEn.includes(this.searchQuery);
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
      card.className = `type-card ${profile.id === this.selectedProfileId ? "active" : ""}`;
      card.setAttribute("data-profile-id", profile.id);

      const name = profile.name[this.currentLang] || profile.name.en;
      const tagline = profile.tagline[this.currentLang] || profile.tagline.en;

      card.innerHTML = `
        <div class="type-card-icon">${profile.icon}</div>
        <div class="type-card-content">
          <h3 class="type-card-title">${name}</h3>
          <p class="type-card-desc">${tagline}</p>
        </div>
      `;

      card.addEventListener("click", () => {
        this.selectTaskProfile(profile.id);
      });

      container.appendChild(card);
    });
  }

  populateIntentSelector() {
    const select = this.dom.intentSelect;
    if (!select) return;

    select.innerHTML = "";
    const allIntents = intentDetector.getAllIntents();

    allIntents.forEach((intent) => {
      const opt = document.createElement("option");
      opt.value = intent.id;
      opt.textContent = intent.name[this.currentLang] || intent.name.en;
      if (intent.id === this.selectedIntentId) opt.selected = true;
      select.appendChild(opt);
    });
  }

  selectTaskProfile(profileId, initialValues = null) {
    this.selectedProfileId = profileId;

    document.querySelectorAll(".type-card").forEach((card) => {
      if (card.getAttribute("data-profile-id") === profileId) {
        card.classList.add("active");
      } else {
        card.classList.remove("active");
      }
    });

    const profile = taskProfiles.find((p) => p.id === profileId);
    if (!profile) return;

    this.selectedIntentId = profile.defaultIntent || "create";
    if (this.dom.intentSelect) this.dom.intentSelect.value = this.selectedIntentId;

    this._updateSelectedProfileHeader(profile);
    formRenderer.render(profile, this.currentLang, initialValues || {});

    const hasExample = promptExamples.some((ex) => ex.typeId === profileId);
    if (this.dom.btnLoadExample) {
      this.dom.btnLoadExample.style.display = hasExample ? "inline-flex" : "none";
    }

    this.handleLiveFormChange(initialValues || {});
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

  /**
   * Real-Time Form Change Listener
   * Detects intent, evaluates quality score, and updates live preview
   */
  handleLiveFormChange(values) {
    const profile = taskProfiles.find((p) => p.id === this.selectedProfileId);
    if (!profile) return;

    const primaryText = values.goal || values.task_objective || values.topic || values.concept || values.subject || values.action_character || values.product_offer || values.dataset_problem || values.topic_skill || values.venture_challenge || "";

    // Auto-detect intent if user has not explicitly locked a non-default intent
    if (primaryText.trim().length > 0) {
      const detected = intentDetector.detect(primaryText);
      if (detected.confidence > 50) {
        this.selectedIntentId = detected.id;
        if (this.dom.intentSelect) this.dom.intentSelect.value = detected.id;
      }
      if (this.dom.detectedIntentBadge) {
        this.dom.detectedIntentBadge.textContent = detected.name[this.currentLang] || detected.name.en;
      }
    }

    // Evaluate Quality Score
    const tempResult = promptEngine.generate({
      profile,
      fields: values,
      intentId: this.selectedIntentId,
      style: this.currentStyle,
      targetLang: this.currentTargetLang,
      uiLang: this.currentLang
    });

    this.renderQualityScore(tempResult.quality);

    // If an output is already generated or user has typed substantive input, update live
    if (primaryText.trim().length > 10 && this.currentGeneratedItem) {
      this.handleGenerate(false); // background silent update
    }
  }

  renderQualityScore(quality) {
    if (!this.dom.qualityScoreNum) return;

    const score = quality.score || 0;
    this.dom.qualityScoreNum.textContent = `${score}%`;
    this.dom.qualityProgressBar.style.width = `${score}%`;

    // Color progress bar
    if (score >= 80) {
      this.dom.qualityProgressBar.style.backgroundColor = "var(--color-success)";
    } else if (score >= 55) {
      this.dom.qualityProgressBar.style.backgroundColor = "var(--color-warning)";
    } else {
      this.dom.qualityProgressBar.style.backgroundColor = "var(--accent-primary)";
    }

    const ratingText = quality.rating[this.currentLang] || quality.rating.en;
    this.dom.qualityRatingLabel.textContent = ratingText;

    // Render Checklist
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

    // Render Actionable Suggestions
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

  handleGenerate(shouldScroll = true) {
    const profile = taskProfiles.find((p) => p.id === this.selectedProfileId);
    if (!profile) return;

    const values = formRenderer.getValues();
    const hasAnyInput = Object.values(values).some((v) => v && v.length > 0);

    if (!hasAnyInput) {
      toast.show(translations[this.currentLang].fillRequiredAlert, "error");
      formRenderer.validateRequired();
      return;
    }

    const result = promptEngine.generate({
      profile,
      fields: values,
      intentId: this.selectedIntentId,
      style: this.currentStyle,
      targetLang: this.currentTargetLang,
      uiLang: this.currentLang
    });

    const item = {
      id: "p_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      typeId: profile.id,
      prompt: result.prompt,
      fields: values,
      intentId: this.selectedIntentId,
      style: this.currentStyle,
      targetLang: this.currentTargetLang,
      timestamp: Date.now(),
      wordCount: result.wordCount,
      charCount: result.charCount,
      approxTokens: result.approxTokens,
      isFavorite: false
    };

    storage.saveToHistory(item);
    this.currentGeneratedItem = item;

    this.displayOutput(item);
    this.renderQualityScore(result.quality);
    this.updateBadges();

    if (shouldScroll) {
      this.dom.outputSection.scrollIntoView({ behavior: "smooth", block: "start" });
      toast.show(this.currentLang === "ar" ? "تم توليد البرومبت المخصص بنجاح!" : "Bespoke prompt generated!", "success");
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

    this._updateFavButtonState(storage.isFavorite(item.id));
  }

  handleCopy() {
    const text = this.isEditingOutput ? this.dom.outputEditor.value : this.dom.outputView.textContent;
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      toast.show(translations[this.currentLang].btnCopied, "success");
      const copyBtn = this.dom.btnCopy;
      copyBtn.classList.add("btn-copied");
      setTimeout(() => copyBtn.classList.remove("btn-copied"), 2000);
    }).catch(() => {
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
      this.dom.outputEditor.focus();
      this.dom.btnEdit.textContent = t.btnSaveEdit;
    } else {
      const updatedPrompt = this.dom.outputEditor.value;
      this.dom.outputView.textContent = updatedPrompt;
      this.dom.outputEditor.style.display = "none";
      this.dom.outputView.style.display = "block";
      this.dom.btnEdit.textContent = t.btnEdit;

      if (this.currentGeneratedItem) {
        this.currentGeneratedItem.prompt = updatedPrompt;
        this.currentGeneratedItem.wordCount = promptEngine._countWords(updatedPrompt);
        this.currentGeneratedItem.charCount = updatedPrompt.length;
        this.currentGeneratedItem.approxTokens = Math.round(updatedPrompt.length / 3);
        storage.saveToHistory(this.currentGeneratedItem);

        this.dom.statWords.textContent = this.currentGeneratedItem.wordCount;
        this.dom.statChars.textContent = this.currentGeneratedItem.charCount;
        this.dom.statTokens.textContent = this.currentGeneratedItem.approxTokens;
      }
    }
  }

  handleToggleFavorite() {
    if (!this.currentGeneratedItem) return;

    const result = storage.toggleFavorite(this.currentGeneratedItem);
    this._updateFavButtonState(result.isFavorite);
    this.updateBadges();

    const t = translations[this.currentLang];
    toast.show(result.isFavorite ? t.btnFavorited : t.itemDeleted, "success");
  }

  _updateFavButtonState(isFav) {
    if (isFav) {
      this.dom.btnFav.classList.add("btn-active-fav");
      this.dom.btnFav.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <span>${translations[this.currentLang].btnFavorited}</span>
      `;
    } else {
      this.dom.btnFav.classList.remove("btn-active-fav");
      this.dom.btnFav.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <span>${translations[this.currentLang].btnFavorite}</span>
      `;
    }
  }

  downloadOutput(format = "txt") {
    const text = this.dom.outputView.textContent;
    if (!text) return;

    const profileId = this.selectedProfileId || "prompt";
    const filename = `${profileId}-prompt-${Date.now()}.${format}`;
    const blob = new Blob([text], { type: format === "md" ? "text/markdown;charset=utf-8" : "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.show(this.currentLang === "ar" ? `تم تنزيل (${filename})` : `Downloaded (${filename})`, "success");
  }

  clearOutput() {
    this.dom.outputWrapper.style.display = "none";
    this.dom.outputEmptyState.style.display = "flex";
    this.currentGeneratedItem = null;
  }

  loadFromHistoryOrFavorite(item) {
    this.selectTaskProfile(item.typeId, item.fields);

    this.currentStyle = item.style || "professional";
    this.dom.styleRadios.forEach((r) => {
      r.checked = r.value === this.currentStyle;
    });

    if (item.intentId) {
      this.selectedIntentId = item.intentId;
      if (this.dom.intentSelect) this.dom.intentSelect.value = item.intentId;
    }

    this.currentGeneratedItem = item;
    this.displayOutput(item);

    document.getElementById("form-section").scrollIntoView({ behavior: "smooth", block: "start" });
    toast.show(this.currentLang === "ar" ? "تم استرجاع البرومبت في النموذج" : "Loaded into form", "info");
  }

  loadFromExample(example) {
    this.selectTaskProfile(example.typeId, example.fields);

    this.currentStyle = example.style || "professional";
    this.dom.styleRadios.forEach((r) => {
      r.checked = r.value === this.currentStyle;
    });

    if (example.targetLang) {
      this.currentTargetLang = example.targetLang;
      this.dom.targetLangSelect.value = example.targetLang;
    }

    this.handleGenerate(false);

    document.getElementById("form-section").scrollIntoView({ behavior: "smooth", block: "start" });
    toast.show(this.currentLang === "ar" ? "تم تحميل المثال بنجاح!" : "Example loaded!", "info");
  }

  updateBadges() {
    const history = storage.getHistory();
    const favs = storage.getFavorites();

    if (this.dom.historyBadge) this.dom.historyBadge.textContent = history.length;
    if (this.dom.favoritesBadge) this.dom.favoritesBadge.textContent = favs.length;
  }

  _registerServiceWorker() {
    if ("serviceWorker" in navigator && (window.location.protocol === "https:" || window.location.hostname === "localhost")) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js").catch(() => {});
      });
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.promptGenApp = new App();
});
