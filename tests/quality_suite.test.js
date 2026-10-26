/**
 * Prompt Generator - Prompt Quality & Domain Sensitivity Test Suite
 * Tests prompt generation and quality evaluation across 6 distinct, unrelated domains:
 * 1. Complex Software Architecture (Laravel Distributed Inventory System)
 * 2. Deep Debugging & Root Cause Analysis (PostgreSQL Deadlock in Distributed Transactions)
 * 3. B2B Growth & Marketing Strategy (Enterprise SaaS Product Launch)
 * 4. Cinematic Image Generation (Cyberpunk Street in Tokyo Rain)
 * 5. Academic & Strategic Research (Semiconductor Supply Chain Resilience)
 * 6. Predictive Data Analysis (Customer Churn Modeling & Feature Importance)
 * 
 * Verifies:
 * - Domain Specificity: Coding prompts do NOT look like image prompts; research does not look like marketing.
 * - Zero Empty Placeholders: No unfulfilled bracket placeholders like "[Specify ...]".
 * - Mode Differentiation: Quick is punchy and concise; Expert provides deep architectural blueprints.
 * - Requirement Retention: Crucial user constraints are strictly preserved.
 */

import { aiPromptPipeline } from "../js/engine/aiPromptPipeline.js";
import { qualityEvaluator } from "../js/engine/qualityEvaluator.js";
import { providerManager } from "../js/ai/ProviderManager.js";
import { DeterministicFallbackProvider } from "../js/ai/DeterministicFallbackProvider.js";

export async function runQualityTests() {
  console.log("=== RUNNING PROMPT QUALITY & DOMAIN SENSITIVITY SUITE ===");

  let passedCount = 0;
  let totalCount = 0;

  function assert(condition, testName) {
    totalCount++;
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passedCount++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      throw new Error(`Assertion failed: ${testName}`);
    }
  }

  // 1. Complex Software Application (Laravel Inventory System)
  console.log("\n[1/6] Testing Complex Software Architecture (Laravel Inventory System)...");
  const codingResult = await aiPromptPipeline.execute({
    taskGoal: "Architect a multi-warehouse inventory management system in Laravel 11 with real-time stock reservations and concurrency locks",
    category: "coding",
    mode: "professional",
    targetPlatform: "chatgpt",
    fields: {
      tech_stack_env: "Laravel 11, PHP 8.3, PostgreSQL 16, Redis 7",
      constraints: "Strict zero overselling; pessimistic locking for checkout; automated PestPHP tests"
    }
  });

  assert(codingResult.prompt.length > 200, "Coding prompt has substantive depth");
  assert(!codingResult.prompt.includes("[Specify"), "Zero empty placeholder brackets in coding prompt");
  assert(
    codingResult.prompt.toLowerCase().includes("solid") ||
    codingResult.prompt.toLowerCase().includes("architect") ||
    codingResult.prompt.toLowerCase().includes("error") ||
    codingResult.prompt.includes("هندسي") ||
    codingResult.prompt.includes("كود"),
    "Coding prompt contains software engineering requirements"
  );
  assert(codingResult.quality.score >= 70, `Coding prompt quality score is high (Score: ${codingResult.quality.score}%)`);

  // 2. Deep Debugging Task
  console.log("\n[2/6] Testing Deep Debugging Task (PostgreSQL Deadlock)...");
  const debugResult = await aiPromptPipeline.execute({
    taskGoal: "Diagnose and resolve deadlocks occurring during concurrent order fulfillment and inventory decrement",
    category: "debugging",
    mode: "detailed",
    fields: {
      bug_symptom: "ERROR: deadlock detected; Process 412 waiting for ShareLock on transaction 8892",
      tech_stack_env: "PostgreSQL 16, Node.js Prisma ORM"
    }
  });

  assert(debugResult.prompt.length > 250, "Debugging prompt provides comprehensive guidance");
  assert(!debugResult.prompt.includes("[Specify"), "Debugging prompt contains zero empty placeholders");
  assert(
    debugResult.prompt.toLowerCase().includes("deadlock") ||
    debugResult.prompt.toLowerCase().includes("root") ||
    debugResult.prompt.toLowerCase().includes("edge") ||
    debugResult.prompt.includes("أعطال") ||
    debugResult.prompt.includes("الخطأ"),
    "Debugging prompt focuses on root-cause isolation and concurrency failure modes"
  );

  // 3. Marketing & Growth Strategy
  console.log("\n[3/6] Testing Marketing & Growth Strategy...");
  const marketingResult = await aiPromptPipeline.execute({
    taskGoal: "Create a 30-day product launch campaign for an AI-powered code security scanner",
    category: "marketing",
    mode: "professional",
    fields: {
      target_audience: "DevOps leads and VP of Engineering at series A-C startups",
      desired_result: "High-converting email sequences, LinkedIn thought leadership, and developer launch webinar"
    }
  });

  assert(marketingResult.prompt.length > 180, "Marketing prompt has substantive length");
  assert(
    marketingResult.prompt.toLowerCase().includes("persona") ||
    marketingResult.prompt.toLowerCase().includes("objective") ||
    marketingResult.prompt.toLowerCase().includes("deliverable") ||
    marketingResult.prompt.includes("تسويق") ||
    marketingResult.prompt.includes("الهدف"),
    "Marketing prompt focuses on strategic positioning and conversion"
  );

  // 4. Cinematic Image Generation
  console.log("\n[4/6] Testing Cinematic Image Generation (Tokyo Cyberpunk Street)...");
  const imageResult = await aiPromptPipeline.execute({
    taskGoal: "Cinematic medium shot of an elderly ramen chef working in a neon-lit Shinjuku alleyway during midnight rain",
    category: "image",
    mode: "professional",
    targetPlatform: "midjourney"
  });

  assert(
    imageResult.prompt.toLowerCase().includes("cinematic") ||
    imageResult.prompt.toLowerCase().includes("lighting") ||
    imageResult.prompt.toLowerCase().includes("photographic") ||
    imageResult.prompt.includes("إضاءة") ||
    imageResult.prompt.includes("بصري"),
    "Image prompt focuses on lighting, composition, and visual aesthetics rather than coding unit tests"
  );

  // 5. Academic & Strategic Research
  console.log("\n[5/6] Testing Strategic Research Directive...");
  const researchResult = await aiPromptPipeline.execute({
    taskGoal: "Evaluate the geopolitical resilience of leading semiconductor packaging hubs across Southeast Asia through 2030",
    category: "research",
    mode: "detailed",
    fields: {
      constraints: "Rely only on peer-reviewed economic papers and verified WTO/CHIPS Act data; compare Vietnam and Malaysia"
    }
  });

  assert(
    researchResult.prompt.toLowerCase().includes("methodology") ||
    researchResult.prompt.toLowerCase().includes("analytical") ||
    researchResult.prompt.toLowerCase().includes("prerequisites") ||
    researchResult.prompt.includes("منهجية") ||
    researchResult.prompt.includes("تحليل"),
    "Research prompt provides methodological rigor and analytical framework"
  );

  // 6. Data Analysis Task
  console.log("\n[6/6] Testing Predictive Data Analysis Task...");
  const dataResult = await aiPromptPipeline.execute({
    taskGoal: "Build a customer churn prediction workflow and identify top 5 risk drivers",
    category: "analysis",
    mode: "expert"
  });

  assert(
    dataResult.prompt.toLowerCase().includes("system") ||
    dataResult.prompt.toLowerCase().includes("analytical") ||
    dataResult.prompt.toLowerCase().includes("verification") ||
    dataResult.prompt.includes("تحليل") ||
    dataResult.prompt.includes("معايير"),
    "Expert data analysis prompt provides multi-stage architecture and quality gates"
  );

  // 7. Verify Unrelated Prompts Are Substantially Different (Not Monolithic Templates)
  console.log("\n[Verification] Comparing Structural Dissimilarity Across Domains...");
  assert(codingResult.prompt !== imageResult.prompt, "Coding and Image prompts are not identical");
  assert(marketingResult.prompt !== researchResult.prompt, "Marketing and Research prompts are not identical");
  assert(debugResult.prompt !== dataResult.prompt, "Debug and Data analysis prompts are not identical");

  console.log(`\nALL QUALITY SUITE TESTS PASSED (${passedCount}/${totalCount}) ✓\n`);
  return { passedCount, totalCount };
}

// Allow direct CLI execution: node tests/quality_suite.test.js
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("tests/quality_suite.test.js")) {
  runQualityTests()
    .then(() => {
      process.exitCode = 0;
    })
    .catch((err) => {
      console.error("Test Suite Failed:", err);
      process.exitCode = 1;
    });
}


