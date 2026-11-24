/**
 * Prompt Generator - AI Provider & Resilience Test Suite
 * Tests the provider abstraction layer, error handling, dynamic model discovery,
 * and failover guarantees.
 * 
 * Verifies:
 * - Error Hierarchy: Correct instantiation of ProviderAuthError, ProviderQuotaError, ProviderTimeoutError, etc.
 * - Dynamic Discovery: Text-only model filtering, exclusion of non-text modalities.
 * - Provider Contracts: All providers conform to BaseProvider interface.
 * - Deterministic Transparency: Fallback outputs are explicitly tagged as non-AI.
 * - Failover Orchestration: Fallback is engaged automatically when primary fails.
 */

import { BaseProvider, ProviderAuthError, ProviderQuotaError, ProviderTimeoutError, ProviderNetworkError } from "../js/ai/BaseProvider.js";
import { PollinationsProvider } from "../js/ai/PollinationsProvider.js";
import { OpenAICompatibleProvider, VENDOR_PRESETS } from "../js/ai/OpenAICompatibleProvider.js";
import { OllamaProvider } from "../js/ai/OllamaProvider.js";
import { DeterministicFallbackProvider } from "../js/ai/DeterministicFallbackProvider.js";
import { ProviderManager } from "../js/ai/ProviderManager.js";

export async function runProviderTests() {
  console.log("=== RUNNING AI PROVIDER & RESILIENCE TEST SUITE ===");

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

  // 1. Error Hierarchy Tests
  console.log("\n[1/5] Testing Provider Error Hierarchies...");
  const authErr = new ProviderAuthError("Unauthorized key", { status: 401, provider: "pollinations" });
  assert(authErr instanceof Error, "ProviderAuthError is an Error");
  assert(authErr.name === "ProviderAuthError", "ProviderAuthError has correct name");
  assert(authErr.code === "AUTH_ERROR", "ProviderAuthError code is AUTH_ERROR");
  assert(authErr.status === 401, "ProviderAuthError retains HTTP 401 status");

  const quotaErr = new ProviderQuotaError("Rate limit reached", { status: 429, provider: "openai" });
  assert(quotaErr.code === "QUOTA_EXCEEDED", "ProviderQuotaError code is QUOTA_EXCEEDED");

  const timeoutErr = new ProviderTimeoutError("Aborted after 30s", { provider: "ollama" });
  assert(timeoutErr.code === "TIMEOUT", "ProviderTimeoutError code is TIMEOUT");

  // 2. BaseProvider Contract Compliance
  console.log("\n[2/5] Testing Provider Contract Compliance...");
  const fallback = new DeterministicFallbackProvider();
  assert(fallback instanceof BaseProvider, "DeterministicFallbackProvider extends BaseProvider");
  assert(typeof fallback.generateChat === "function", "generateChat is implemented");
  assert(typeof fallback.listModels === "function", "listModels is implemented");
  assert(typeof fallback.testConnection === "function", "testConnection is implemented");

  const pollinations = new PollinationsProvider();
  assert(pollinations instanceof BaseProvider, "PollinationsProvider extends BaseProvider");
  assert(pollinations.id === "pollinations", "PollinationsProvider ID is pollinations");

  const groqProvider = new OpenAICompatibleProvider({ vendorPreset: "groq" });
  assert(groqProvider instanceof BaseProvider, "OpenAICompatibleProvider extends BaseProvider");
  assert(groqProvider.baseUrl === VENDOR_PRESETS.groq.baseUrl, "Groq base URL configured correctly");

  const ollama = new OllamaProvider();
  assert(ollama instanceof BaseProvider, "OllamaProvider extends BaseProvider");
  assert(ollama.baseUrl === "http://localhost:11434/v1", "Ollama default base URL is standard");

  // 3. Dynamic Model Discovery & Filtering
  console.log("\n[3/5] Testing Model Discovery & Modality Filtering...");
  const testCatalog = [
    { name: "text-llm-1", category: "text", supported_endpoints: ["/v1/chat/completions"], health: { status: "healthy" }, paid_only: false },
    { name: "flux-schnell", category: "image", output_modalities: ["image"], supported_endpoints: ["/image"] },
    { name: "voice-tts", category: "audio", output_modalities: ["audio"], supported_endpoints: ["/audio"] },
    { name: "text-llm-2", category: "text", supported_endpoints: ["/v1/chat/completions"], health: { status: "degraded" }, paid_only: true }
  ];

  const processed = pollinations._processAndCacheModels(testCatalog);
  assert(processed.length === 2, "Only text models retained (2 out of 4)");
  assert(processed.every((m) => m.id.startsWith("text-")), "Image and audio models were excluded");
  assert(processed[0].id === "text-llm-1", "Healthy model sorted before degraded model");

  // 4. Deterministic Transparency
  console.log("\n[4/5] Testing Deterministic Fallback Provenance Transparency...");
  const fallbackResult = await fallback.generateChat([
    { role: "user", content: "Write a prompt for Python web scraping" }
  ]);

  assert(fallbackResult.isAiGenerated === false, "Fallback is explicitly tagged isAiGenerated: false");
  assert(fallbackResult.isFallback === true, "Fallback is explicitly tagged isFallback: true");
  assert(fallbackResult.model === "deterministic-rule-engine", "Model name explicitly identifies deterministic rule engine");
  assert(fallbackResult.content.length > 50, "Synthesizes non-empty prompt output");

  // 5. ProviderManager Orchestration & Failover
  console.log("\n[5/5] Testing ProviderManager Failover Behavior...");
  const manager = new ProviderManager();
  
  // Set manager to an active provider that will fail (pollinations without key)
  manager.updateConfig({
    activeProviderId: "pollinations",
    enableAutoFallback: true,
    providers: { pollinations: { apiKey: "" } }
  });

  const failoverResult = await manager.generateChat([
    { role: "user", content: "Create a marketing prompt for a SaaS tool" }
  ]);

  assert(failoverResult.isFallback === true, "Failover engaged and tagged isFallback: true");
  assert(failoverResult.isAiGenerated === false, "Failover output tagged isAiGenerated: false");
  assert(failoverResult.provider === "deterministic_fallback", "Provider reassigned to deterministic_fallback");
  assert(typeof failoverResult.warning === "string" && failoverResult.warning.length > 0, "Failover attaches explanatory warning to result");

  // 6. Exponential Backoff & Retry Queue under HTTP 429/503
  console.log("\n[6/6] Testing Exponential Backoff and Retry Behavior under HTTP 429/503...");
  const originalFetch = globalThis.fetch;
  try {
    let callCount = 0;
    const retryEvents = [];

    // Simulate transient HTTP 429: fails twice with 429, succeeds on attempt 3
    globalThis.fetch = async (url, opts) => {
      callCount++;
      if (callCount < 3) {
        return {
          status: 429,
          statusText: "Too Many Requests",
          ok: false,
          text: async () => JSON.stringify({ error: { message: "Rate limit exceeded. Please wait." } })
        };
      }
      return {
        status: 200,
        statusText: "OK",
        ok: true,
        json: async () => ({
          model: "test-model",
          choices: [{ message: { content: "Success after retries" }, finish_reason: "stop" }],
          usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 }
        })
      };
    };

    const testProvider = new PollinationsProvider({ timeoutMs: 5000 });
    const response = await testProvider.fetchWithTimeout("https://test.local/chat", { method: "POST" }, {
      maxRetries: 3,
      retryDelayMs: 20,
      maxDelayMs: 100,
      onRetry: (data) => retryEvents.push(data)
    });

    assert(response.ok === true, "fetchWithTimeout succeeded after transient 429 retries");
    assert(callCount === 3, "Called fetch exactly 3 times (1 initial + 2 retries)");
    assert(retryEvents.length === 2, "Recorded 2 retry events");
    assert(retryEvents[0].attempt === 1 && retryEvents[0].status === 429, "First retry attempt was recorded with status 429");
    assert(retryEvents[1].attempt === 2 && retryEvents[1].status === 429, "Second retry attempt was recorded with status 429");

    // Test persistent 429 exhaust retries
    let exhaustedCallCount = 0;
    globalThis.fetch = async () => {
      exhaustedCallCount++;
      return {
        status: 429,
        statusText: "Too Many Requests",
        ok: false,
        text: async () => "Rate limit permanently exceeded"
      };
    };

    const exhaustedResponse = await testProvider.fetchWithTimeout("https://test.local/chat", { method: "POST" }, {
      maxRetries: 2,
      retryDelayMs: 10,
      maxDelayMs: 50
    });

    assert(exhaustedResponse.status === 429, "Returns final 429 response when retries are exhausted");
    assert(exhaustedCallCount === 3, "Attempted initial request plus 2 retries before returning");
  } finally {
    globalThis.fetch = originalFetch;
  }

  console.log(`\nALL PROVIDER TESTS PASSED (${passed}/${total}) ✓\n`);
  return { passed, total };
}

// Allow direct CLI execution: node tests/providers.test.js
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("tests/providers.test.js")) {
  runProviderTests()
    .then(() => {
      process.exitCode = 0;
    })
    .catch((err) => {
      console.error("Test Suite Failed:", err);
      process.exitCode = 1;
    });
}

