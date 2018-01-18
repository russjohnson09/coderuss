var CACHE_NAME = 'my-site-cache-v1';
let version = '2018-01-18 0721';
var urlsToCache = [
];

let pushEvents = {};
function doNotification(jsonObj,event)
{
    if (pushEvents[jsonObj._id] !== undefined) {
        console.log('already received message skipping');
        return;
    }
    jsonObj.opts = jsonObj.opts || {}
    let opts = {
        // "image": "/favicon.ico", //large image
        "icon": "/favicon.ico"
    };
    Object.assign(opts,jsonObj.opts);

//     opts = {
//         json.opts,
//     // "body": "Have emails been sent?",
// };

    pushEvents[jsonObj._id] = jsonObj;
    console.log('This push event has data: ',
        // event,
        jsonObj,
        // text,
        // pushEvents
    );

    // "icon": "<URL String>",
    // "image": "<URL String>",
    //     console.log('====================== push notification',event)

    const promiseChain = self.registration.showNotification(jsonObj.message,opts);

    if (event) {
        event.waitUntil(promiseChain);
    }
}

// doTestNotifications();
function doTestNotifications()
{
    console.log('doTestNotifications',self.registration.scope,
        self.registration.scope === 'http://localhost:3000/angular/');
    if (self.registration.scope === 'http://localhost:3000/angular/') {
        doNotification({
            '_id': Date.now(),
            'message': 'Scope on this service worker is ' + self.registration.scope
        });

        doNotification({
            '_id': Date.now(),
            'message': JSON.stringify(self.registration,null,'   ')
        });

        doNotification({
            '_id': Date.now(),
            'message': 'Hello world'
        });
    }

}




self.addEventListener('push', function(event) {
    if (!event.data) {
        console.log('This push event has no data.');
        return;
    }
    let json = event.data.json();
    doNotification(json,event);
});


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


//http://docs.goroost.com/
//chrome://gcm-internals/
self.addEventListener('install', function(event) {
    console.log('sw.js','install',version)
});

self.addEventListener('activate', function(event) {

    // var cacheWhitelist = ['pages-cache-v1', 'blog-posts-cache-v1'];
    //
    // event.waitUntil(
    //     caches.keys().then(function(cacheNames) {
    //         return Promise.all(
    //             cacheNames.map(function(cacheName) {
    //                 if (cacheWhitelist.indexOf(cacheName) === -1) {
    //                     return caches.delete(cacheName);
    //                 }
    //             })
    //         );
    //     })
    // );
});


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