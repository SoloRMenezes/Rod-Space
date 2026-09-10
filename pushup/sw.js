const CACHE = "pushup-v6";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./js/app.js",
  "./js/progress.js",
  "./js/detection.js",
  "./js/storage.js",
  "./js/camera.js",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./vendor/vision_bundle.mjs",
  "./vendor/blaze_face_short_range.tflite",
  "./vendor/wasm/vision_wasm_internal.js",
  "./vendor/wasm/vision_wasm_internal.wasm",
  "./vendor/wasm/vision_wasm_nosimd_internal.js",
  "./vendor/wasm/vision_wasm_nosimd_internal.wasm",
];
self.addEventListener("install", (event) =>
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(ASSETS);
      await cache.put(
        new URL("./offline-ready", self.location).href,
        new Response("ready"),
      );
      self.skipWaiting();
    })(),
  ),
);
self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys())
        if (key.startsWith("pushup-") && key !== CACHE)
          await caches.delete(key);
      await self.clients.claim();
      for (const client of await self.clients.matchAll())
        client.postMessage("offline-ready");
    })(),
  ),
);
self.addEventListener("fetch", (event) => {
  if (
    event.request.method !== "GET" ||
    new URL(event.request.url).origin !== self.location.origin
  )
    return;
  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request, { cacheName: CACHE });
      if (cached) return cached;
      try {
        return await fetch(event.request);
      } catch (error) {
        if (event.request.mode === "navigate")
          return (
            (await caches.match(new URL("./index.html", self.location).href, {
              cacheName: CACHE,
            })) || Response.error()
          );
        throw error;
      }
    })(),
  );
});
