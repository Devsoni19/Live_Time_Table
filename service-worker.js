/* ==========================================================================
   VGEC Timetable - PWA Service Worker (Stale-While-Revalidate Caching Model)
   ========================================================================== */

const CACHE_NAME = "vgec-timetable-cache-v1.3.3";

const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",

  "/CSS/style.css",

  "/JS/app.js",
  "/JS/cacheService.js",
  "/JS/constants.js",
  "/JS/firebase.js",
  "/JS/theme.js",
  "/JS/timetableService.js",

  "/icons/icon-192.png",
  "/icons/icon-512.png",

  "/References/logo.png"
];

// Cache rules for Google Fonts
const GOOGLE_FONT_DOMAINS = [
  "fonts.googleapis.com",
  "fonts.gstatic.com"
];

// ==========================================
// 1. Installation Phase (Pre-cache Shell)
// ==========================================
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        console.log("[Service Worker] Caching app shell assets...");
        return await Promise.all(
          PRECACHE_ASSETS.map(async asset => {
            try {
              await cache.add(asset);
              console.log("✅ Cached:", asset);
            } catch (err) {
              console.error("❌ Failed to cache:", asset, err);
            }
          })
        );
      })
      .then(() => self.skipWaiting())
      .catch(err => {
        console.error("[Service Worker] Pre-cache failed: ", err);
      })
  );
});

// ==========================================
// 2. Activation Phase (Old Cache Eviction)
// ==========================================
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Deleting outdated cache: ", key);
            return caches.delete(key);
          }
        })
      );
    })
      .then(() => self.clients.claim())
  );
});

// ==========================================
// 3. Fetch Strategy (Stale-While-Revalidate)
// ==========================================
self.addEventListener("fetch", event => {
  // Only intercept HTTP/HTTPS GET requests (e.g. ignore chrome extension requests)
  if (event.request.method !== "GET" || !event.request.url.startsWith("http")) {
    return;
  }

  const url = new URL(event.request.url);

  // Check if request is for app assets or Google Fonts
  const isAppShell = PRECACHE_ASSETS.some(asset => {
    // Resolve relative asset paths to absolute url path matches
    if (asset === "./" || asset === "/") {
      return url.pathname === "/" || url.pathname === "/index.html";
    }
    return url.pathname.endsWith(asset.replace(/^\.\//, ""));
  });

  const isFont = GOOGLE_FONT_DOMAINS.includes(url.hostname);

  if (isAppShell || isFont) {
    // Apply Stale-While-Revalidate Strategy
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        }).catch(err => {
          console.warn("[Service Worker] Fetch failed, serving stale resource: ", err);
        });

        // Return cache instantly if exists, otherwise wait for network
        return cachedResponse || fetchPromise;
      })
    );
  } else {
    // General assets: Network-first, fallback to Cache
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // For failed navigation, return the cached index.html
            if (event.request.mode === "navigate") {
              return caches.match("./index.html") || caches.match("/");
            }
          });
        })
    );
  }
});