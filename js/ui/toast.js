/**
 * Prompt Generator - Toast Notification System
 * Accessible, lightweight, zero dependencies.
 */

export const toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "toast-container";
      this.container.className = "toast-container";
      this.container.setAttribute("role", "status");
      this.container.setAttribute("aria-live", "polite");
      document.body.appendChild(this.container);
    }
  },

  show(message, type = "success", duration = 3000) {
    this.init();

    const toastEl = document.createElement("div");
    toastEl.className = `toast toast-${type}`;

    let iconSvg = "";
    if (type === "success") {
      iconSvg = `<svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === "error") {
      iconSvg = `<svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    } else {
      iconSvg = `<svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toastEl.innerHTML = `
      ${iconSvg}
      <span class="toast-message">${message}</span>
    `;

    this.container.appendChild(toastEl);

    // Trigger enter animation
    requestAnimationFrame(() => {
      toastEl.classList.add("toast-visible");
    });

    // Auto dismiss
    setTimeout(() => {
      toastEl.classList.remove("toast-visible");
      toastEl.classList.add("toast-leaving");
      setTimeout(() => {
        if (toastEl.parentNode) {
          toastEl.parentNode.removeChild(toastEl);
        }
      }, 300);
    }, duration);
  }
};
