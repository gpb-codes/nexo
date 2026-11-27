const CACHE_NAME = "nexo-static-v7";
const STATIC_ASSETS = ["/", "/styles.css", "/app.js", "/avatars.js", "/manifest.json", "/favicon.svg", "/icon-192.png", "/icon-512.png", "/apple-touch-icon.png", "/terminos", "/offline", "/brain.js", "/brain-graph.json", "/vendor/build/three.module.js", "/vendor/examples/jsm/controls/OrbitControls.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  // Never cache API or cross-origin dynamic data.
  if (url.pathname.startsWith("/api/")) return;
  if (req.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  const isNav = req.mode === "navigate";
  // Network-first: updates are visible immediately; cache is the offline fallback.
  event.respondWith(
    fetch(req).then((res) => {
      if (res && res.status === 200) {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      if (isNav) return caches.match("/offline");
      return new Response("", { status: 503 });
    })
  );
});
