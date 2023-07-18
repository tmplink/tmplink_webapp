const allowedDomain = ["static.vx-cdn.com","tmp.link","ttttt.link","www.tmp.link","www.ttttt.link"];
const resSet = "1170";
const assets = [
  '/',
];

self.addEventListener("install", installEvent => {
  self.skipWaiting();
  installEvent.waitUntil(
    caches.open(resSet).then(cache => {
      cache.addAll(assets);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== resSet) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }
  const url = new URL(event.request.url);
  const domain = url.hostname;
  if (isAllowDomain(domain)) {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          if (response.status === 200) {
            caches.open(resSet).then(cache => {
              cache.put(event.request, response);
            });
          }
          return response.clone();
        });
      })
    );
  }
})


function isAllowDomain(domain){
  for (let i = 0; i < allowedDomain.length; i++) {
    if (allowedDomain[i] === domain) {
      return true;
    }
  }
  return false;
}