const allowedTypes = ["js", "css", "jpg", "png", "webp", "woff", "svg", "gif", "ico", "ttf", "eot", "woff2", "html",'json','index','webmanifest'];
const allowedDomain = ["static.vx-cdn.com","tmp.link","ttttt.link","gstatic.com","www.recaptcha.net","127.0.0.1","googletagmanager.com","google-analytics.com"];
const resSet = "tmplink v1053";
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
  const domain = url.hostname;
  let ext = getExtension(url.pathname);
  if (isAllowedType(ext) && ext !== '' && isAllowDomain(domain)) {
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
  if (path === '/') {
    return 'index';
  }
  if (path.indexOf('.') === -1) {
    return 'index';
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

function isAllowDomain(domain){
  for (let i = 0; i < allowedDomain.length; i++) {
    if (allowedDomain[i] === domain) {
      return true;
    }
  }
  return false;
}