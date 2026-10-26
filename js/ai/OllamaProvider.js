/**
 * Prompt Generator - Ollama Local Provider Implementation
 * Connects directly to local Ollama daemon (default: http://localhost:11434/v1)
 * 
 * Features:
 * 1. 100% Local & Private: No prompt data ever leaves the user's workstation.
 * 2. Zero Cost & Offline: Runs completely without internet connectivity or API credits.
 * 3. Dynamic Tag Discovery: Queries Ollama's native `/api/tags` or `/v1/models` to display
 *    locally pulled models (e.g. llama3.2, mistral, deepseek-r1, qwen2.5-coder).
 * 4. Clear Connectivity Diagnostics: Displays actionable remediation when daemon is stopped.
 */

import {
  BaseProvider,
  ProviderError,
  ProviderNetworkError,
  ProviderTimeoutError
} from "./BaseProvider.js";

const DEFAULT_OLLAMA_URL = "http://localhost:11434/v1";

export class OllamaProvider extends BaseProvider {
  /**
   * @param {Object} [config]
   * @param {string} [config.baseUrl='http://localhost:11434/v1']
   * @param {string} [config.defaultModel='llama3.2']
   * @param {number} [config.timeoutMs=60000] - Local inference may need higher timeout on CPU
   */
  constructor({ baseUrl = DEFAULT_OLLAMA_URL, defaultModel = "llama3.2", timeoutMs = 60000 } = {}) {
    super({
      id: "ollama",
      name: "Ollama (Local / Offline)",
      apiKey: "", // Not required for local Ollama
      baseUrl: baseUrl || DEFAULT_OLLAMA_URL,
      defaultModel: defaultModel || "llama3.2",
      timeoutMs
    });
  }

  /**
   * Executes local chat completion using Ollama's OpenAI-compatible endpoint.
   */
  async generateChat(messages, options = {}) {
    const model = options.model || this.defaultModel || "llama3.2";
    const temperature = options.temperature ?? 0.7;
    const maxTokens = options.maxTokens ?? 2048;

    const { signal, cleanup } = this._createTimeoutSignal(options.signal);

    const payload = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      return {
        content: content.trim(),
        model: data.model || model,
        usage: data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        raw: data
      };
    } catch (err) {
      if (err.name === "AbortError") {
        throw new ProviderTimeoutError(`Local Ollama inference timed out after ${this.timeoutMs}ms.`, {
          provider: this.id,
          originalError: err
        });
      }
      if (err instanceof ProviderError) throw err;

      throw new ProviderNetworkError(
        `Could not reach local Ollama at ${this.baseUrl}. Ensure Ollama is running ('ollama serve') with OLLAMA_ORIGINS="*" enabled for web access.`,
        { provider: this.id, originalError: err }
      );
    } finally {
      cleanup();
    }
  }

  /**
   * Discovers models pulled into local Ollama via native /api/tags or /v1/models.
   */
  async listModels(forceRefresh = false) {
    const { signal, cleanup } = this._createTimeoutSignal(null, 5000);

    // Try native Ollama tags API first (root /api/tags)
    const rootBase = this.baseUrl.replace(/\/v1$/, "");
    try {
      const res = await fetch(`${rootBase}/api/tags`, { signal });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.models) && data.models.length > 0) {
          return data.models.map((m) => ({
            id: m.name,
            name: `${m.name} (${Math.round((m.size || 0) / (1024 * 1024 * 1024) * 10) / 10} GB)`,
            description: `Locally stored weights (${m.details?.family || "LLM"})`,
            isFree: true,
            isLocal: true
          }));
        }
      }
    } catch {
      // Ignore and try /v1/models
    }

    try {
      const resV1 = await fetch(`${this.baseUrl}/models`, { signal });
      if (resV1.ok) {
        const data = await resV1.json();
        const list = Array.isArray(data.data) ? data.data : [];
        if (list.length > 0) {
          return list.map((m) => ({
            id: m.id,
            name: m.id,
            description: "Local model",
            isFree: true,
            isLocal: true
          }));
        }
      }
    } catch {
      // Local daemon is likely offline
    } finally {
      cleanup();
    }

    // Default suggested local models if daemon query fails
    return [
      { id: "llama3.2", name: "Llama 3.2 (Default)", isFree: true, isLocal: true },
      { id: "mistral", name: "Mistral 7B", isFree: true, isLocal: true },
      { id: "deepseek-r1:8b", name: "DeepSeek R1 8B", isFree: true, isLocal: true },
      { id: "qwen2.5-coder:7b", name: "Qwen 2.5 Coder 7B", isFree: true, isLocal: true }
    ];
  }

  /**
   * Validates local Ollama daemon connection.
   */
  async testConnection() {
    const startTime = Date.now();
    try {
      const result = await this.generateChat(
        [{ role: "user", content: "Reply 'OK' only." }],
        { model: this.defaultModel, maxTokens: 8, temperature: 0.1 }
      );
      const latencyMs = Date.now() - startTime;
      return {
        ok: true,
        latencyMs,
        message: `Connected to local Ollama (${result.model}) in ${latencyMs}ms. 100% private.`,
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
