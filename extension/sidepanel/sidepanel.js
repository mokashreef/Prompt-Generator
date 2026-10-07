/**
 * Prompt Generator - Chrome Side Panel Controller
 * Handles prompt transformation, DOM replacement, and history.
 * 100% Client-Side.
 */

import { actionTransformer, PROMPT_ACTIONS } from "../shared/engine/actionTransformer.js";
import { extTranslations } from "../shared/i18n.js";
import { diffViewer } from "../shared/diff.js";

class SidePanelApp {
  constructor() {
    this.currentLang = "ar";
    this.currentTheme = "dark";
    this.currentAction = "improve";
    this.isDiffVisible = false;
    this.activeTabId = null;

    this.init();
  }

  async init() {
    this._cacheDom();
    await this._loadPreferences();
    this._renderActionChips();
    this._bindEvents();
    this._listenToMessages();
    this._checkActiveSelection();
    this._loadHistory();
  }

  _cacheDom() {
    this.dom = {
      html: document.documentElement,
      langBtn: document.getElementById("sp-btn-lang"),
      langText: document.getElementById("sp-lang-text"),
      themeBtn: document.getElementById("sp-btn-theme"),
      tabs: document.querySelectorAll(".sp-tab"),
      views: document.querySelectorAll(".sp-view"),

      // Editor
      origInput: document.getElementById("sp-original-input"),
      origCount: document.getElementById("sp-orig-count"),
      btnClearOrig: document.getElementById("sp-btn-clear-orig"),
      actionsList: document.getElementById("sp-actions-list"),
      qualityBadge: document.getElementById("sp-quality-badge"),
      intentBadge: document.getElementById("sp-intent-badge"),
      impOutput: document.getElementById("sp-improved-output"),
      impCount: document.getElementById("sp-imp-count"),
      diffView: document.getElementById("sp-diff-view"),
      btnDiffToggle: document.getElementById("sp-btn-diff-toggle"),
      diffBtnText: document.getElementById("sp-diff-btn-text"),

      // Toolbar
      btnReplace: document.getElementById("sp-btn-replace"),
      btnCopy: document.getElementById("sp-btn-copy"),
      btnSwap: document.getElementById("sp-btn-swap"),

      // History
      historyList: document.getElementById("sp-history-list"),
      btnClearHistory: document.getElementById("sp-btn-clear-history"),

      // Toast
      toast: document.getElementById("sp-toast")
    };
  }

  async _loadPreferences() {
    try {
      const data = await chrome.storage.local.get(["promptgen_ext_lang", "promptgen_ext_theme"]);
      if (data.promptgen_ext_lang) this.currentLang = data.promptgen_ext_lang;
      if (data.promptgen_ext_theme) this.currentTheme = data.promptgen_ext_theme;
    } catch (e) {}

    this.applyLanguage(this.currentLang);
    this.applyTheme(this.currentTheme);
  }

  applyLanguage(lang) {
    this.currentLang = lang;
    chrome.storage.local.set({ promptgen_ext_lang: lang });

    this.dom.html.setAttribute("lang", lang);
    this.dom.html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    this.dom.langText.textContent = lang === "ar" ? "EN" : "عربي";

    const t = extTranslations[lang];

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (t[key]) el.textContent = t[key];
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (t[key]) el.setAttribute("placeholder", t[key]);
    });

    this._renderActionChips();
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    chrome.storage.local.set({ promptgen_ext_theme: theme });

    if (theme === "light") {
      this.dom.html.classList.remove("theme-dark");
      this.dom.html.classList.add("theme-light");
    } else {
      this.dom.html.classList.remove("theme-light");
      this.dom.html.classList.add("theme-dark");
    }
  }

  _renderActionChips() {
    const container = this.dom.actionsList;
    container.innerHTML = "";

    PROMPT_ACTIONS.forEach((action) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `sp-action-chip ${action.id === this.currentAction ? "active" : ""}`;
      btn.setAttribute("data-action-id", action.id);

      const name = action.name[this.currentLang] || action.name.en;
      btn.innerHTML = `<span>${action.icon}</span> <span>${name}</span>`;

      btn.addEventListener("click", () => {
        this.currentAction = action.id;
        document.querySelectorAll(".sp-action-chip").forEach((c) => c.classList.remove("active"));
        btn.classList.add("active");
        this.processTransformation();
      });

      container.appendChild(btn);
    });
  }

  _bindEvents() {
    this.dom.langBtn.addEventListener("click", () => {
      this.applyLanguage(this.currentLang === "ar" ? "en" : "ar");
    });

    this.dom.themeBtn.addEventListener("click", () => {
      this.applyTheme(this.currentTheme === "dark" ? "light" : "dark");
    });

    // Navigation Tabs
    this.dom.tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        this.dom.tabs.forEach((t) => t.classList.remove("active"));
        this.dom.views.forEach((v) => v.classList.remove("active"));

        tab.classList.add("active");
        const targetView = document.getElementById(`view-${tab.getAttribute("data-tab")}`);
        if (targetView) targetView.classList.add("active");
      });
    });

    // Live typing in original
    this.dom.origInput.addEventListener("input", () => {
      this._updateWordCounts();
      this.processTransformation();
    });

    // Live typing in improved output
    this.dom.impOutput.addEventListener("input", () => {
      this._updateWordCounts();
      if (this.isDiffVisible) this._renderDiff();
    });

    this.dom.btnClearOrig.addEventListener("click", () => {
      this.dom.origInput.value = "";
      this.dom.impOutput.value = "";
      this.dom.diffView.style.display = "none";
      this._updateWordCounts();
      this.dom.qualityBadge.textContent = "0%";
      this.dom.intentBadge.textContent = "-";
    });

    this.dom.btnCopy.addEventListener("click", () => this.handleCopy());
    this.dom.btnReplace.addEventListener("click", () => this.handleReplace());
    this.dom.btnSwap.addEventListener("click", () => this.handleSwap());

    this.dom.btnDiffToggle.addEventListener("click", () => this.toggleDiff());

    if (this.dom.btnClearHistory) {
      this.dom.btnClearHistory.addEventListener("click", async () => {
        const t = extTranslations[this.currentLang];
        if (confirm(t.confirmClearHistory)) {
          await chrome.storage.local.remove("promptgen_ext_history");
          this._loadHistory();
          this.showToast(t.historyEmpty);
        }
      });
    }
  }

  _listenToMessages() {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === "SELECTION_CHANGED" && message.text) {
        this.dom.origInput.value = message.text;
        if (message.tabId) this.activeTabId = message.tabId;
        this._updateWordCounts();
        this.processTransformation();
      }
    });
  }

  async _checkActiveSelection() {
    try {
      const data = await chrome.storage.local.get("promptgen_active_selection");
      if (data.promptgen_active_selection && data.promptgen_active_selection.text) {
        const item = data.promptgen_active_selection;
        this.dom.origInput.value = item.text;
        if (item.tabId) this.activeTabId = item.tabId;
        if (item.action) this.currentAction = item.action;
        this._updateWordCounts();
        this.processTransformation();
      }
    } catch (e) {}
  }

  processTransformation() {
    const text = this.dom.origInput.value;
    if (!text || !text.trim()) {
      this.dom.impOutput.value = "";
      this.dom.qualityBadge.textContent = "0%";
      this.dom.intentBadge.textContent = "-";
      return;
    }

    const result = actionTransformer.transform(text, this.currentAction, this.currentLang);

    this.dom.impOutput.value = result.improved;
    this.dom.qualityBadge.textContent = `${result.quality.score}%`;
    this.dom.intentBadge.textContent = result.intent.name[this.currentLang] || result.intent.name.en;

    this._updateWordCounts();
    if (this.isDiffVisible) this._renderDiff();

    // Save to local history (debounced)
    this._saveToHistory(text, result.improved, this.currentAction);
  }

  async handleReplace() {
    const newText = this.dom.impOutput.value;
    const t = extTranslations[this.currentLang];

    if (!newText || !newText.trim()) return;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        this.handleCopy();
        return;
      }

      // Send replace request to content script
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "REPLACE_SELECTION",
        newText
      });

      if (response && response.success) {
        this.showToast(t.btnReplaceSuccess);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(newText);
        this.showToast(t.btnReplaceUnavailable);
      }
    } catch (err) {
      // Content script unavailable (e.g. Chrome Web Store or chrome:// URLs)
      await navigator.clipboard.writeText(newText);
      this.showToast(t.btnReplaceUnavailable);
    }
  }

  async handleCopy() {
    const text = this.dom.impOutput.value;
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      this.showToast(extTranslations[this.currentLang].btnCopied);
    } catch (e) {
      // Fallback
      this.dom.impOutput.select();
      document.execCommand("copy");
      this.showToast(extTranslations[this.currentLang].btnCopied);
    }
  }

  handleSwap() {
    const orig = this.dom.origInput.value;
    const imp = this.dom.impOutput.value;

    this.dom.origInput.value = imp;
    this.dom.impOutput.value = orig;

    this._updateWordCounts();
    this.processTransformation();
  }

  toggleDiff() {
    this.isDiffVisible = !this.isDiffVisible;
    const t = extTranslations[this.currentLang];

    if (this.isDiffVisible) {
      this.dom.impOutput.style.display = "none";
      this.dom.diffView.style.display = "block";
      this.dom.diffBtnText.textContent = t.btnHideDiff;
      this._renderDiff();
    } else {
      this.dom.diffView.style.display = "none";
      this.dom.impOutput.style.display = "block";
      this.dom.diffBtnText.textContent = t.btnShowDiff;
    }
  }

  _renderDiff() {
    const orig = this.dom.origInput.value;
    const imp = this.dom.impOutput.value;
    this.dom.diffView.innerHTML = diffViewer.generateHtml(orig, imp);
  }

  _updateWordCounts() {
    const origText = this.dom.origInput.value.trim();
    const impText = this.dom.impOutput.value.trim();

    const origWords = origText ? origText.split(/\s+/).length : 0;
    const impWords = impText ? impText.split(/\s+/).length : 0;

    const t = extTranslations[this.currentLang];
    this.dom.origCount.textContent = `${origWords} ${t.words}`;
    this.dom.impCount.textContent = `${impWords} ${t.words}`;
  }

  async _saveToHistory(original, improved, action) {
    if (!original || !improved || original === improved) return;

    try {
      const data = await chrome.storage.local.get("promptgen_ext_history");
      const history = data.promptgen_ext_history || [];

      // Avoid immediate duplicates
      if (history.length > 0 && history[0].original === original && history[0].action === action) {
        return;
      }

      const item = {
        id: "h_" + Date.now(),
        original,
        improved,
        action,
        timestamp: Date.now()
      };

      const updated = [item, ...history.filter((h) => h.original !== original)].slice(0, 30);
      await chrome.storage.local.set({ promptgen_ext_history: updated });
      this._loadHistory();
    } catch (e) {}
  }

  async _loadHistory() {
    const container = this.dom.historyList;
    if (!container) return;

    try {
      const data = await chrome.storage.local.get("promptgen_ext_history");
      const history = data.promptgen_ext_history || [];

      container.innerHTML = "";

      if (history.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 1.5rem 0;">${extTranslations[this.currentLang].historyEmpty}</p>`;
        return;
      }

      history.forEach((item) => {
        const card = document.createElement("div");
        card.className = "sp-history-item";

        const actionObj = PROMPT_ACTIONS.find((a) => a.id === item.action) || { name: { ar: item.action, en: item.action } };
        const actionName = actionObj.name[this.currentLang] || actionObj.name.en;

        const timeStr = new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        card.innerHTML = `
          <div class="sp-history-meta">
            <span style="font-weight: 700; color: var(--accent-primary);">${actionName}</span>
            <span>${timeStr}</span>
          </div>
          <p class="sp-history-preview">${this._escape(item.original)}</p>
          <div class="sp-history-actions">
            <button class="sp-btn-ghost btn-h-load" style="font-weight: 600; color: var(--accent-primary);">فتح</button>
            <button class="sp-btn-ghost btn-h-copy">نسخ</button>
          </div>
        `;

        card.querySelector(".btn-h-load").addEventListener("click", () => {
          this.dom.origInput.value = item.original;
          this.dom.impOutput.value = item.improved;
          this.currentAction = item.action;
          this._renderActionChips();
          this._updateWordCounts();
          // Switch to Editor tab
          document.querySelector('.sp-tab[data-tab="editor"]').click();
        });

        card.querySelector(".btn-h-copy").addEventListener("click", () => {
          navigator.clipboard.writeText(item.improved).then(() => {
            this.showToast(extTranslations[this.currentLang].btnCopied);
          });
        });

        container.appendChild(card);
      });
    } catch (e) {}
  }

  showToast(msg) {
    const toast = this.dom.toast;
    toast.textContent = msg;
    toast.classList.add("visible");
    setTimeout(() => {
      toast.classList.remove("visible");
    }, 2200);
  }

  _escape(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new SidePanelApp();
});
