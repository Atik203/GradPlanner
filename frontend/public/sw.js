const CACHE_VERSION = "v1";
const STATIC_CACHE = `gradplanner-static-${CACHE_VERSION}`;
const API_CACHE = `gradplanner-api-${CACHE_VERSION}`;

const STATIC_PATTERNS = [/^\/fonts\//, /^\/icons\//, /^\/_next\/static\//];
const API_CACHE_FIRST = [/^\/api\/v1\/countries/, /^\/api\/v1\/rankings/, /^\/api\/v1\/pathways/];
const API_NETWORK_FIRST = [
  /^\/api\/v1\/profile/,
  /^\/api\/v1\/universities/,
  /^\/api\/v1\/professors/,
  /^\/api\/v1\/applications/,
  /^\/api\/v1\/documents/,
  /^\/api\/v1\/dashboard/,
  /^\/api\/v1\/analytics/,
  /^\/api\/v1\/notifications/,
  /^\/api\/v1\/search/,
  /^\/api\/v1\/settings/,
  /^\/api\/v1\/timeline/,
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== API_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

function isPatternMatch(url, patterns) {
  return patterns.some((p) => p.test(url));
}

function isMutationMethod(method) {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, non-API, non-same-origin
  if (!url.origin.includes(self.location.origin) && !url.pathname.startsWith("/api/")) return;

  // Static assets: Cache First
  if (isPatternMatch(url.pathname, STATIC_PATTERNS)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetchAndCache(request, STATIC_CACHE))
    );
    return;
  }

  // API cache-first (reference data)
  if (request.method === "GET" && isPatternMatch(url.pathname, API_CACHE_FIRST)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetchAndCache(request, API_CACHE))
    );
    return;
  }

  // API network-first (user data)
  if (request.method === "GET" && isPatternMatch(url.pathname, API_NETWORK_FIRST)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(API_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || new Response(JSON.stringify({ success: false, error: "Offline", code: "OFFLINE" }), { status: 503, headers: { "Content-Type": "application/json" } })))
    );
    return;
  }

  // Mutations: Network Only
  if (isMutationMethod(request.method)) {
    return;
  }

  // Everything else: Network First with offline fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (request.method === "GET" && response.ok && response.type === "basic") {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

function fetchAndCache(request, cacheName) {
  return fetch(request).then((response) => {
    if (response.ok && response.type === "basic") {
      const clone = response.clone();
      caches.open(cacheName).then((cache) => cache.put(request, clone));
    }
    return response;
  });
}
