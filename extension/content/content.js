/**
 * Prompt Generator - Lightweight Content Script
 * Handles universal text selection and safe in-page replacement across all websites
 * (including ChatGPT, Claude, Gemini, and standard web forms).
 * Zero persistent UI injection, minimal memory footprint.
 */

(() => {
  // Store reference to last active editable element
  let lastActiveElement = null;

  document.addEventListener("selectionchange", () => {
    const active = document.activeElement;
    if (active && (active.tagName === "TEXTAREA" || active.tagName === "INPUT" || active.isContentEditable)) {
      lastActiveElement = active;
    }
  }, { passive: true });

  document.addEventListener("focusin", (e) => {
    if (e.target && (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT" || e.target.isContentEditable)) {
      lastActiveElement = e.target;
    }
  }, { passive: true });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_SELECTION") {
      const selectionData = getSelectedTextInfo();
      sendResponse(selectionData);
      return true;
    }

    if (message.type === "REPLACE_SELECTION") {
      const result = replaceSelectedText(message.newText);
      sendResponse(result);
      return true;
    }
  });

  /**
   * Retrieves selected text and determines if it is safely editable
   */
  function getSelectedTextInfo() {
    const active = lastActiveElement || document.activeElement;

    // 1. Textarea or Input element
    if (active && (active.tagName === "TEXTAREA" || (active.tagName === "INPUT" && /^(text|search|url)$/i.test(active.type)))) {
      const start = active.selectionStart;
      const end = active.selectionEnd;
      if (typeof start === "number" && typeof end === "number" && start !== end) {
        return {
          text: active.value.substring(start, end),
          isEditable: true,
          canReplace: true
        };
      }
      // If no partial selection, check if entire field has value
      if (active.value && active.value.trim()) {
        return {
          text: active.value,
          isEditable: true,
          canReplace: true
        };
      }
    }

    // 2. Contenteditable container (ProseMirror / Slate / Lexical in ChatGPT/Claude/Gemini)
    if (active && active.isContentEditable) {
      const sel = window.getSelection();
      if (sel && sel.toString().trim()) {
        return {
          text: sel.toString(),
          isEditable: true,
          canReplace: true
        };
      }
      if (active.innerText && active.innerText.trim()) {
        return {
          text: active.innerText,
          isEditable: true,
          canReplace: true
        };
      }
    }

    // 3. Plain window text selection (e.g. from an article or static page)
    const sel = window.getSelection();
    if (sel && sel.toString().trim()) {
      return {
        text: sel.toString(),
        isEditable: false,
        canReplace: false
      };
    }

    return {
      text: "",
      isEditable: false,
      canReplace: false
    };
  }

  /**
   * Safely replaces selected text within the page without breaking web frameworks
   */
  function replaceSelectedText(newText) {
    if (typeof newText !== "string") {
      return { success: false, reason: "invalid_text" };
    }

    const active = lastActiveElement || document.activeElement;

    try {
      // 1. Standard Input or Textarea
      if (active && (active.tagName === "TEXTAREA" || active.tagName === "INPUT")) {
        const start = active.selectionStart;
        const end = active.selectionEnd;

        active.focus();

        if (typeof active.setRangeText === "function") {
          active.setRangeText(newText, start, end, "end");
        } else {
          const val = active.value;
          active.value = val.substring(0, start) + newText + val.substring(end);
        }

        // Trigger input/change events for React, Vue, Svelte reactivity
        active.dispatchEvent(new Event("input", { bubbles: true }));
        active.dispatchEvent(new Event("change", { bubbles: true }));
        return { success: true };
      }

      // 2. ContentEditable Container (ChatGPT / Claude / Notion / Google Docs)
      if (active && active.isContentEditable) {
        active.focus();
        const sel = window.getSelection();

        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          range.deleteContents();
          const textNode = document.createTextNode(newText);
          range.insertNode(textNode);

          // Move cursor to end of inserted text
          range.setStartAfter(textNode);
          range.setEndAfter(textNode);
          sel.removeAllRanges();
          sel.addRange(range);

          // Dispatch input event so state updates
          active.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: newText }));
          return { success: true };
        }

        // Fallback for full editable replacement
        document.execCommand("insertText", false, newText);
        active.dispatchEvent(new Event("input", { bubbles: true }));
        return { success: true };
      }

      // If text selection exists in document range
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && sel.anchorNode && sel.anchorNode.parentElement && sel.anchorNode.parentElement.isContentEditable) {
        document.execCommand("insertText", false, newText);
        return { success: true };
      }

      return { success: false, reason: "not_editable" };
    } catch (e) {
      console.warn("[Prompt Generator] Replace error:", e);
      return { success: false, reason: e.message };
    }
  }
})();
