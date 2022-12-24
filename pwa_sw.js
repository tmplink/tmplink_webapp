const resSet = "tmplink 935";
const assets = [
  '/',
];
var domainList = ['ttttt.link', 'tmp.link', 'static.vx-cdn.com','127.0.0.1'];

self.addEventListener("install", installEvent => {
  //安装时强制跳过等待，直接进入 active
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

self.addEventListener("fetch", fetchEvent => {
  var domain = new URL(fetchEvent.request.url).hostname;
  var requestPath = new URL(fetchEvent.request.url).pathname;
  if (domainList.indexOf(domain) !== -1 && requestPath !== '/index.html') {
    fetchEvent.respondWith(
      caches.match(fetchEvent.request).then(res => {
        return res || fetch(fetchEvent.request);
      })
    );
  }
});