# Changelog

All notable changes to **Prompt Generator** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Custom user-defined rule modules for task profiles.
- Export prompt templates as reusable JSON recipes.

---

## [1.0.0] - 2026-10-08

### Added
- **Core Prompt Engine:** 100% client-side deterministic prompt architecture engine with bespoke task profiles and zero external AI API dependencies.
- **Intent Detection System:** Real-time intent classification (Create, Analyze, Teach, Compare, Rewrite, Research).
- **Quality Evaluation Score:** Concrete structural evaluator (0–100%) calculating scores based on goal clarity, context, deliverable format, guardrails, and constraints.
- **Chrome Extension (Manifest V3):**
  - Chrome Side Panel integration for long-form prompt comparison and editing.
  - Quick popup utility for fast toolbar prompt generation.
  - Selection context menu ("Improve Prompt / تحسين البرومبت").
  - Universal safe in-page text replacement (`textarea`, `input`, `contenteditable` for ChatGPT, Claude, Gemini, Notion).
  - 11 distinct prompt transformation actions (Improve, Rewrite, Specific, Detailed, Concise, Fix Structure, Add Constraints, Output Format, Professional, Simplify, Translate).
  - In-browser visual diff viewer highlighting line and word modifications.
  - Dedicated keyboard shortcut (`Ctrl+Shift+P`).
  - Direct extension package download (`.zip`) from the web interface.
- **Bilingual & Responsive Interface:** Full Arabic (RTL) and English (LTR) language support with persistent Dark and Light theme modes.
- **Local Persistence:** Local storage and `chrome.storage.local` support for prompt history and bookmarked favorites.
- **PWA & Offline Capability:** Progressive Web App service worker caching static assets for offline execution.
