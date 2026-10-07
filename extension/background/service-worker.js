/**
 * Prompt Generator - Background Service Worker (Manifest V3)
 * Handles context menus, keyboard shortcuts, and Chrome Side Panel integration.
 * Zero external telemetry or remote network requests.
 */

const CONTEXT_MENU_ID = "promptgen_improve_context";

chrome.runtime.onInstalled.addListener(() => {
  // 1. Setup Context Menu for selected text
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: "Improve Prompt / تحسين البرومبت",
      contexts: ["selection"]
    });
  });

  // 2. Configure Side Panel behavior
  if (chrome.sidePanel && typeof chrome.sidePanel.setPanelBehavior === "function") {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});
  }
});

// Handle Context Menu click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID && tab && tab.id) {
    const selectedText = info.selectionText || "";

    // Save selection payload to local storage
    await chrome.storage.local.set({
      promptgen_active_selection: {
        text: selectedText,
        tabId: tab.id,
        timestamp: Date.now(),
        action: "improve"
      }
    });

    // Open Side Panel for this tab
    if (chrome.sidePanel && typeof chrome.sidePanel.open === "function") {
      try {
        await chrome.sidePanel.open({ tabId: tab.id });
      } catch (err) {
        console.warn("[Prompt Generator] Could not open side panel directly:", err);
      }
    }

    // Broadcast message to open sidepanel/popup listeners
    chrome.runtime.sendMessage({
      type: "SELECTION_CHANGED",
      text: selectedText,
      tabId: tab.id
    }).catch(() => {});
  }
});

// Handle Keyboard Shortcut command (Ctrl+Shift+P / Command+Shift+P)
chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command === "improve-prompt" && tab && tab.id) {
    try {
      // Query content script for selection
      const response = await chrome.tabs.sendMessage(tab.id, { type: "GET_SELECTION" });
      const selectedText = response && response.text ? response.text : "";

      await chrome.storage.local.set({
        promptgen_active_selection: {
          text: selectedText,
          tabId: tab.id,
          timestamp: Date.now(),
          action: "improve"
        }
      });

      if (chrome.sidePanel && typeof chrome.sidePanel.open === "function") {
        await chrome.sidePanel.open({ tabId: tab.id });
      }
    } catch (err) {
      // Content script may not be injected on restricted pages (e.g. chrome://)
      console.warn("[Prompt Generator] Command handling fallback:", err);
    }
  }
});
