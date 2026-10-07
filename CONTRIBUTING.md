# Contributing to Prompt Generator

Thank you for your interest in contributing to **Prompt Generator**!

Prompt Generator is an open-source, privacy-first prompt engineering tool developed by **Mohammad Abu Khashreef** as part of the **Code Elta6ur** ecosystem.

---

## 🔒 Core Guiding Principles

When proposing any modification or new feature, please observe these inviolable principles:
1. **Zero External AI APIs:** All transformations, heuristics, and quality checks must remain strictly 100% local inside the browser. No OpenAI, Claude, Gemini, or remote API calls.
2. **Zero Backend & Telemetry:** No user tracking, analytics, or remote data persistence.
3. **Dual Compatibility:** Any change to core prompt logic must maintain compatibility between the web application (`js/engine/`) and the Chrome Extension (`extension/shared/engine/`).
4. **Bilingual Support:** All UI additions must support both Arabic (RTL) and English (LTR).

---

## 🛠️ Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/mokashreef/Prompt-Generator.git
   cd Prompt-Generator
   ```

2. Run the test suite:
   ```bash
   npm test
   ```

3. Launch a local development server:
   ```bash
   # Using Python
   python -m http.server 8080

   # Or using Node / npx
   npx serve -l 8080 .
   ```

4. Load the Chrome Extension:
   - Navigate to `chrome://extensions` in Google Chrome.
   - Enable **Developer mode**.
   - Click **Load unpacked** and select the `extension/` directory.

---

## 🧪 Testing Guidelines

Before opening a pull request:
- Run `npm test` to ensure all 11 action transformations and quality scoring checks pass.
- Test both Dark and Light themes.
- Test in-page text replacement in Chrome Extension across input elements and contenteditable containers.

---

## 📜 Submitting a Pull Request

1. Fork the repo and create your feature branch: `git checkout -b feature/my-enhancement`.
2. Commit your changes: `git commit -m 'Add new feature'`.
3. Push to the branch: `git push origin feature/my-enhancement`.
4. Open a Pull Request on GitHub.
