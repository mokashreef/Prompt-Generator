# Privacy Policy - Prompt Generator Chrome Extension

**Last Updated:** October 2026

## Overview
Prompt Generator ("PromptGen") is an offline-first browser extension designed for local prompt engineering, prompt enhancement, and prompt structuring.

### 1. Data Collection & Processing
* **Zero External Telemetry:** Prompt Generator does **not** collect, store, transmit, or share any personal data, browsing history, or prompt text to any remote server or third-party service.
* **No AI Cloud APIs:** The extension does **not** make network calls to OpenAI, Anthropic, Google Gemini, or any other external AI service. All prompt enhancements, rewrites, and formatting happen 100% locally in your browser's V8 JavaScript engine.
* **No Remote Code:** The extension operates exclusively using self-contained local scripts packaged within the extension archive. It adheres strictly to Chrome Web Store Manifest V3 guidelines prohibiting remote code execution.

### 2. Permissions & Usage
The extension requests only the minimum set of permissions necessary to function:
* `contextMenus`: Used to display the "Improve Prompt / تحسين البرومبت" action when right-clicking selected text.
* `sidePanel`: Used to display the side-by-side prompt editor in the browser's native Side Panel.
* `storage`: Used solely to persist your local preferences (such as Dark/Light mode and Arabic/English language) and your local history on your own machine via `chrome.storage.local`.
* `activeTab` & `scripting`: Used only upon explicit user action to read selected text and safely insert improved prompt text into the active editable field without page reloading.

### 3. Local Storage & Retention
* Any prompt history stored by the extension remains strictly on your local device.
* You can clear your entire local prompt history at any time with a single click in the extension's History tab.

### 4. Third-Party Services
Prompt Generator does not integrate with any analytics services, advertising networks, or user tracking SDKs.

### 5. Contact & Open Source
Prompt Generator was designed and developed by Mohammad Abu Khashreef as part of the Code Elta6ur ecosystem.
* Developer: [Mohammad Abu Khashreef](https://github.com/mokashreef)
* Repository: [Prompt Generator on GitHub](https://github.com/mokashreef/prompt-generator)

