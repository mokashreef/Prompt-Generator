/**
 * Prompt Generator - Pollinations AI Provider Implementation
 * Integrates directly with https://gen.pollinations.ai/
 * 
 * Technical Implementation Notes:
 * - Compatible with the official Pollinations AI v1 OpenAI-compatible Chat Completions endpoint.
 * - Dynamic Model Discovery: Fetches live models from `https://gen.pollinations.ai/models`,
 *   filters specifically for text-generation capable models, excludes image/audio/video models,
 *   and ranks them by reported operational health.
 * - Model Metadata Caching: Caches the discovered catalog in client storage with a 1-hour TTL
 *   to ensure fast load times and avoid excessive metadata round-trips.
 * - Clear Authentication & Quota Transparency: Distinguishes between anonymous access,
 *   user-supplied secret keys (`sk_...`), and quota exhaustion (HTTP 401/429), giving users
 *   clear next-step instructions.
 */

import {
  BaseProvider,
  ProviderError,
  ProviderAuthError,
  ProviderQuotaError,
  ProviderNetworkError,
  ProviderTimeoutError
} from "./BaseProvider.js";

const POLLINATIONS_BASE_URL = "https://gen.pollinations.ai";
const MODEL_CACHE_KEY = "pg_pollinations_models_cache_v1";
const MODEL_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export class PollinationsProvider extends BaseProvider {
  constructor({ apiKey = "", defaultModel = "openai/gpt-5.4-nano", timeoutMs = 35000 } = {}) {
    super({
      id: "pollinations",
      name: "Pollinations AI",
      apiKey,
      baseUrl: POLLINATIONS_BASE_URL,
      defaultModel,
      timeoutMs
    });
  }

  /**
   * Dispatches chat completion request to Pollinations AI OpenAI-compatible endpoint.
   * @param {Array<{role: string, content: string}>} messages
   * @param {Object} [options]
   * @returns {Promise<{ content: string, model: string, usage: Object, raw: any }>}
   */
  async generateChat(messages, options = {}) {
    const model = options.model || this.defaultModel || "openai/gpt-5.4-nano";
    const temperature = options.temperature ?? 0.7;
    const maxTokens = options.maxTokens ?? 2500;

    const { signal, cleanup } = this._createTimeoutSignal(options.signal);

    const headers = {
      "Content-Type": "application/json"
    };

    // Attach API key if configured
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const payload = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false
    };

    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw this._handleHttpError(response.status, response.statusText, errorText);
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      const content = choice?.message?.content || "";

      if (!content && choice?.finish_reason !== "stop") {
        throw new ProviderError("Empty response returned from Pollinations AI model.", {
          provider: this.id,
          originalError: data
        });
      }

      return {
        content: content.trim(),
        model: data.model || model,
        usage: data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        raw: data
      };
    } catch (err) {
      if (err.name === "AbortError") {
        throw new ProviderTimeoutError(`Pollinations AI request timed out after ${this.timeoutMs}ms.`, {
          provider: this.id,
          originalError: err
        });
      }
      if (err instanceof ProviderError) {
        throw err;
      }
      throw new ProviderNetworkError(`Failed to reach Pollinations AI: ${err.message}`, {
        provider: this.id,
        originalError: err
      });
    } finally {
      cleanup();
    }
  }

  /**
   * Retrieves and filters the live text-generation models from Pollinations.
   * Excludes non-text modalities (image, video, audio) and non-chat endpoints.
   * Caches results in localStorage with a 1-hour expiration timestamp.
   * @param {boolean} [forceRefresh=false]
   * @returns {Promise<Array<Object>>}
   */
  async listModels(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = this._getCachedModels();
      if (cached) return cached;
    }

    const { signal, cleanup } = this._createTimeoutSignal(null, 15000);

    try {
      const res = await fetch(`${this.baseUrl}/models`, { signal });
      if (!res.ok) {
        // Fallback to /v1/models if /models fails
        const fallbackRes = await fetch(`${this.baseUrl}/v1/models`, { signal });
        if (!fallbackRes.ok) {
          throw new Error(`Model catalog request returned HTTP ${res.status}`);
        }
        const fallbackData = await fallbackRes.json();
        const models = Array.isArray(fallbackData) ? fallbackData : fallbackData.data || [];
        return this._processAndCacheModels(models);
      }

      const rawModels = await res.json();
      return this._processAndCacheModels(rawModels);
    } catch (err) {
      console.warn("PollinationsProvider.listModels failed, checking cache or static fallback:", err);
      const stale = this._getCachedModels(true);
      if (stale && stale.length > 0) return stale;
      return this._getStaticFallbackModels();
    } finally {
      cleanup();
    }
  }

  /**
   * Tests reachability and credentials against Pollinations endpoint.
   * @returns {Promise<{ ok: boolean, latencyMs: number, message: string }>}
   */
  async testConnection() {
    const startTime = Date.now();
    try {
      const result = await this.generateChat(
        [{ role: "user", content: "Reply with the word 'OK' only." }],
        { model: this.defaultModel, maxTokens: 10, temperature: 0.1 }
      );
      const latencyMs = Date.now() - startTime;
      return {
        ok: true,
        latencyMs,
        message: `Successfully connected to Pollinations AI (${result.model}) in ${latencyMs}ms.`,
        details: result
      };
    } catch (err) {
      const latencyMs = Date.now() - startTime;
      let hint = "";
      if (err instanceof ProviderAuthError) {
        hint = " A valid Pollinations API key is required. Obtain a free/prepaid key at https://enter.pollinations.ai/keys, or switch to Deterministic Fallback mode.";
      } else if (err instanceof ProviderQuotaError) {
        hint = " IP or account rate limit reached. Please wait or configure an API key.";
      }
      return {
        ok: false,
        latencyMs,
        message: `${err.message}.${hint}`,
        details: err
      };
    }
  }

  /**
   * Filters and normalizes raw model entries for text prompt generation.
   * @private
   */
  _processAndCacheModels(rawModels) {
    if (!Array.isArray(rawModels)) return this._getStaticFallbackModels();

    const textModels = rawModels
      .filter((m) => {
        // Must support text output
        const hasTextOutput = m.category === "text" || (m.output_modalities && m.output_modalities.includes("text"));
        // Must support chat or responses endpoints
        const hasChatEndpoint =
          !m.supported_endpoints ||
          m.supported_endpoints.some((ep) => ep.includes("/chat/completions") || ep.includes("/text"));
        return hasTextOutput && hasChatEndpoint;
      })
      .map((m) => {
        const id = m.name || m.id;
        const displayName = m.title || m.name || id;
        const isFree = m.paid_only === false || (m.pricing && m.pricing.promptTextTokens === "0");
        return {
          id,
          name: displayName,
          description: m.description || "",
          publisher: m.publisher || "Unknown",
          contextLength: m.context_length || 128000,
          isFree,
          paidOnly: !!m.paid_only,
          healthStatus: m.health?.status || "unknown",
          successRate: m.health?.success_rate || null
        };
      })
      // Sort: Healthy first, then free first, then alphabetically
      .sort((a, b) => {
        if (a.healthStatus === "healthy" && b.healthStatus !== "healthy") return -1;
        if (a.healthStatus !== "healthy" && b.healthStatus === "healthy") return 1;
        if (a.isFree && !b.isFree) return -1;
        if (!a.isFree && b.isFree) return 1;
        return a.name.localeCompare(b.name);
      });

    const finalModels = textModels.length > 0 ? textModels : this._getStaticFallbackModels();

    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(
          MODEL_CACHE_KEY,
          JSON.stringify({
            timestamp: Date.now(),
            models: finalModels
          })
        );
      }
    } catch (e) {
      console.warn("Could not write models to localStorage:", e);
    }

    return finalModels;
  }

  /**
   * Retrieves cached models if still valid under TTL.
   * @private
   */
  _getCachedModels(ignoreTtl = false) {
    try {
      if (typeof window === "undefined" || !window.localStorage) return null;
      const raw = localStorage.getItem(MODEL_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!ignoreTtl && Date.now() - parsed.timestamp > MODEL_CACHE_TTL_MS) {
        return null;
      }
      return parsed.models;
    } catch {
      return null;
    }
  }

  /**
   * Documented fallback list of text models if network discovery is completely offline.
   * @private
   */
  _getStaticFallbackModels() {
    return [
      {
        id: "openai/gpt-5.4-nano",
        name: "GPT-5.4 Nano",
        description: "Fast, reliable all-rounder for general prompt engineering",
        publisher: "OpenAI",
        contextLength: 400000,
        isFree: true
      },
      {
        id: "meta/llama-3.3-70b-instruct",
        name: "Llama 3.3 70B Instruct",
        description: "Open-weight powerhouse for deep technical and coding prompts",
        publisher: "Meta",
        contextLength: 128000,
        isFree: true
      },
      {
        id: "deepseek/deepseek-v4.1-flash",
        name: "DeepSeek V4.1 Flash",
        description: "High-speed reasoning model specialized in developer workflows",
        publisher: "DeepSeek",
        contextLength: 128000,
        isFree: true
      },
      {
        id: "mistralai/mistral-small-4",
        name: "Mistral Small 4",
        description: "Concise, precise instruction following with strong multilingual support",
        publisher: "Mistral",
        contextLength: 128000,
        isFree: true
      },
      {
        id: "google/gemini-2.5-flash-lite",
        name: "Gemini 2.5 Flash Lite",
        description: "Rapid latency model for instant prompt expansion",
        publisher: "Google",
        contextLength: 1000000,
        isFree: true
      }
    ];
  }
}
