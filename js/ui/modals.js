/**
 * Prompt Generator - Modals & Drawers Manager (History, Favorites, Examples)
 * Accessible dialog handling with keyboard ESC support and outside click dismiss.
 */

import { storage } from "../engine/storage.js";
import { toast } from "./toast.js";

export const modals = {
  activeModal: null,

  init({ onLoadItem, onUseExample, t, getLang, taskProfiles }) {
    this.onLoadItem = onLoadItem;
    this.onUseExample = onUseExample;
    this.t = t;
    this.getLang = getLang;
    this.taskProfiles = taskProfiles;

    // Global keyboard listener for ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.activeModal) {
        this.close();
      }
    });

    // Close on backdrop click
    const backdrop = document.getElementById("modal-backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) {
          this.close();
        }
      });
    }
  },

  open(modalId) {
    const backdrop = document.getElementById("modal-backdrop");
    const modalEl = document.getElementById(modalId);
    if (!backdrop || !modalEl) return;

    if (this.activeModal) {
      this.activeModal.classList.remove("modal-active");
    }

    backdrop.classList.add("backdrop-visible");
    modalEl.classList.add("modal-active");
    this.activeModal = modalEl;
    document.body.classList.add("body-locked");

    const focusable = modalEl.querySelector("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
    if (focusable) focusable.focus();
  },

  close() {
    const backdrop = document.getElementById("modal-backdrop");
    if (backdrop) {
      backdrop.classList.remove("backdrop-visible");
    }
    if (this.activeModal) {
      this.activeModal.classList.remove("modal-active");
      this.activeModal = null;
    }
    document.body.classList.remove("body-locked");
  },

  openHistory() {
    const lang = this.getLang();
    const t = this.t[lang];
    const historyList = storage.getHistory();
    const container = document.getElementById("history-modal-body");
    const countBadge = document.getElementById("history-count-badge");

    if (countBadge) {
      countBadge.textContent = historyList.length;
    }

    if (!container) return;
    container.innerHTML = "";

    if (historyList.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg class="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <p class="empty-text">${t.historyEmpty}</p>
        </div>
      `;
    } else {
      const listEl = document.createElement("div");
      listEl.className = "modal-items-list";

      historyList.forEach((item) => {
        const profile = this.taskProfiles.find((p) => p.id === item.typeId) || { name: { ar: item.typeId, en: item.typeId } };
        const profileName = profile.name[lang] || profile.name.en;
        const timeFormatted = new Date(item.timestamp).toLocaleString(lang === "ar" ? "ar-EG" : "en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });

        const card = document.createElement("div");
        card.className = "modal-item-card";

        const previewText = item.prompt.substring(0, 160).replace(/\n/g, " ") + (item.prompt.length > 160 ? "..." : "");

        card.innerHTML = `
          <div class="modal-item-header">
            <div class="modal-item-title-row">
              <span class="badge badge-type">${profileName}</span>
              <span class="badge badge-level">${item.style || "pro"}</span>
              <span class="modal-item-date">${timeFormatted}</span>
            </div>
            <div class="modal-item-actions">
              <button class="btn btn-sm btn-outline btn-load" title="${t.btnLoadIntoForm}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                ${t.btnLoadIntoForm}
              </button>
              <button class="btn btn-sm btn-secondary btn-copy" title="${t.btnCopy}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              </button>
              <button class="btn btn-sm btn-danger btn-delete" title="${t.btnDelete}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
          <div class="modal-item-body">
            <p class="modal-item-preview">${this._escapeHtml(previewText)}</p>
          </div>
        `;

        card.querySelector(".btn-load").addEventListener("click", () => {
          this.onLoadItem(item);
          this.close();
        });

        card.querySelector(".btn-copy").addEventListener("click", () => {
          navigator.clipboard.writeText(item.prompt).then(() => {
            toast.show(t.btnCopied);
          });
        });

        card.querySelector(".btn-delete").addEventListener("click", () => {
          storage.deleteHistoryItem(item.id);
          toast.show(t.itemDeleted);
          this.openHistory();
        });

        listEl.appendChild(card);
      });

      container.appendChild(listEl);
    }

    this.open("history-modal");
  },

  openFavorites() {
    const lang = this.getLang();
    const t = this.t[lang];
    const favsList = storage.getFavorites();
    const container = document.getElementById("favorites-modal-body");
    const countBadge = document.getElementById("favorites-count-badge");

    if (countBadge) {
      countBadge.textContent = favsList.length;
    }

    if (!container) return;
    container.innerHTML = "";

    if (favsList.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg class="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <p class="empty-text">${t.favoritesEmpty}</p>
        </div>
      `;
    } else {
      const listEl = document.createElement("div");
      listEl.className = "modal-items-list";

      favsList.forEach((item) => {
        const profile = this.taskProfiles.find((p) => p.id === item.typeId) || { name: { ar: item.typeId, en: item.typeId } };
        const profileName = profile.name[lang] || profile.name.en;

        const card = document.createElement("div");
        card.className = "modal-item-card";

        const previewText = item.prompt.substring(0, 160).replace(/\n/g, " ") + (item.prompt.length > 160 ? "..." : "");

        card.innerHTML = `
          <div class="modal-item-header">
            <div class="modal-item-title-row">
              <span class="badge badge-type">${profileName}</span>
              <span class="badge badge-level">${item.style || "pro"}</span>
            </div>
            <div class="modal-item-actions">
              <button class="btn btn-sm btn-outline btn-load" title="${t.btnLoadIntoForm}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                ${t.btnLoadIntoForm}
              </button>
              <button class="btn btn-sm btn-secondary btn-copy" title="${t.btnCopy}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              </button>
              <button class="btn btn-sm btn-danger btn-remove-fav" title="${t.btnDelete}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
          <div class="modal-item-body">
            <p class="modal-item-preview">${this._escapeHtml(previewText)}</p>
          </div>
        `;

        card.querySelector(".btn-load").addEventListener("click", () => {
          this.onLoadItem(item);
          this.close();
        });

        card.querySelector(".btn-copy").addEventListener("click", () => {
          navigator.clipboard.writeText(item.prompt).then(() => {
            toast.show(t.btnCopied);
          });
        });

        card.querySelector(".btn-remove-fav").addEventListener("click", () => {
          storage.removeFavorite(item.id);
          toast.show(t.itemDeleted);
          this.openFavorites();
        });

        listEl.appendChild(card);
      });

      container.appendChild(listEl);
    }

    this.open("favorites-modal");
  },

  openExamples(examplesList) {
    const lang = this.getLang();
    const t = this.t[lang];
    const container = document.getElementById("examples-modal-body");

    if (!container) return;
    container.innerHTML = "";

    const listEl = document.createElement("div");
    listEl.className = "examples-grid";

    examplesList.forEach((ex) => {
      const profile = this.taskProfiles.find((p) => p.id === ex.typeId) || { name: { ar: ex.typeId, en: ex.typeId } };
      const profileName = profile.name[lang] || profile.name.en;
      const title = ex.title[lang] || ex.title.en;
      const desc = ex.description[lang] || ex.description.en;

      const card = document.createElement("div");
      card.className = "example-card";

      card.innerHTML = `
        <div class="example-card-header">
          <span class="badge badge-type">${profileName}</span>
          <span class="badge badge-level">${ex.style || "pro"}</span>
        </div>
        <h4 class="example-card-title">${title}</h4>
        <p class="example-card-desc">${desc}</p>
        <button class="btn btn-sm btn-primary btn-use-example">
          ${t.btnUseExample}
        </button>
      `;

      card.querySelector(".btn-use-example").addEventListener("click", () => {
        this.onUseExample(ex);
        this.close();
      });

      listEl.appendChild(card);
    });

    container.appendChild(listEl);
    this.open("examples-modal");
  },

  /**
   * Opens and populates the AI Provider & Model Settings dialog.
   * @param {Object} providerManager - The application's ProviderManager instance
   * @param {Function} [onSaved] - Callback invoked after settings are saved
   */
  async openAiSettings(providerManager, onSaved) {
    const lang = this.getLang();
    const t = this.t[lang];

    const providerSelect = document.getElementById("settings-provider-select");
    const vendorGroup = document.getElementById("settings-vendor-group");
    const vendorSelect = document.getElementById("settings-vendor-select");
    const customUrlGroup = document.getElementById("settings-custom-url-group");
    const customUrlInput = document.getElementById("settings-base-url");
    const modelSelect = document.getElementById("settings-model-select");
    const apiKeyGroup = document.getElementById("settings-api-key-group");
    const apiKeyInput = document.getElementById("settings-api-key");
    const btnToggleKey = document.getElementById("btn-toggle-key-visibility");
    const autoFallbackCheck = document.getElementById("settings-auto-fallback");
    const btnRefreshModels = document.getElementById("btn-refresh-models");
    const btnTestConn = document.getElementById("btn-test-provider-connection");
    const testResultBox = document.getElementById("test-connection-result");
    const btnSave = document.getElementById("btn-save-ai-settings");

    if (!providerSelect || !modelSelect) return;

    // Populate current values from providerManager
    const currentConfig = providerManager.config;
    providerSelect.value = currentConfig.activeProviderId;

    const activeProvider = providerManager.getActiveProvider();
    autoFallbackCheck.checked = !!currentConfig.enableAutoFallback;

    const syncUiVisibility = () => {
      const pId = providerSelect.value;
      if (pId === "openai_compatible") {
        vendorGroup.style.display = "block";
        const v = vendorSelect.value;
        customUrlGroup.style.display = v === "custom" ? "block" : "none";
        apiKeyGroup.style.display = "block";
      } else if (pId === "ollama" || pId === "deterministic_fallback") {
        vendorGroup.style.display = "none";
        customUrlGroup.style.display = "none";
        apiKeyGroup.style.display = "none";
      } else {
        // Pollinations
        vendorGroup.style.display = "none";
        customUrlGroup.style.display = "none";
        apiKeyGroup.style.display = "block";
      }
    };

    // Set vendor preset and keys if applicable
    if (activeProvider.id === "openai_compatible") {
      vendorSelect.value = activeProvider.vendorPreset || "groq";
      customUrlInput.value = activeProvider.baseUrl || "";
      apiKeyInput.value = activeProvider.apiKey || "";
    } else {
      apiKeyInput.value = activeProvider.apiKey || "";
    }

    syncUiVisibility();

    // Model loader
    const loadModels = async (forceRefresh = false) => {
      modelSelect.innerHTML = `<option value="">${lang === "ar" ? "جارٍ جلب النماذج المتاحة..." : "Loading available models..."}</option>`;
      modelSelect.disabled = true;

      try {
        const models = await providerManager.listModels(forceRefresh);
        modelSelect.innerHTML = "";
        models.forEach((m) => {
          const opt = document.createElement("option");
          opt.value = m.id;
          opt.textContent = `${m.name || m.id}${m.isFree ? " (Free)" : ""}${m.isLocal ? " [Local]" : ""}`;
          if (m.id === activeProvider.defaultModel) {
            opt.selected = true;
          }
          modelSelect.appendChild(opt);
        });
      } catch (err) {
        modelSelect.innerHTML = `<option value="${activeProvider.defaultModel}">${activeProvider.defaultModel}</option>`;
      } finally {
        modelSelect.disabled = false;
      }
    };

    await loadModels(false);

    // Event bindings
    providerSelect.onchange = () => {
      syncUiVisibility();
      providerManager.updateConfig({ activeProviderId: providerSelect.value });
      loadModels(true);
    };

    vendorSelect.onchange = () => {
      syncUiVisibility();
      if (vendorSelect.value !== "custom") {
        customUrlInput.value = "";
      }
      providerManager.updateConfig({
        activeProviderId: "openai_compatible",
        providers: {
          openai_compatible: {
            vendorPreset: vendorSelect.value,
            baseUrl: customUrlInput.value
          }
        }
      });
      loadModels(true);
    };

    btnRefreshModels.onclick = () => loadModels(true);

    btnToggleKey.onclick = () => {
      apiKeyInput.type = apiKeyInput.type === "password" ? "text" : "password";
      btnToggleKey.textContent = apiKeyInput.type === "password" ? "👁" : "🔒";
    };

    btnTestConn.onclick = async () => {
      btnTestConn.disabled = true;
      btnTestConn.innerHTML = `<span class="status-dot"></span> <span>${t.testingConnection}</span>`;
      testResultBox.className = "test-result-box";
      testResultBox.style.display = "none";

      try {
        const res = await providerManager.testActiveConnection();
        testResultBox.style.display = "block";
        if (res.ok) {
          testResultBox.className = "test-result-box success";
          testResultBox.textContent = res.message;
        } else {
          testResultBox.className = "test-result-box error";
          testResultBox.textContent = res.message;
        }
      } catch (err) {
        testResultBox.style.display = "block";
        testResultBox.className = "test-result-box error";
        testResultBox.textContent = err.message;
      } finally {
        btnTestConn.disabled = false;
        btnTestConn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span>${t.btnTestConnection}</span>
        `;
      }
    };

    btnSave.onclick = () => {
      const pId = providerSelect.value;
      const keyVal = apiKeyInput.value.trim();
      const modelVal = modelSelect.value || activeProvider.defaultModel;

      const patch = {
        activeProviderId: pId,
        enableAutoFallback: autoFallbackCheck.checked,
        providers: {}
      };

      if (pId === "pollinations") {
        patch.providers.pollinations = { apiKey: keyVal, defaultModel: modelVal };
      } else if (pId === "openai_compatible") {
        patch.providers.openai_compatible = {
          vendorPreset: vendorSelect.value,
          baseUrl: customUrlInput.value.trim(),
          apiKey: keyVal,
          defaultModel: modelVal
        };
      } else if (pId === "ollama") {
        patch.providers.ollama = { defaultModel: modelVal };
      }

      providerManager.updateConfig(patch);
      toast.show(lang === "ar" ? "تم حفظ إعدادات الذكاء الاصطناعي بنجاح" : "AI Settings saved successfully", "success");
      this.close();
      if (onSaved) onSaved();
    };

    this.open("ai-settings-modal");
  },

  /**
   * Opens the 3 Alternatives Display Modal.
   * @param {string} rawContent - The markdown output containing alternative sections
   * @param {Function} onSelectAlternative - Callback to load selected alternative into workspace
   */
  openAlternatives(rawContent, onSelectAlternative) {
    const lang = this.getLang();
    const t = this.t[lang];
    const container = document.getElementById("alternatives-modal-body");
    if (!container) return;

    container.innerHTML = "";

    // Parse the 3 alternatives by markdown headings (### Alternative ...)
    const sections = rawContent.split(/###\s+(?:Alternative|البديل)\s*[\d:A-Za-z\s\-]+/i).filter((s) => s.trim());
    const titles = [
      lang === "ar" ? "البديل الأول: الأسلوب الإجرائي المباشر" : "Alternative 1: Direct Procedural Approach",
      lang === "ar" ? "البديل الثاني: تقمص الدور التحليلي المتخصص" : "Alternative 2: Expert Persona & Reasoning",
      lang === "ar" ? "البديل الثالث: أسلوب القيود الصارمة والتحقق" : "Alternative 3: Constraint-First & Verification"
    ];

    const wrapEl = document.createElement("div");
    wrapEl.className = "alternatives-container";

    const parts = sections.length >= 3 ? sections : [rawContent];

    parts.forEach((partText, idx) => {
      const cleanPart = partText.trim();
      const card = document.createElement("div");
      card.className = "alternative-card";

      const title = titles[idx] || (lang === "ar" ? `البديل رقم ${idx + 1}` : `Alternative ${idx + 1}`);

      card.innerHTML = `
        <div class="alternative-card-header">
          <span class="alternative-card-title">${title}</span>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-sm btn-secondary btn-copy-alt">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              <span>${t.btnCopy}</span>
            </button>
            <button class="btn btn-sm btn-primary btn-select-alt">
              <span>${t.useAlternative}</span>
            </button>
          </div>
        </div>
        <pre class="alternative-content-pre">${this._escapeHtml(cleanPart)}</pre>
      `;

      card.querySelector(".btn-copy-alt").addEventListener("click", () => {
        navigator.clipboard.writeText(cleanPart);
        toast.show(t.btnCopied, "success");
      });

      card.querySelector(".btn-select-alt").addEventListener("click", () => {
        if (onSelectAlternative) onSelectAlternative(cleanPart);
        this.close();
      });

      wrapEl.appendChild(card);
    });

    container.appendChild(wrapEl);
    this.open("alternatives-modal");
  },

  /**
   * Opens the Evaluation Diagnostic Report Modal.
   * @param {Object} evalData - The evaluation payload from qualityEvaluator or pipeline
   * @param {Function} [onApply] - Callback when user clicks 'Apply Improvements'
   */
  openEvaluation(evalData, onApply) {
    const lang = this.getLang();
    const t = this.t[lang];
    const container = document.getElementById("evaluation-modal-body");
    const btnApply = document.getElementById("btn-apply-eval-improvements");
    if (!container) return;

    container.innerHTML = "";

    const score = evalData.score || 0;
    const ratingText = evalData.rating ? (evalData.rating[lang] || evalData.rating.en) : "";

    const heroEl = document.createElement("div");
    heroEl.className = "eval-score-hero";
    heroEl.innerHTML = `
      <div>
        <h4 style="font-size: 1.125rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem;">
          ${lang === "ar" ? "النتيجة التقديرية لجودة البرومبت" : "Overall Prompt Quality Score"}
        </h4>
        <span style="font-size: 0.8125rem; color: var(--text-secondary);">
          ${lang === "ar" ? "تقييم تحليلي عبر 6 أبعاد هندسية مع معايير قبول واضحة" : "Evaluated across 6 calibrated engineering dimensions with verification criteria"}
        </span>
      </div>
      <div style="text-align: end;">
        <span class="eval-score-huge">${score}%</span>
        <span style="display: block; font-size: 0.8125rem; font-weight: 600; color: var(--accent-primary);">${ratingText}</span>
      </div>
    `;

    const gridEl = document.createElement("div");
    gridEl.className = "eval-grid";

    // Strengths Box
    const strengthsBox = document.createElement("div");
    strengthsBox.className = "eval-box";
    const strengthsList = (evalData.strengths || []).map((s) => `<li>${this._escapeHtml(s[lang] || s.en || s)}</li>`).join("") || `<li>${lang === "ar" ? "لا توجد نقاط قوة كافية محددة بعد." : "No explicit strengths detected yet."}</li>`;
    strengthsBox.innerHTML = `
      <div class="eval-box-title green">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span>${lang === "ar" ? "نقاط القوة المحددة" : "Identified Strengths"}</span>
      </div>
      <ul class="eval-list">${strengthsList}</ul>
    `;

    // Weaknesses Box
    const weaknessesBox = document.createElement("div");
    weaknessesBox.className = "eval-box";
    const weaknessesList = (evalData.weaknesses || []).map((w) => `<li>${this._escapeHtml(w[lang] || w.en || w)}</li>`).join("") || `<li>${lang === "ar" ? "لا توجد عيوب جوهرية ظاهرة." : "No critical weaknesses identified."}</li>`;
    weaknessesBox.innerHTML = `
      <div class="eval-box-title amber">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>${lang === "ar" ? "نقاط الضعف والمعلومات المفقودة" : "Weaknesses & Missing Context"}</span>
      </div>
      <ul class="eval-list">${weaknessesList}</ul>
    `;

    gridEl.appendChild(strengthsBox);
    gridEl.appendChild(weaknessesBox);

    // Concrete Suggestions Box
    const suggestionsBox = document.createElement("div");
    suggestionsBox.className = "eval-box";
    suggestionsBox.style.marginTop = "1rem";
    const suggestionsList = (evalData.suggestions || []).map((s) => `<li>${this._escapeHtml(s[lang] || s.en || s)}</li>`).join("") || `<li>${lang === "ar" ? "البرومبت جاهز للاستخدام عالي الجودة." : "Prompt is ready for production use."}</li>`;
    suggestionsBox.innerHTML = `
      <div class="eval-box-title" style="color: var(--accent-primary);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4"/><path d="M12 18v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="m16.24 16.24 2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="m16.24 7.76 2.83-2.83"/></svg>
        <span>${lang === "ar" ? "خطة التوصيات العملية للتحسين الفوري" : "Actionable Improvement Roadmap"}</span>
      </div>
      <ul class="eval-list">${suggestionsList}</ul>
    `;

    container.appendChild(heroEl);
    container.appendChild(gridEl);
    container.appendChild(suggestionsBox);

    if (btnApply) {
      btnApply.onclick = () => {
        this.close();
        if (onApply) onApply();
      };
    }

    this.open("evaluation-modal");
  },

  _escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
};

