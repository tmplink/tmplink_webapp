const allowedTypes = ["js", "css", "jpg", "png", "woff", "svg", "gif", "ico", "ttf", "eot", "woff2","html"];
const resSet = "tmplink v6";
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
  const url = new URL(event.request.url);
  let ext = getExtension(url.pathname);
  if (isAllowedType(ext) && ext !== '') {
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

function getExtension(path) {
  if(path === '/index.html'){
    return '';
  }
  if (path.indexOf('.') === -1) {
    return '';
  }
  return path.split('.').pop();
}

function isAllowedType(ext) {
  for (let i = 0; i < allowedTypes.length; i++) {
    if (allowedTypes[i] === ext) {
      return true;
    }
  }
  return false;
}