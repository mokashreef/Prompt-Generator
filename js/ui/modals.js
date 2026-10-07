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

  _escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
};
