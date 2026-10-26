/**
 * Prompt Generator - AI Provider Manager
 * Central state coordinator managing active inference providers, configuration persistence,
 * model discovery, transparent fallback orchestration, and event broadcasting.
 * 
 * Architectural Role:
 * - Decouples application UI completely from specific AI vendors.
 * - Safely stores API credentials in browser localStorage with zero server roundtrips.
 * - Enforces transparent failover: If an external provider encounters a network outage,
 *   timeout, or quota block, it can invoke the DeterministicFallbackProvider while explicitly
 *   tagging the output so the user always knows the exact origin of their prompt.
 */

import { PollinationsProvider } from "./PollinationsProvider.js";
import { OpenAICompatibleProvider, VENDOR_PRESETS } from "./OpenAICompatibleProvider.js";
import { OllamaProvider } from "./OllamaProvider.js";
import { DeterministicFallbackProvider } from "./DeterministicFallbackProvider.js";
import { ProviderAuthError, ProviderQuotaError, ProviderTimeoutError, ProviderNetworkError } from "./BaseProvider.js";

const STORAGE_KEY_CONFIG = "pg_ai_provider_config_v2";

export class ProviderManager {
  constructor() {
    this.listeners = new Set();
    this.fallbackProvider = new DeterministicFallbackProvider();
    
    // Default system configuration
    this.config = {
      activeProviderId: "pollinations",
      enableAutoFallback: true,
      providers: {
        pollinations: {
          apiKey: "",
          defaultModel: "openai/gpt-5.4-nano"
        },
        openai_compatible: {
          vendorPreset: "groq",
          baseUrl: VENDOR_PRESETS.groq.baseUrl,
          apiKey: "",
          defaultModel: VENDOR_PRESETS.groq.defaultModel
        },
        ollama: {
          baseUrl: "http://localhost:11434/v1",
          defaultModel: "llama3.2"
        },
        deterministic_fallback: {
          defaultModel: "deterministic-rule-engine"
        }
      }
    };

    this._loadConfig();
    this._instantiateActiveProvider();
  }

  /**
   * Subscribes a listener function to provider state changes.
   * @param {Function} callback
   * @returns {Function} unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  _notify() {
    const status = this.getPublicStatus();
    for (const listener of this.listeners) {
      try {
        listener(status);
      } catch (e) {
        console.error("ProviderManager listener error:", e);
      }
    }
  }

  /**
   * Retrieves sanitized, non-secret status descriptor for the UI.
   */
  getPublicStatus() {
    const active = this.activeProvider;
    const isFallback = active.id === "deterministic_fallback";
    return {
      providerId: active.id,
      providerName: active.name,
      model: active.defaultModel,
      isFallback,
      hasApiKey: !!active.apiKey,
      enableAutoFallback: this.config.enableAutoFallback,
      vendorPreset: active.vendorPreset || null
    };
  }

  /**
   * Returns current active provider instance.
   * @returns {BaseProvider}
   */
  getActiveProvider() {
    return this.activeProvider;
  }

  /**
   * Primary inference dispatch with resilient, transparent fallback handling.
   * @param {Array<{role: string, content: string}>} messages
   * @param {Object} [options]
   * @returns {Promise<{ content: string, model: string, provider: string, isAiGenerated: boolean, isFallback: boolean, warning?: string }>}
   */
  async generateChat(messages, options = {}) {
    const primaryProvider = this.activeProvider;

    try {
      const result = await primaryProvider.generateChat(messages, options);
      return {
        ...result,
        provider: primaryProvider.id,
        providerName: primaryProvider.name,
        isAiGenerated: primaryProvider.id !== "deterministic_fallback",
        isFallback: primaryProvider.id === "deterministic_fallback"
      };
    } catch (primaryErr) {
      console.warn(`Primary provider [${primaryProvider.id}] failed:`, primaryErr);

      // If user has auto-fallback disabled, propagate error to let UI display modal/error
      if (!this.config.enableAutoFallback || primaryProvider.id === "deterministic_fallback") {
        throw primaryErr;
      }

      // Execute transparent deterministic fallback
      console.info("Invoking Deterministic Fallback Engine due to provider failure.");
      const fallbackResult = await this.fallbackProvider.generateChat(messages, options);

      let warningMessage = primaryErr.message;
      if (primaryErr instanceof ProviderAuthError) {
        warningMessage = "AI Provider requires an API key. Generated using Deterministic Fallback.";
      } else if (primaryErr instanceof ProviderQuotaError) {
        warningMessage = "AI Provider rate limit/quota reached. Generated using Deterministic Fallback.";
      } else if (primaryErr instanceof ProviderTimeoutError) {
        warningMessage = "AI Provider timed out. Generated using Deterministic Fallback.";
      } else if (primaryErr instanceof ProviderNetworkError) {
        warningMessage = "Network error reaching AI Provider. Generated using Deterministic Fallback.";
      }

      return {
        ...fallbackResult,
        provider: "deterministic_fallback",
        providerName: this.fallbackProvider.name,
        isAiGenerated: false,
        isFallback: true,
        fallbackTriggerReason: primaryErr.message,
        warning: warningMessage
      };
    }
  }

  /**
   * Retrieves available models for the current active provider.
   */
  async listModels(forceRefresh = false) {
    return this.activeProvider.listModels(forceRefresh);
  }

  /**
   * Tests reachability of the currently active provider.
   */
  async testActiveConnection() {
    return this.activeProvider.testConnection();
  }

  /**
   * Updates configuration and rebuilds provider instances.
   * @param {Object} partialConfig
   */
  updateConfig(partialConfig) {
    if (partialConfig.activeProviderId) {
      this.config.activeProviderId = partialConfig.activeProviderId;
    }
    if (typeof partialConfig.enableAutoFallback === "boolean") {
      this.config.enableAutoFallback = partialConfig.enableAutoFallback;
    }
    if (partialConfig.providers) {
      for (const [key, val] of Object.entries(partialConfig.providers)) {
        this.config.providers[key] = {
          ...this.config.providers[key],
          ...val
        };
      }
    }

    this._saveConfig();
    this._instantiateActiveProvider();
    this._notify();
  }

  /**
   * Sets active model for the current provider.
   */
  setActiveModel(modelId) {
    const currentId = this.config.activeProviderId;
    if (this.config.providers[currentId]) {
      this.config.providers[currentId].defaultModel = modelId;
      this.activeProvider.defaultModel = modelId;
      this._saveConfig();
      this._notify();
    }
  }

  /**
   * Instantiates the active provider class based on current settings.
   * @private
   */
  _instantiateActiveProvider() {
    const id = this.config.activeProviderId;
    const providerConfig = this.config.providers[id] || {};

    switch (id) {
      case "openai_compatible":
        this.activeProvider = new OpenAICompatibleProvider({
          vendorPreset: providerConfig.vendorPreset || "groq",
          baseUrl: providerConfig.baseUrl,
          apiKey: providerConfig.apiKey,
          defaultModel: providerConfig.defaultModel
        });
        break;
      case "ollama":
        this.activeProvider = new OllamaProvider({
          baseUrl: providerConfig.baseUrl,
          defaultModel: providerConfig.defaultModel
        });
        break;
      case "deterministic_fallback":
        this.activeProvider = this.fallbackProvider;
        break;
      case "pollinations":
      default:
        this.activeProvider = new PollinationsProvider({
          apiKey: providerConfig.apiKey,
          defaultModel: providerConfig.defaultModel || "openai/gpt-5.4-nano"
        });
        break;
    }
  }

  _loadConfig() {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
        if (stored) {
          const parsed = JSON.parse(stored);
          this.config = {
            ...this.config,
            ...parsed,
            providers: {
              ...this.config.providers,
              ...(parsed.providers || {})
            }
          };
        }
      }
    } catch (e) {
      console.warn("Failed to read AI provider configuration from localStorage:", e);
    }
  }

  _saveConfig() {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(this.config));
      }
    } catch (e) {
      console.warn("Failed to persist AI provider configuration:", e);
    }
  }
}

// Export singleton instance for app-wide use
export const providerManager = new ProviderManager();
