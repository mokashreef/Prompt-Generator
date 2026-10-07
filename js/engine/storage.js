/**
 * Prompt Generator - Local Storage & Client-Side State Manager
 * 100% Client-side. Zero external telemetry or server requests.
 */

const STORAGE_KEYS = {
  LANG: "promptgen_language",
  THEME: "promptgen_theme",
  HISTORY: "promptgen_history",
  FAVORITES: "promptgen_favorites",
  CONFIG: "promptgen_last_config"
};

export const storage = {
  // --- Language ---
  getLanguage(defaultLang = "ar") {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LANG);
      if (stored === "ar" || stored === "en") return stored;
      // Default to Arabic as requested by user, or detect browser
      return defaultLang;
    } catch (e) {
      return defaultLang;
    }
  },

  setLanguage(lang) {
    try {
      localStorage.setItem(STORAGE_KEYS.LANG, lang === "en" ? "en" : "ar");
    } catch (e) {
      console.warn("Unable to save language preference:", e);
    }
  },

  // --- Theme ---
  getTheme(defaultTheme = "dark") {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME);
      if (stored === "dark" || stored === "light") return stored;
      // Check system preference
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
        return "light";
      }
      return defaultTheme;
    } catch (e) {
      return defaultTheme;
    }
  },

  setTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme === "light" ? "light" : "dark");
    } catch (e) {
      console.warn("Unable to save theme preference:", e);
    }
  },

  // --- History ---
  getHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn("Unable to read history:", e);
      return [];
    }
  },

  saveToHistory(item) {
    try {
      const history = this.getHistory();
      // Prepend and keep max 30 items
      const updated = [item, ...history.filter(h => h.id !== item.id)].slice(0, 30);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn("Unable to save history item:", e);
      return [];
    }
  },

  deleteHistoryItem(id) {
    try {
      const history = this.getHistory();
      const updated = history.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      return [];
    }
  },

  clearHistory() {
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
      return true;
    } catch (e) {
      return false;
    }
  },

  // --- Favorites ---
  getFavorites() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  },

  isFavorite(promptId) {
    const favs = this.getFavorites();
    return favs.some(f => f.id === promptId);
  },

  toggleFavorite(item) {
    try {
      const favs = this.getFavorites();
      const existsIndex = favs.findIndex(f => f.id === item.id);
      let updated;
      let isNowFav;

      if (existsIndex >= 0) {
        updated = favs.filter(f => f.id !== item.id);
        isNowFav = false;
      } else {
        updated = [{ ...item, isFavorite: true, favoritedAt: Date.now() }, ...favs].slice(0, 50);
        isNowFav = true;
      }

      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
      return { isFavorite: isNowFav, favorites: updated };
    } catch (e) {
      console.warn("Unable to toggle favorite:", e);
      return { isFavorite: false, favorites: [] };
    }
  },

  removeFavorite(id) {
    try {
      const favs = this.getFavorites();
      const updated = favs.filter(f => f.id !== id);
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
      return updated;
    } catch (e) {
      return [];
    }
  },

  // --- Last Active Config ---
  getLastConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  setLastConfig(config) {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    } catch (e) {
      // ignore
    }
  }
};
