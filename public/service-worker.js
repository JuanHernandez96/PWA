const APP_PREFIX = 'Budget-Tracker-';
const VERSION = 'v1';
const CACHE_NAME = APP_PREFIX + VERSION;
const DATA_CACHE_NAME = "data-cache-" + VERSION;

// caching more files 
const FILES_TO_CACHE = [
  "./index.html",
  "./css/styles.css",
  "./js/idb.js",
  "./js/index.js",
  "./manifest.json",
  "./icons/icon-72x72.png",
  "./icons/icon-96x96.png",
  "./icons/icon-128x128.png",
  "./icons/icon-144x144.png",
  "./icons/icon-152x152.png",
  "./icons/icon-192x192.png",
  "./icons/icon-384x384.png",
  "./icons/icon-512x512.png",
]

// first fetch response 
self.addEventListener('fetch', function (e) {
    console.log('fetch request : ' + e.request.url)
    e.respondWith(
      caches.match(e.request).then(function (request) {
        if (request) { 
          console.log('responding with cache : ' + e.request.url)
          return request
        } else {
          console.log('file is not cached, fetching : ' + e.request.url)
          return fetch(e.request)
        }


      })
    )
  })



self.addEventListener('install', function (e) {
    e.waitUntil(
      caches.open(CACHE_NAME).then(function (cache) {
        console.log('installing cache : ' + CACHE_NAME)
        return cache.addAll(FILES_TO_CACHE)
      })
    )
  })





  // added another fetch request to see if this would help issue with service worker on heroku
  self.addEventListener("fetch", function(e) {
    if (e.request.url.includes("/api/")) {
      e.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => { 
          return fetch(e.request)
          .then(response => {
            if (response.status === 200) {
              cache.put(e.request.url, response.clone());
            }

            return response;
          })
          .catch(err => {
            return cache.match(e.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }
  e.respondWith(
    fetch(e.request).catch(function() {
      return caches.match(e.request).then(function(response) {
        if (response) {
          return response;
        } else if (e.request.headers.get("accept").includes("text/html")) {
          return caches.match("/");
        }
      });
    })
  );
});


self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keyList) {
      let cacheKeeplist = keyList.filter(function(key) {
        return key.indexOf(APP_PREFIX);
      });
      cacheKeeplist.push(CACHE_NAME);

      return Promise.all(
        keyList.map(function(key, i) {
          if (cacheKeeplist.indexOf(key) === -1) {
            console.log('deleting cache : ' + keyList[i]);
            return caches.delete(keyList[i]);
          }
        })
      );
    })
  );
});