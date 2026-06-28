const SHELL_CACHE = 'sjr-shell-v2';
const AUDIO_CACHE = 'sjr-audio-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== SHELL_CACHE && key !== AUDIO_CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Serve a partial (range) response from a fully-cached audio blob.
// Without this, audio seeking breaks when served from cache.
async function serveRangeFromCache(cachedResponse, rangeHeader) {
  const arrayBuffer = await cachedResponse.clone().arrayBuffer();
  const total = arrayBuffer.byteLength;

  const [, rawRange] = rangeHeader.split('=');
  const [startStr, endStr] = rawRange.split('-');
  const start = parseInt(startStr, 10);
  const end = endStr ? parseInt(endStr, 10) : total - 1;
  const chunk = arrayBuffer.slice(start, end + 1);

  return new Response(chunk, {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': cachedResponse.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Content-Length': String(chunk.byteLength),
      'Accept-Ranges': 'bytes',
    },
  });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith('/audio_files/')) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(async (cache) => {
        // Match ignoring the Range header so we find the full cached entry
        const cached = await cache.match(request, { ignoreSearch: false });

        if (cached) {
          const rangeHeader = request.headers.get('Range');
          if (rangeHeader) return serveRangeFromCache(cached, rangeHeader);
          return cached;
        }

        try {
          const response = await fetch(request);
          if (response.ok) {
            // Only cache non-range (full) responses
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
          }
          return response;
        } catch {
          return new Response('Audio not available offline', { status: 503, statusText: 'Offline' });
        }
      })
    );
    return;
  }

  // App shell: network first, fall back to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          caches.open(SHELL_CACHE).then(cache => cache.put(request, response.clone()));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
