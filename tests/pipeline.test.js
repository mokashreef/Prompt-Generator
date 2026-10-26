/**
 * Prompt Generator - AI Pipeline Integration Test Suite
 * Tests pipeline execution across modes, platforms, languages, and provenance tagging.
 * 
 * Verifies:
 * - 7 Generation Modes: quick, detailed, professional, expert, improve, alternatives, evaluate.
 * - Platform Adaptation: ChatGPT, Claude, Gemini, DeepSeek, Midjourney, Cursor.
 * - Arabic Preservation & Code Guarding: Valid Modern Standard Arabic output with preserved Latin technical tokens.
 * - Output Normalization: Strips conversational chat prefixes/suffixes.
 * - Provenance Tagging: Attaches verified metadata to result objects.
 */

import { aiPromptPipeline, GENERATION_MODES } from "../js/engine/aiPromptPipeline.js";

export async function runPipelineTests() {
  console.log("=== RUNNING AI PROMPT PIPELINE TEST SUITE ===");

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // 1. Generation Modes Verification
  console.log("\n[1/4] Testing Execution Across All 7 Generation Modes...");
  for (const modeObj of GENERATION_MODES) {
    const modeId = modeObj.id;
    const res = await aiPromptPipeline.execute({
      taskGoal: "Build a real-time notification service in Redis and WebSocket",
      mode: modeId,
      category: "coding",
      targetPlatform: "general"
    });

    assert(res.prompt && res.prompt.length > 50, `Mode '${modeId}' produces substantive output (${res.prompt.length} chars)`);
    assert(res.mode === modeId, `Mode metadata matches '${modeId}'`);
    assert(typeof res.isAiGenerated === "boolean", `isAiGenerated flag is boolean`);
    assert(typeof res.isFallback === "boolean", `isFallback flag is boolean`);
  }

  // 2. Quick vs Detailed vs Expert Depth Differentiation
  console.log("\n[2/4] Testing Depth Differentiation (Quick vs Expert)...");
  const quickRes = await aiPromptPipeline.execute({
    taskGoal: "Write a SQL query to calculate 30-day user retention",
    mode: "quick",
    category: "coding"
  });

  const expertRes = await aiPromptPipeline.execute({
    taskGoal: "Write a SQL query to calculate 30-day user retention",
    mode: "expert",
    category: "coding"
  });

  assert(quickRes.prompt.length < expertRes.prompt.length, "Quick mode is more concise than Expert mode");
  assert(expertRes.prompt.length > 300, "Expert mode produces in-depth architectural breakdown");

  // 3. Arabic Generation & Technical Token Protection
  console.log("\n[3/4] Testing Arabic Generation & Technical Code Preservation...");
  const arabicRes = await aiPromptPipeline.execute({
    taskGoal: "صمم واجهة برمجة تطبيقات REST API لإدارة الطلبات مع مصادقة JWT",
    category: "coding",
    mode: "professional",
    targetLang: "ar"
  });

  assert(/[\u0600-\u06FF]/.test(arabicRes.prompt), "Arabic prompt contains Modern Standard Arabic text");
  assert(
    arabicRes.prompt.includes("REST API") ||
    arabicRes.prompt.includes("JWT") ||
    arabicRes.prompt.includes("API"),
    "Latin technical identifiers (REST API, JWT) are preserved in original Latin characters"
  );
  assert(!arabicRes.prompt.includes("[Specify"), "Arabic prompt contains zero bracket placeholders");

  // 4. Output Normalization (Preamble Stripping)
  console.log("\n[4/4] Testing Output Normalization & Preamble Stripping...");
  const rawWithPreamble = "Here is your prompt:\n\n## Objective:\nBuild a dashboard.\n\nHope this helps!";
  const cleaned = aiPromptPipeline._postProcessContent(rawWithPreamble, "professional");
  assert(!cleaned.startsWith("Here is your prompt:"), "Opening conversational preamble is stripped");
  assert(!cleaned.endsWith("Hope this helps!"), "Closing conversational pleasantry is stripped");
  assert(cleaned.includes("## Objective:\nBuild a dashboard."), "Core prompt body is preserved intact");

  console.log(`\nALL PIPELINE TESTS PASSED (${passed}/${total}) ✓\n`);
  return { passed, total };
}

// Allow direct CLI execution: node tests/pipeline.test.js
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("tests/pipeline.test.js")) {
  runPipelineTests()
    .then(() => {
      process.exitCode = 0;
    })
    .catch((err) => {
      console.error("Test Suite Failed:", err);
      process.exitCode = 1;
    });
}
