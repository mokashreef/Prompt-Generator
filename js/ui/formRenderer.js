/**
 * Prompt Generator - Reactive Dynamic Form Renderer
 * Renders task profile fields and handles progressive guidance & live input events.
 */

export const formRenderer = {
  container: null,
  currentProfile: null,
  currentLang: "ar",
  onChangeCallback: null,

  init(containerEl, onChange) {
    this.container = containerEl;
    this.onChangeCallback = onChange;
  },

  /**
   * Renders the dynamic form for a given profile
   * @param {Object} profile
   * @param {string} lang - 'ar' | 'en'
   * @param {Object} initialValues - Optional pre-filled field values
   */
  render(profile, lang = "ar", initialValues = {}) {
    this.currentProfile = profile;
    this.currentLang = lang;

    if (!this.container) return;

    this.container.innerHTML = "";

    const form = document.createElement("form");
    form.id = "dynamic-task-form";
    form.className = "dynamic-form";
    form.setAttribute("autocomplete", "off");
    form.onsubmit = (e) => e.preventDefault();

    profile.fields.forEach((field) => {
      const fieldGroup = document.createElement("div");
      fieldGroup.className = "form-group";
      fieldGroup.setAttribute("data-field-id", field.id);

      const label = document.createElement("label");
      label.setAttribute("for", `field-${field.id}`);
      label.className = "form-label";

      const labelText = field.label[lang] || field.label.en;
      label.innerHTML = `
        <span class="label-text">${labelText}</span>
        ${field.required ? `<span class="badge-required" title="${lang === 'ar' ? 'مطلوب' : 'Required'}">*</span>` : `<span class="badge-optional">${lang === 'ar' ? 'اختياري' : 'optional'}</span>`}
      `;

      fieldGroup.appendChild(label);

      const val = initialValues[field.id] !== undefined ? initialValues[field.id] : "";

      if (field.type === "textarea") {
        const textarea = document.createElement("textarea");
        textarea.id = `field-${field.id}`;
        textarea.name = field.id;
        textarea.className = "form-control form-textarea";
        textarea.rows = field.rows || 3;
        textarea.placeholder = field.placeholder ? (field.placeholder[lang] || field.placeholder.en) : "";
        textarea.value = val;
        if (field.required) textarea.setAttribute("required", "true");

        textarea.addEventListener("input", () => {
          textarea.style.height = "auto";
          textarea.style.height = `${Math.min(textarea.scrollHeight + 2, 400)}px`;
          this._handleFieldChange();
        });

        fieldGroup.appendChild(textarea);
      } else {
        const input = document.createElement("input");
        input.type = "text";
        input.id = `field-${field.id}`;
        input.name = field.id;
        input.className = "form-control form-input";
        input.placeholder = field.placeholder ? (field.placeholder[lang] || field.placeholder.en) : "";
        input.value = val;
        if (field.required) input.setAttribute("required", "true");

        input.addEventListener("input", () => {
          this._handleFieldChange();
        });

        fieldGroup.appendChild(input);
      }

      // Helper text
      if (field.helper) {
        const helper = document.createElement("div");
        helper.className = "form-helper";
        helper.textContent = field.helper[lang] || field.helper.en;
        fieldGroup.appendChild(helper);
      }

      // Progressive Nudge container
      const nudgeEl = document.createElement("div");
      nudgeEl.id = `nudge-${field.id}`;
      nudgeEl.className = "nudge-box";
      nudgeEl.style.display = "none";
      fieldGroup.appendChild(nudgeEl);

      form.appendChild(fieldGroup);
    });

    this.container.appendChild(form);
  },

  _handleFieldChange() {
    this._checkProgressiveNudges();
    if (typeof this.onChangeCallback === "function") {
      this.onChangeCallback(this.getValues());
    }
  },

  _checkProgressiveNudges() {
    if (!this.currentProfile || !this.currentProfile.progressiveNudges) return;

    const values = this.getValues();
    const primaryText = (values.goal || values.task_objective || "").toLowerCase();

    this.currentProfile.progressiveNudges.forEach((nudge) => {
      const nudgeEl = this.container.querySelector(`#nudge-${nudge.targetField}`);
      if (!nudgeEl) return;

      const matches = nudge.triggerWords.some((word) => primaryText.includes(word.toLowerCase()));
      const targetVal = values[nudge.targetField];

      // Show nudge only if triggered and target field is empty
      if (matches && (!targetVal || targetVal.trim().length === 0)) {
        const suggestionText = this.currentLang === "ar" ? nudge.promptSuggestionAr : nudge.promptSuggestionEn;
        nudgeEl.innerHTML = `
          <div class="nudge-content">
            <span class="nudge-icon">💡</span>
            <span class="nudge-text">${suggestionText}</span>
          </div>
        `;
        nudgeEl.style.display = "block";
      } else {
        nudgeEl.style.display = "none";
      }
    });
  },

  getValues() {
    if (!this.container || !this.currentProfile) return {};

    const values = {};
    this.currentProfile.fields.forEach((field) => {
      const el = this.container.querySelector(`#field-${field.id}`);
      if (el) {
        values[field.id] = el.value.trim();
      }
    });

    return values;
  },

  setValues(values = {}) {
    if (!this.container || !this.currentProfile) return;

    this.currentProfile.fields.forEach((field) => {
      const el = this.container.querySelector(`#field-${field.id}`);
      if (el && values[field.id] !== undefined) {
        el.value = values[field.id];
        if (el.tagName.toLowerCase() === "textarea") {
          el.style.height = "auto";
          el.style.height = `${Math.min(el.scrollHeight + 2, 400)}px`;
        }
      }
    });

    this._checkProgressiveNudges();
  },

  clear() {
    if (!this.container || !this.currentProfile) return;

    this.currentProfile.fields.forEach((field) => {
      const el = this.container.querySelector(`#field-${field.id}`);
      if (el) {
        el.value = "";
        if (el.tagName.toLowerCase() === "textarea") {
          el.style.height = "";
        }
      }
    });

    this.container.querySelectorAll(".nudge-box").forEach((n) => (n.style.display = "none"));
    if (typeof this.onChangeCallback === "function") {
      this.onChangeCallback({});
    }
  },

  validateRequired() {
    if (!this.currentProfile) return true;

    let hasEmptyRequired = false;
    this.currentProfile.fields.forEach((field) => {
      if (field.required) {
        const el = this.container.querySelector(`#field-${field.id}`);
        if (el && !el.value.trim()) {
          hasEmptyRequired = true;
          el.classList.add("input-error");
          setTimeout(() => el.classList.remove("input-error"), 2500);
        }
      }
    });

    return !hasEmptyRequired;
  }
};
