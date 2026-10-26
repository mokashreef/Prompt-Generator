/**
 * Prompt Generator - Base AI Provider Interface
 * Defines the contract, error hierarchies, and common utilities for all AI inference backends.
 * 
 * Architectural Design Rationale:
 * 1. Pluggable Backends: Any provider (Pollinations, OpenAI-compatible, Ollama, local models)
 *    conforms to this contract so the prompt pipeline remains completely decoupled from transport details.
 * 2. Explicit Error Typing: Specific error subclasses (Auth, Quota, Timeout, Network) allow UI layers
 *    to display actionable resolution steps rather than cryptic HTTP status codes.
 * 3. Client-Side Security: Providers operate strictly within browser sandboxes. API keys are never
 *    logged, forwarded to telemetry, or stored outside the user's explicit localStorage preference.
 */

export class ProviderError extends Error {
  constructor(message, { code = "PROVIDER_ERROR", status = null, originalError = null, provider = "unknown" } = {}) {
    super(message);
    this.name = "ProviderError";
    this.code = code;
    this.status = status;
    this.originalError = originalError;
    this.provider = provider;
  }
}

export class ProviderAuthError extends ProviderError {
  constructor(message, options = {}) {
    super(message, { ...options, code: "AUTH_ERROR" });
    this.name = "ProviderAuthError";
  }
}

export class ProviderQuotaError extends ProviderError {
  constructor(message, options = {}) {
    super(message, { ...options, code: "QUOTA_EXCEEDED" });
    this.name = "ProviderQuotaError";
  }
}

export class ProviderTimeoutError extends ProviderError {
  constructor(message, options = {}) {
    super(message, { ...options, code: "TIMEOUT" });
    this.name = "ProviderTimeoutError";
  }
}

export class ProviderNetworkError extends ProviderError {
  constructor(message, options = {}) {
    super(message, { ...options, code: "NETWORK_ERROR" });
    this.name = "ProviderNetworkError";
  }
}

export class ProviderModelError extends ProviderError {
  constructor(message, options = {}) {
    super(message, { ...options, code: "MODEL_UNAVAILABLE" });
    this.name = "ProviderModelError";
  }
}

export class BaseProvider {
  /**
   * @param {Object} config
   * @param {string} config.id - Unique provider identifier (e.g. 'pollinations', 'openai', 'ollama')
   * @param {string} config.name - Human-readable provider label
   * @param {string} [config.apiKey] - Optional user-supplied API key
   * @param {string} [config.baseUrl] - Base endpoint URL
   * @param {string} [config.defaultModel] - Fallback model name when none specified
   * @param {number} [config.timeoutMs=30000] - Request abort timeout in milliseconds
   */
  constructor({ id, name, apiKey = "", baseUrl = "", defaultModel = "", timeoutMs = 30000 }) {
    if (!id || !name) {
      throw new Error("BaseProvider requires both 'id' and 'name'.");
    }
    this.id = id;
    this.name = name;
    this.apiKey = apiKey ? apiKey.trim() : "";
    this.baseUrl = baseUrl ? baseUrl.replace(/\/+$/, "") : "";
    this.defaultModel = defaultModel;
    this.timeoutMs = timeoutMs;
  }

  /**
   * Primary inference entrypoint. Dispatches chat messages to the backend.
   * @param {Array<{role: string, content: string}>} messages
   * @param {Object} [options]
   * @param {string} [options.model] - Specific model ID
   * @param {number} [options.temperature=0.7] - Sampling temperature
   * @param {number} [options.maxTokens=2048] - Max completion tokens
   * @param {AbortSignal} [options.signal] - Caller-provided cancellation signal
   * @returns {Promise<{ content: string, model: string, usage?: Object, raw?: any }>}
   */
  async generateChat(messages, options = {}) {
    throw new Error(`generateChat() must be implemented by subclass '${this.constructor.name}'`);
  }

  /**
   * Discovers text models supported by this provider.
   * Returns filtered, validated model metadata.
   * @param {boolean} [forceRefresh=false] - Bypass cache if true
   * @returns {Promise<Array<{ id: string, name: string, description?: string, contextLength?: number, isFree?: boolean }>>}
   */
  async listModels(forceRefresh = false) {
    throw new Error(`listModels() must be implemented by subclass '${this.constructor.name}'`);
  }

  /**
   * Validates backend reachability and authentication credentials.
   * @returns {Promise<{ ok: boolean, latencyMs: number, message: string, details?: any }>}
   */
  async testConnection() {
    throw new Error(`testConnection() must be implemented by subclass '${this.constructor.name}'`);
  }

  /**
   * Helper to construct a combined AbortSignal with timeout.
   * Combines external caller signal with the provider's default timeout to prevent hung UI states.
   * @protected
   */
  _createTimeoutSignal(callerSignal, timeoutMs = this.timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort(new ProviderTimeoutError(`Request timed out after ${timeoutMs}ms`, { provider: this.id }));
    }, timeoutMs);

    if (callerSignal) {
      callerSignal.addEventListener("abort", () => {
        clearTimeout(timer);
        controller.abort(callerSignal.reason);
      });
    }

    return {
      signal: controller.signal,
      cleanup: () => clearTimeout(timer)
    };
  }

  /**
   * Translates native HTTP error statuses into categorized ProviderError instances.
   * @protected
   */
  _handleHttpError(status, statusText, responseBody) {
    let parsedMessage = statusText;
    try {
      if (typeof responseBody === "object" && responseBody !== null) {
        parsedMessage = responseBody.error?.message || responseBody.message || JSON.stringify(responseBody);
      } else if (typeof responseBody === "string" && responseBody.trim()) {
        try {
          const json = JSON.parse(responseBody);
          parsedMessage = json.error?.message || json.message || responseBody;
        } catch {
          parsedMessage = responseBody.slice(0, 300);
        }
      }
    } catch {
      parsedMessage = statusText;
    }

    if (status === 401 || status === 403) {
      return new ProviderAuthError(
        `Authentication failed: ${parsedMessage}`,
        { status, provider: this.id, originalError: responseBody }
      );
    }
    if (status === 429) {
      return new ProviderQuotaError(
        `Rate limit or quota exceeded: ${parsedMessage}`,
        { status, provider: this.id, originalError: responseBody }
      );
    }
    if (status === 404) {
      return new ProviderModelError(
        `Model or endpoint not found: ${parsedMessage}`,
        { status, provider: this.id, originalError: responseBody }
      );
    }
    return new ProviderError(
      `Provider request failed (HTTP ${status}): ${parsedMessage}`,
      { status, provider: this.id, originalError: responseBody }
    );
  }
}
