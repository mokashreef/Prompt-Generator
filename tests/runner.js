/**
 * Prompt Generator Test Runner
 *
 * Executes the entire automated test suite covering:
 * - AI Provider Abstraction and Model Discovery (providers.test.js)
 * - AI Prompt Generation Pipeline and Modes (pipeline.test.js)
 * - Calibrated Quality Evaluator and Scoring Rubric (evaluator.test.js)
 * - Comprehensive Quality Suite across 6 Diverse Domains (quality_suite.test.js)
 * - Legacy Engine Regression Baseline (engine.test.js)
 */

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const suites = [
  { name: "AI Providers & Failover", file: "providers.test.js" },
  { name: "AI Pipeline & Generation Modes", file: "pipeline.test.js" },
  { name: "Quality Evaluator & Rubric", file: "evaluator.test.js" },
  { name: "Quality Benchmark (6 Domains)", file: "quality_suite.test.js" },
  { name: "Legacy Baseline Regression", file: "engine.test.js" }
];

async function runSuite(suite) {
  const filePath = path.join(__dirname, suite.file);
  return new Promise((resolve) => {
    console.log(`\n======================================================`);
    console.log(`RUNNING: ${suite.name} (${suite.file})`);
    console.log(`======================================================`);

    const proc = spawn("node", [filePath], {
      stdio: "inherit",
      shell: false
    });

    proc.on("close", (code) => {
      resolve({ suite: suite.name, file: suite.file, code });
    });
  });
}

async function main() {
  console.log("======================================================");
  console.log("   PROMPT GENERATOR - AUTOMATED VERIFICATION SUITE   ");
  console.log("======================================================");

  const results = [];
  for (const s of suites) {
    const res = await runSuite(s);
    results.push(res);
  }

  console.log("\n\n======================================================");
  console.log("               TEST SUITE SUMMARY REPORT              ");
  console.log("======================================================");

  let anyFailed = false;
  results.forEach((r) => {
    const status = r.code === 0 ? "PASSED [OK]" : `FAILED [exit ${r.code}]`;
    console.log(`- ${r.suite.padEnd(35)} : ${status}`);
    if (r.code !== 0) anyFailed = true;
  });

  console.log("======================================================");
  if (anyFailed) {
    console.error("\n[X] Some test suites failed! Review logs above.\n");
    process.exitCode = 1;
  } else {
    console.log("\n[V] All test suites passed successfully! 100% verified.\n");
    process.exitCode = 0;
  }
}

main();
