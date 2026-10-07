/**
 * Prompt Generator - Service Worker for Full Offline Support
 * 100% Client-Side. Caches core assets on install.
 */

const CACHE_NAME = "promptgen-v2";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./robots.txt",
  "./sitemap.xml",
  "./css/main.css",
  "./css/themes.css",
  "./css/responsive.css",
  "./js/app.js",
  "./js/data/translations.js",
  "./js/data/taskProfiles.js",
  "./js/data/examples.js",
  "./js/engine/intentDetector.js",
  "./js/engine/promptEngine.js",
  "./js/engine/actionTransformer.js",
  "./js/engine/qualityEvaluator.js",
  "./js/engine/storage.js",
  "./js/ui/formRenderer.js",
  "./js/ui/modals.js",
  "./js/ui/toast.js",
  "./assets/icons/favicon.svg"
];

// Install: Pre-cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up old cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Cache-first with network fallback
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  // Bypass service worker for zip downloads to guarantee native browser download behavior
  if (event.request.url.endsWith(".zip") || event.request.url.includes(".zip")) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Cache dynamic runtime files if valid
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline fallback if HTML page requested
        if (event.request.headers.get("accept")?.includes("text/html")) {
          return caches.match("./index.html");
        }
      });
    })
  );
});
