var CACHE_NAME = 'my-site-cache-v1';

//https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle


// let version = Date.now();
let version = '2018-01-11 1423';
var urlsToCache = [
    // '/',
    // '/styles/main.css',
    // '/script/main.js'
];

//http://docs.goroost.com/
//chrome://gcm-internals/
self.addEventListener('install', function(event) {
    console.log('sw.js','install',version)
    // Perform install steps
    // event.waitUntil(
    //     caches.open(CACHE_NAME)
    //         .then(function(cache) {
    //             console.log('Opened cache');
    //             return cache.addAll(urlsToCache);
    //         })
    // );
});


// self.addEventListener('fetch', function(event) {
//     event.respondWith(
//         caches.match(event.request)
//             .then(function(response) {
//                 // Cache hit - return response
//                 if (response) {
//                     return response;
//                 }
//
//                 // IMPORTANT: Clone the request. A request is a stream and
//                 // can only be consumed once. Since we are consuming this
//                 // once by cache and once by the browser for fetch, we need
//                 // to clone the response.
//                 var fetchRequest = event.request.clone();
//
//                 return fetch(fetchRequest).then(
//                     function(response) {
//                         // Check if we received a valid response
//                         if(!response || response.status !== 200 || response.type !== 'basic') {
//                             return response;
//                         }
//
//                         // IMPORTANT: Clone the response. A response is a stream
//                         // and because we want the browser to consume the response
//                         // as well as the cache consuming the response, we need
//                         // to clone it so we have two streams.
//                         var responseToCache = response.clone();
//
//                         caches.open(CACHE_NAME)
//                             .then(function(cache) {
//                                 cache.put(event.request, responseToCache);
//                             });
//
//                         return response;
//                     }
//                 );
//             })
//     );
// });


self.addEventListener('activate', function(event) {

    var cacheWhitelist = ['pages-cache-v1', 'blog-posts-cache-v1'];

    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

//      sound: '/demos/notification-examples/audio/notification-sound.mp3'


/**
 * A vibration pattern to run with the display of the notification. A vibration pattern
 * can be an array with as few as one member. The values are times in milliseconds where the even indices (0, 2, 4, etc.)
 * indicate how long to vibrate and the odd indices indicate how long to pause.
 * For example [300, 100, 400] would vibrate 300ms, pause 100ms, then vibrate 400ms.
 * @type {number}
 */

function testNotification ()
{
    let reminderIntervalTime = 1 * (10 * 1000);
//https://stackoverflow.com/questions/29741922/prevent-service-worker-from-automatically-stopping
//https://notificationsounds.com/sound-effects/brute-force-22
//This event will stop after some period of time. Service workers do not have lengthy lifespans.
    let interval1 = setInterval(function () {
            console.log('pinging sw');
            let opts = {
                // "//": "Visual Options",
                "body": "Have emails been sent?",
                "requireInteraction": false,

                // "icon": "<URL String>",
                // "image": "<URL String>",
                // "badge": "<URL String>",
                // "vibrate": "<Array of Integers>",
                "sound": "/sounds/brute-force.mp3",
                // "dir": "<String of 'auto' | 'ltr' | 'rtl'>",

                // "//": "Behavioural Options",
                // "tag": "<String>",
                // "data": "<Anything>",
                // "requireInteraction": true,

                // "renotify": "<Boolean>", //https://developer.mozilla.org/en-US/docs/Web/API/notification/renotify not supported by mozilla
                // "silent": "<Boolean>",

                // "//": "Both Visual & Behavioural Options",
                actions: [
                    {action: 'like', title: '👍Like'},
                    {action: 'reply', title: '⤻ Reply'}]

                // "//": "Information Option. No visual affect.",
                // "timestamp": "<Long>"
            };
            self.registration.showNotification('Reminders', opts).then(function (NotificationEvent) {
                console.log('notification event', NotificationEvent);
            }, function (x, y, z) {
                console.log('notification rejected', x, y, z);
            }).catch(function (error) {
                console.log('notification error', error);
            });

        },
        reminderIntervalTime
    );
}

self.addEventListener('notificationclick', function(event) {

    console.log('notificationclick',event.action,event.notification.data,event);

    var messageId = event.notification.data;

    event.notification.close();

    if (event.action === 'like') {
        // silentlyLikeItem();
    }
    else if (event.action === 'reply') {
        // clients.openWindow("/messages?reply=" + messageId);
    }
    else {
        // clients.openWindow("/messages?reply=" + messageId);
    }
}, false);

console.log('adding push listener',version);
console.log('adding push listener ===================');

self.addEventListener('push', function(event) {
    console.log('====================== push notification',event);

    let opts = {
    };

    const promiseChain = self.registration.showNotification('Hello, World',opts);

    event.waitUntil(promiseChain);
});





// self.addEventListener('push', function(event) {
//     if (event.data) {
//         console.log('This push event has data: ', event.data.text());
//     } else {
//         console.log('This push event has no data.');
//     }
// });

/** include credentials
 fetch(url, {
    credentials: 'include'
})

 **/