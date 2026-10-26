/**
 * Prompt Generator - Quality Evaluator Test Suite
 * Tests multi-dimensional evaluation rubric, domain calibration, and anti-pattern detection.
 * 
 * Verifies:
 * - 6-Dimension Rubric: Objective clarity, context, specificity, constraints, deliverable format, acceptance criteria.
 * - Anti-Pattern Penalties: Unfulfilled placeholders (e.g. "[Specify ...]") penalize scores.
 * - Domain Calibration: Visual image criteria differs from software coding criteria.
 * - Arabic & English Diagnostics: Returns localized strengths, weaknesses, and actionable advice.
 */

import { qualityEvaluator } from "../js/engine/qualityEvaluator.js";

export function runEvaluatorTests() {
  console.log("=== RUNNING QUALITY EVALUATOR TEST SUITE ===");

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

  // 1. Empty Input Handling
  console.log("\n[1/4] Testing Empty & Minimal Inputs...");
  const emptyRes = qualityEvaluator.evaluate({ promptText: "" });
  assert(emptyRes.score === 0, "Empty prompt scores 0");
  assert(emptyRes.rating.en === "Empty", "Rating for empty prompt is 'Empty'");

  // 2. High-Quality Comprehensive Prompt
  console.log("\n[2/4] Testing High-Quality Production Prompt...");
  const highQualityText = `
## 1. Objective:
Build a resilient rate limiter middleware in Go using a Token Bucket algorithm backed by Redis.

## 2. Requirements & Context:
- Target throughput: 25,000 requests/second per node with sub-millisecond p99 latency.
- Handle Redis connection drops gracefully via local in-memory fallback.
- Follow SOLID and clean architecture principles.

## 3. Constraints:
- Do not use external third-party rate-limiting frameworks; implement the Token Bucket directly.
- Avoid memory leaks; clean up stale client buckets every 10 minutes.

## 4. Deliverable Format:
- Executable Go package with unit tests and a benchmark test.

## 5. Acceptance Criteria:
- Must pass race detector tests ('go test -race ./...').
- Zero goroutine leaks under continuous load.
`;

  const highRes = qualityEvaluator.evaluate({
    typeId: "coding",
    promptText: highQualityText
  });

  assert(highRes.score >= 85, `High-quality prompt scores >= 85% (Actual: ${highRes.score}%)`);
  assert(highRes.checklist.every((c) => c.passed), "All 6 rubric checklist items passed");
  assert(highRes.strengths.length >= 3, "Identifies multiple concrete strengths");

  // 3. Anti-Pattern Detection (Unfulfilled Bracket Placeholders)
  console.log("\n[3/4] Testing Anti-Pattern Penalty for Unfulfilled Brackets...");
  const placeholderText = `
## Objective:
Build a web application.
## Requirements:
- Database: [Specify your database]
- Target Audience: [Specify target audience]
- Architecture: [Specify framework version]
`;

  const placeholderRes = qualityEvaluator.evaluate({
    typeId: "coding",
    promptText: placeholderText
  });

  assert(placeholderRes.score <= 55, `Unfulfilled brackets heavily penalize score (Actual: ${placeholderRes.score}%)`);
  assert(
    placeholderRes.weaknesses.some((w) => w.en.includes("bracket")),
    "Weaknesses report explicitly calls out unfulfilled bracket placeholders"
  );

  // 4. Domain Sensitivity (Image vs Coding)
  console.log("\n[4/4] Testing Domain-Specific Calibration...");
  const imagePrompt = `
Close-up cinematic portrait of a nomadic elder in the Sahara desert during golden hour.
Lighting: Warm directional side-lighting casting deep authentic shadows.
Composition: Rule of thirds, 85mm f/1.4 lens, shallow depth of field with soft bokeh.
Render: Hyper-realistic 8k resolution, natural skin textures.
Constraints: No cartoonish smoothing or distorted facial symmetry.
`;

  const imageRes = qualityEvaluator.evaluate({
    typeId: "image",
    promptText: imagePrompt
  });

  assert(imageRes.score >= 80, `Visual prompt calibrated without needing coding unit tests (Actual: ${imageRes.score}%)`);
  assert(
    imageRes.checklist.find((c) => c.id === "specificity")?.passed === true,
    "Specificity passes based on visual parameters (lighting, composition, lens)"
  );

  console.log(`\nALL EVALUATOR TESTS PASSED (${passed}/${total}) ✓\n`);
  return { passed, total };
}

// Allow direct CLI execution: node tests/evaluator.test.js
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("tests/evaluator.test.js")) {
  try {
    runEvaluatorTests();
    process.exitCode = 0;
  } catch (err) {
    console.error("Test Suite Failed:", err);
    process.exitCode = 1;
  }
}
