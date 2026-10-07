/**
 * Prompt Generator - Quick Popup Controller
 * 100% Client-Side.
 */

import { actionTransformer, PROMPT_ACTIONS } from "../shared/engine/actionTransformer.js";
import { extTranslations } from "../shared/i18n.js";

class PopupApp {
  constructor() {
    this.currentLang = "ar";
    this.currentTheme = "dark";
    this.currentAction = "improve";

    this.init();
  }

  async init() {
    this._cacheDom();
    await this._loadPreferences();
    this._renderActionChips();
    this._bindEvents();
    this._fetchActiveSelection();
  }

  _cacheDom() {
    this.dom = {
      html: document.documentElement,
      langBtn: document.getElementById("pop-btn-lang"),
      langText: document.getElementById("pop-lang-text"),
      btnOpenSidepanel: document.getElementById("pop-btn-open-sidepanel"),
      input: document.getElementById("pop-input"),
      actionsList: document.getElementById("pop-actions-list"),
      btnImprove: document.getElementById("pop-btn-improve"),
      btnClear: document.getElementById("pop-btn-clear"),
      outputSection: document.getElementById("pop-output-section"),
      output: document.getElementById("pop-output"),
      qualityBadge: document.getElementById("pop-quality-badge"),
      btnReplace: document.getElementById("pop-btn-replace"),
      btnCopy: document.getElementById("pop-btn-copy"),
      toast: document.getElementById("pop-toast")
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

    PROMPT_ACTIONS.slice(0, 6).forEach((action) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `popup-action-chip ${action.id === this.currentAction ? "active" : ""}`;
      const name = action.name[this.currentLang] || action.name.en;
      btn.innerHTML = `<span>${action.icon}</span> <span>${name}</span>`;

      btn.addEventListener("click", () => {
        this.currentAction = action.id;
        document.querySelectorAll(".popup-action-chip").forEach((c) => c.classList.remove("active"));
        btn.classList.add("active");
        if (this.dom.input.value.trim()) {
          this.handleProcess();
        }
      });

      container.appendChild(btn);
    });
  }

  _bindEvents() {
    this.dom.langBtn.addEventListener("click", () => {
      this.applyLanguage(this.currentLang === "ar" ? "en" : "ar");
    });

    this.dom.btnOpenSidepanel.addEventListener("click", async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.id && chrome.sidePanel && typeof chrome.sidePanel.open === "function") {
          await chrome.sidePanel.open({ tabId: tab.id });
          window.close();
        }
      } catch (e) {}
    });

    this.dom.btnImprove.addEventListener("click", () => this.handleProcess());

    this.dom.btnClear.addEventListener("click", () => {
      this.dom.input.value = "";
      this.dom.outputSection.style.display = "none";
    });

    this.dom.btnCopy.addEventListener("click", () => this.handleCopy());
    this.dom.btnReplace.addEventListener("click", () => this.handleReplace());
  }

  async _fetchActiveSelection() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        const response = await chrome.tabs.sendMessage(tab.id, { type: "GET_SELECTION" });
        if (response && response.text) {
          this.dom.input.value = response.text;
          this.handleProcess();
        }
      }
    } catch (e) {}
  }

  handleProcess() {
    const text = this.dom.input.value.trim();
    if (!text) return;

    const result = actionTransformer.transform(text, this.currentAction, this.currentLang);

    this.dom.output.value = result.improved;
    this.dom.qualityBadge.textContent = `${result.quality.score}%`;
    this.dom.outputSection.style.display = "flex";
  }

  async handleReplace() {
    const newText = this.dom.output.value;
    const t = extTranslations[this.currentLang];
    if (!newText) return;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        this.handleCopy();
        return;
      }

      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "REPLACE_SELECTION",
        newText
      });

      if (response && response.success) {
        this.showToast(t.btnReplaceSuccess);
      } else {
        await navigator.clipboard.writeText(newText);
        this.showToast(t.btnReplaceUnavailable);
      }
    } catch (err) {
      await navigator.clipboard.writeText(newText);
      this.showToast(t.btnReplaceUnavailable);
    }
  }

  async handleCopy() {
    const text = this.dom.output.value;
    if (!text) return;

    await navigator.clipboard.writeText(text);
    this.showToast(extTranslations[this.currentLang].btnCopied);
  }

  showToast(msg) {
    const toast = this.dom.toast;
    toast.textContent = msg;
    toast.classList.add("visible");
    setTimeout(() => {
      toast.classList.remove("visible");
    }, 2000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new PopupApp();
});
