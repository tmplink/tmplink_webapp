const resSet = "tmplink";
const assets = [
    "/",
    "/img/ico/logo-256x256.png",
    "/img/screenshots/1.png",
    "/img/screenshots/2.png",
    "/js/tools/jquery.min.js",
    "/js/tools/clipboard.min.js",
    "/js/tools/jquery.cookie.js",
    "/js/tools/sha1.js",
    "/js/tools/base64.js",
    "/js/tools/jquery.tooltips.js",
    "/plugin/bootstrap4.6/js/bootstrap.bundle.min.js",
    "/plugin/bootstrap4.6/css/bootstrap.min.css",
    "/plugin/tabler/min.js",
    "/plugin/tabler/min.css",
    "/plugin/onsnap/js.js",
    "/plugin/onsnap/css.css",
];

self.addEventListener("install", installEvent => {
    installEvent.waitUntil(
        caches.open(resSet).then(cache => {
            cache.addAll(assets);
        })
    );
});

self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
        caches.match(fetchEvent.request).then(res => {
            return res || fetch(fetchEvent.request);
        })
    );
});