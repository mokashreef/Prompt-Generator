import { actionTransformer, PROMPT_ACTIONS } from "../extension/shared/engine/actionTransformer.js";
import { qualityEvaluator } from "../extension/shared/engine/qualityEvaluator.js";
import { intentDetector } from "../extension/shared/engine/intentDetector.js";
import { diffViewer } from "../extension/shared/diff.js";

console.log("=== RUNNING PROMPT GENERATOR ENGINE TESTS ===\n");

const testPrompts = [
  "build a website",
  "make me a logo",
  "write an article",
  "research AI tools",
  "fix this code",
  "create a video",
  "analyze this business",
  "teach me Python",
  "compare React and Vue",
  "rewrite this professionally"
];

const testActions = [
  "improve",
  "rewrite",
  "specific",
  "detailed",
  "concise",
  "structure",
  "constraints",
  "format",
  "professional",
  "simplify",
  "translate"
];

let allPassed = true;

// 1. Test all 10 prompts with default "improve" action
console.log("--- TEST 1: Default 'improve' action across 10 prompts ---");
testPrompts.forEach((prompt, idx) => {
  const result = actionTransformer.transform(prompt, "improve", "en");
  
  if (!result.improved || result.improved.length <= prompt.length) {
    console.error(`FAIL: Prompt "${prompt}" did not improve.`);
    allPassed = false;
  }
  
  const score = result.quality.score;
  const intent = result.intent.id;
  
  console.log(`[${idx + 1}/10] "${prompt}" => Intent: ${intent} | Quality: ${score}% | Length: ${result.improved.length} chars`);
});

// 2. Test distinct actions produce distinct outputs on the same prompt
console.log("\n--- TEST 2: Distinct actions on 'build a website' ---");
const samplePrompt = "build a website";
const outputs = new Map();

testActions.forEach((act) => {
  const res = actionTransformer.transform(samplePrompt, act, "en");
  outputs.set(act, res.improved);
  console.log(`Action [${act.padEnd(12)}]: Quality ${res.quality.score}% | Length: ${res.improved.length} chars`);
});

const improveOut = outputs.get("improve");
const conciseOut = outputs.get("concise");
const constraintsOut = outputs.get("constraints");

if (improveOut === conciseOut) {
  console.error("FAIL: 'improve' and 'concise' produced identical outputs!");
  allPassed = false;
} else {
  console.log("PASS: 'improve' vs 'concise' are distinct.");
}

if (!constraintsOut.includes("Constraints") && !constraintsOut.includes("Requirements") && !constraintsOut.includes("قيود")) {
  console.error("FAIL: 'constraints' action did not emphasize constraints/requirements.");
  allPassed = false;
} else {
  console.log("PASS: 'constraints' action explicitly emphasizes constraints.");
}

// 3. Test Diff viewer
console.log("\n--- TEST 3: Diff Viewer ---");
const origText = "Create a modern landing page for my store.";
const impText = actionTransformer.transform(origText, "improve", "en").improved;
const diffHtml = diffViewer.generateHtml(origText, impText);
if (diffHtml.includes("diff-container") && (diffHtml.includes("diff-ins") || diffHtml.includes("diff-unchanged") || diffHtml.includes("diff-added"))) {
  console.log("PASS: Diff Viewer generated valid HTML highlighting changes.");
} else {
  console.error("FAIL: Diff Viewer did not return expected HTML diff structure: " + diffHtml.slice(0, 100));
  allPassed = false;
}

// 4. Test Arabic prompts
console.log("\n--- TEST 4: Arabic Prompts ---");
const arabicPrompt = "صمم لي موقع لبيع القهوة المختصة";
const arabicRes = actionTransformer.transform(arabicPrompt, "improve", "ar");
console.log(`Arabic input: "${arabicPrompt}" => Quality: ${arabicRes.quality.score}% | Intent: ${arabicRes.intent.id}`);
if (!arabicRes.improved || arabicRes.improved.length <= arabicPrompt.length) {
  console.error("FAIL: Arabic prompt did not generate improved result.");
  allPassed = false;
} else {
  console.log("PASS: Arabic prompt improved accurately.");
}

console.log("\n--- OVERALL ENGINE TEST RESULT ---");
if (allPassed) {
  console.log("ALL TESTS PASSED SUCCESSFULLY! ✓\n");
  process.exit(0);
} else {
  console.error("SOME TESTS FAILED! ✗\n");
  process.exit(1);
}
