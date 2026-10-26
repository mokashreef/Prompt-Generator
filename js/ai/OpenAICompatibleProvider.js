/**
 * Prompt Generator - OpenAI-Compatible Provider Implementation
 * Universal provider supporting OpenAI, Groq, OpenRouter, DeepSeek, Together AI, Mistral,
 * or any service exposing an RFC-compliant /v1/chat/completions endpoint.
 * 
 * Security & Design Principles:
 * 1. Zero Key Leaks: User API keys are held strictly in client memory/localStorage.
 *    No telemetry, proxy servers, or third-party relays are involved.
 * 2. Multi-Vendor Preset Support: Preconfigured presets for Groq (fast free tier),
 *    OpenRouter (diverse free models), and DeepSeek, alongside generic custom base URLs.
 * 3. Dynamic Model Introspection: Queries `GET /v1/models` where supported by the vendor,
 *    falling back to vendor-specific defaults when the endpoint is restricted.
 */

import {
  BaseProvider,
  ProviderError,
  ProviderAuthError,
  ProviderQuotaError,
  ProviderNetworkError,
  ProviderTimeoutError
} from "./BaseProvider.js";

export const VENDOR_PRESETS = {
  groq: {
    name: "Groq (Fast / Generous Free Tier)",
    baseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "llama-3.3-70b-versatile",
    models: [
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B Versatile", isFree: true },
      { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B Instant", isFree: true },
      { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B (32k context)", isFree: true },
      { id: "gemma2-9b-it", name: "Gemma 2 9B IT", isFree: true }
    ]
  },
  openrouter: {
    name: "OpenRouter (Includes Free Open-Weight Models)",
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "meta-llama/llama-3.3-70b-instruct:free",
    models: [
      { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B (Free)", isFree: true },
      { id: "deepseek/deepseek-r1:free", name: "DeepSeek R1 Reasoning (Free)", isFree: true },
      { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash Exp (Free)", isFree: true },
      { id: "qwen/qwen-2.5-coder-32b-instruct:free", name: "Qwen 2.5 Coder 32B (Free)", isFree: true }
    ]
  },
  deepseek: {
    name: "DeepSeek Official",
    baseUrl: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",
    models: [
      { id: "deepseek-chat", name: "DeepSeek V3 (Chat)", isFree: false },
      { id: "deepseek-reasoner", name: "DeepSeek R1 (Reasoner)", isFree: false }
    ]
  },
  openai: {
    name: "OpenAI Official",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    models: [
      { id: "gpt-4o-mini", name: "GPT-4o Mini", isFree: false },
      { id: "gpt-4o", name: "GPT-4o", isFree: false }
    ]
  },
  custom: {
    name: "Custom OpenAI-Compatible Endpoint",
    baseUrl: "",
    defaultModel: "",
    models: []
  }
};

export class OpenAICompatibleProvider extends BaseProvider {
  /**
   * @param {Object} config
   * @param {string} [config.vendorPreset='groq'] - One of VENDOR_PRESETS keys
   * @param {string} [config.baseUrl] - Custom base URL overriding preset
   * @param {string} [config.apiKey] - User's secret API key
   * @param {string} [config.defaultModel]
   * @param {number} [config.timeoutMs=35000]
   */
  constructor({
    vendorPreset = "groq",
    baseUrl = "",
    apiKey = "",
    defaultModel = "",
    timeoutMs = 35000
  } = {}) {
    const preset = VENDOR_PRESETS[vendorPreset] || VENDOR_PRESETS.custom;
    const finalBaseUrl = baseUrl || preset.baseUrl;
    const finalDefaultModel = defaultModel || preset.defaultModel || "gpt-4o-mini";

    super({
      id: "openai_compatible",
      name: preset.name || "OpenAI-Compatible",
      apiKey,
      baseUrl: finalBaseUrl,
      defaultModel: finalDefaultModel,
      timeoutMs
    });

    this.vendorPreset = vendorPreset;
    this.presetModels = preset.models || [];
  }

  /**
   * Executes chat completion request via /v1/chat/completions.
   */
  async generateChat(messages, options = {}) {
    if (!this.baseUrl) {
      throw new ProviderError("Base URL is required for OpenAI-compatible provider.", { provider: this.id });
    }

    if (!this.apiKey && this.vendorPreset !== "custom") {
      throw new ProviderAuthError(
        `API key is required for ${this.name}. Please enter your key in AI Settings.`,
        { provider: this.id }
      );
    }

    const model = options.model || this.defaultModel;
    const temperature = options.temperature ?? 0.7;
    const maxTokens = options.maxTokens ?? 2500;

    const { signal, cleanup } = this._createTimeoutSignal(options.signal);

    const headers = {
      "Content-Type": "application/json"
    };

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    // OpenRouter custom identification headers
    if (this.baseUrl.includes("openrouter.ai")) {
      headers["HTTP-Referer"] = "https://mokashreef.github.io/Prompt-Generator/";
      headers["X-Title"] = "Prompt Generator Workspace";
    }

    const payload = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false
    };

    try {
      const endpoint = `${this.baseUrl}/chat/completions`;
      const response = await fetch(endpoint, {
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
        throw new ProviderError("Empty response returned from AI model.", {
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
        throw new ProviderTimeoutError(`Request timed out after ${this.timeoutMs}ms.`, {
          provider: this.id,
          originalError: err
        });
      }
      if (err instanceof ProviderError) {
        throw err;
      }
      throw new ProviderNetworkError(`Failed to reach ${this.name}: ${err.message}`, {
        provider: this.id,
        originalError: err
      });
    } finally {
      cleanup();
    }
  }

  /**
   * Discovers models by attempting GET /v1/models.
   * If the endpoint fails or returns unauthorized, falls back to the curated vendor preset list.
   */
  async listModels(forceRefresh = false) {
    if (!this.baseUrl) return this.presetModels;

    const { signal, cleanup } = this._createTimeoutSignal(null, 10000);
    const headers = {};
    if (this.apiKey) headers["Authorization"] = `Bearer ${this.apiKey}`;

    try {
      const res = await fetch(`${this.baseUrl}/models`, { headers, signal });
      if (!res.ok) {
        return this.presetModels.length > 0 ? this.presetModels : [{ id: this.defaultModel, name: this.defaultModel }];
      }
      const data = await res.json();
      const list = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
      if (list.length === 0) return this.presetModels;

      return list
        .map((m) => ({
          id: m.id,
          name: m.name || m.id,
          description: m.description || "",
          contextLength: m.context_length || 128000,
          isFree: m.id.endsWith(":free") || this.vendorPreset === "groq"
        }))
        .slice(0, 50);
    } catch {
      return this.presetModels.length > 0 ? this.presetModels : [{ id: this.defaultModel, name: this.defaultModel }];
    } finally {
      cleanup();
    }
  }

  /**
   * Tests connection with minimal tokens.
   */
  async testConnection() {
    const startTime = Date.now();
    try {
      const result = await this.generateChat(
        [{ role: "user", content: "Reply 'OK' only." }],
        { model: this.defaultModel, maxTokens: 10, temperature: 0.1 }
      );
      const latencyMs = Date.now() - startTime;
      return {
        ok: true,
        latencyMs,
        message: `Connected successfully to ${this.name} (${result.model}) in ${latencyMs}ms.`,
        details: result
      };
    } catch (err) {
      const latencyMs = Date.now() - startTime;
      return {
        ok: false,
        latencyMs,
        message: `${err.message}`,
        details: err
      };
    }
  }
}
