const CACHE_NAME = 'smart-desk-cache-v2'; // Increment version to trigger update

const urlsToCache = ['/', '/manifest.json', '/icon.svg'];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
  self.skipWaiting(); // Activates new SW immediately
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))),
      ),
  );
  self.clients.claim(); // Take control of clients immediately
});

// Fetch event with network-first strategy for automatic updates
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache the fetched response
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Fall back to cache if network fails
        return caches.match(event.request);
      }),
  );
});
