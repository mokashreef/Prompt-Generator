# Prompt Generator - Chrome Extension (Manifest V3)

> **Professional In-Browser Prompt Engineering Tool**  
> 100% Offline • Zero AI APIs • Zero Remote Backend • Manifest V3 Compliant

---

## 🚀 Features

- **Context Menu Integration:** Select any prompt in ChatGPT, Claude, Gemini, or any webpage, right-click, and select **"Improve Prompt / تحسين البرومبت"**.
- **Chrome Side Panel:** Advanced side-by-side prompt editor (Original vs Improved) with live word counts, quality score, and direct in-page text replacement.
- **Quick Toolbar Popup:** Clean, minimalist developer utility popup for rapid prompt pasting and generation.
- **11 Specialized Actions:**
  1. `Improve Prompt` (تحسين شامل)
  2. `Rewrite Prompt` (إعادة صياغة)
  3. `Make Specific` (أكثر تحديداً)
  4. `Make Detailed` (مفصل وشامل)
  5. `Make Concise` (اختصار وإيجاز)
  6. `Fix Structure` (إصلاح الهيكل)
  7. `Add Constraints` (إضافة قيود)
  8. `Output Format` (صيغة المخرجات)
  9. `Professional` (جعله احترافياً)
  10. `Simplify` (تبسيط الأسلوب)
  11. `Translate` (ترجمة البرومبت)
- **Safe In-Page Text Replacement:** Works universally with `textarea`, `input`, and `contenteditable` (including modern reactive editors used in ChatGPT and Claude) without breaking document state.
- **Visual Diff Viewer:** See precise line and word-level modifications instantly.
- **Quality Score Evaluator:** Deterministic structural scoring (0–100%) based on goal specificity, context, deliverables, and operational guardrails.
- **Zero Hallucinated Facts:** Uses explicit placeholders like `[Target Audience]` and `[Preferred Technology]` instead of inventing false assumptions.
- **Bilingual & Responsive:** Full Arabic (RTL) and English (LTR) support with Dark & Light theme toggling.
- **Local History:** Fully private history stored in `chrome.storage.local`.

---

## 🛠️ How to Load as Unpacked Extension in Chrome

1. Open **Google Chrome** (version 116 or newer recommended for full Side Panel support).
2. In the URL address bar, enter: `chrome://extensions`
3. In the top-right corner, toggle on **Developer mode** (وضع مطوّر البرامج).
4. Click the **Load unpacked** (تحميل حزمة غير مضغوطة) button in the top-left toolbar.
5. In the file picker, select the `extension` folder inside this repository:
   ```
   d:/my projects/Prompt Generator/extension
   ```
6. The extension is now installed and active! Pin it to your Chrome toolbar for instant access.

---

## ⌨️ Keyboard Shortcut

- Default shortcut: `Ctrl + Shift + P` (or `Command + Shift + P` on macOS).
- To customize the shortcut, navigate to `chrome://extensions/shortcuts` in Chrome.

---

## 🔒 Security & Chrome Web Store Readiness

- **Manifest V3:** Fully complies with modern Chrome extensions architecture.
- **Zero Remote Code:** Contains no `eval()`, `new Function()`, or remotely hosted scripts.
- **Minimal Permissions:** Only requests `contextMenus`, `sidePanel`, `storage`, `activeTab`, and `scripting`.
- **Privacy:** Detailed in [`PRIVACY.md`](./PRIVACY.md).

---

## 👨‍💻 Credits & Attribution

Designed and developed by **[Mohammad Abu Khashreef](https://github.com/mokashreef)** as part of the **Code Elta6ur** ecosystem.  
*تمت برمجة وتصميم المشروع بواسطة محمد أبو خشريف، وهو جزء من منظومة كود التطور.*

