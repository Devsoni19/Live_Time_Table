/* ==========================================================
   VGEC Timetable
   Service Worker
========================================================== */

const CACHE_NAME = "vgec-timetable-v1";

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

/* ---------------------------------------------------------
   Install
--------------------------------------------------------- */

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)

      .then(cache => cache.addAll(ASSETS))

  );

  self.skipWaiting();

});

/* ---------------------------------------------------------
   Activate
--------------------------------------------------------- */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()

      .then(keys =>

        Promise.all(

          keys.map(key => {

            if (key !== CACHE_NAME) {

              return caches.delete(key);

            }

          })

        )

      )

  );

  self.clients.claim();

});

/* ---------------------------------------------------------
   Fetch
--------------------------------------------------------- */

self.addEventListener("fetch", event => {

  event.respondWith(

    caches.match(event.request)

      .then(response => {

        if (response) {

          return response;

        }

        return fetch(event.request)

          .then(networkResponse => {

            const clone = networkResponse.clone();

            caches.open(CACHE_NAME)

              .then(cache => {

                cache.put(event.request, clone);

              });

            return networkResponse;

          })

          .catch(() => {

            return caches.match("./index.html");

          });

      })

  );

});