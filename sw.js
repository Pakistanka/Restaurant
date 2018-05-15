'use strict'

let filesToCache = [
  '.',
  'css/styles.css',
  'img/1.jpg',
  'img/2.jpg',
  'img/3.jpg',
  'img/4.jpg',
  'img/5.jpg',
  'img/6.jpg',
  'img/7.jpg',
  'img/8.jpg',
  'img/9.jpg',
  'img/10.jpg',
  'index.html',
  'restaurant.html',
  'js/main.js', 
  'js/restaurant_info.js',
  'data/restaurants.json'
];

let staticCacheName = 'pages-cache-v1';
//cache the application shell
self.addEventListener('install', function(event) {
  console.log('Attempting to install service worker and cache static assets');
  event.waitUntil(
    caches.open(staticCacheName)
    .then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});
// used to update cache
self.addEventListener('activate', function(event) {
  console.log('Activating new service worker...');

  var cacheWhitelist = [staticCacheName];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          //delete outdated caches
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Removed ', cacheName, ' from cache');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
// intercept requests for files from the network and respond with the files from the cache.
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        console.log('Found ', event.request.url, ' in cache');
        return response;
      }
      
      if ( event.request.url.indexOf('https://maps.g') == 0 ) {
        console.log('Fetching gmaps ', event.request.url);
        return caches.open(staticCacheName).then(cache => {
          return fetch(event.request).then(response => {
            // Put a copy of the response in the cache.
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      } else {
        console.log('Network request for ', event.request.url);
        return fetch(event.request);
      }
    })
  );
});

