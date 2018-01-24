// let publicKey = 'BFgD8K37Qy7KQSGlfin6cVNCL9CN2g2u9SqgJVN6qXFl3PkSR8Qg7uf-mv5bDDpsrZ7xtwbtsrU_rXD55Ep-tvA';

let publicKey ='BEp4gHGN1a3U_x7aufyR8rIwSDzpF1sxGhJndUmnJe7RtPgytNYFOuzRkcSWqmdWjLyYj9soY4fNFBOfBQgSnY0';

//https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription/endpoint
//I think the endpoint pointing to googleapis for chrome is fine.
//endpoint should be kept secret.
``
//mozilla has there own push services endpoint.


//I am having multiple subscribers with this method in dev.
//Maybe on the backend I can filter out duplicates.
//For messages I am passing in an _id and filtering dups on the frontend.
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        //https://developer.mozilla.org/en-US/docs/Web/API/PushManager/getSubscription
        navigator.serviceWorker.register('sw.js').then(function (registration) {
            //https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription/unsubscribe
            let reg = registration;
            reg.pushManager.getSubscription().then(function(subscription) {
                console.log('getSubscription',subscription);
            });

            console.log(registration.pushManager);

            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);

            const subscribeOptions = {
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey)
            };

            return registration.pushManager.subscribe(subscribeOptions);


        }, function (err) {
            console.log('ServiceWorker registration failed: ', err);
        })//Uncaught (in promise) DOMException: Registration failed - A subscription with a different applicationServerKey (or gcm_sender_id) already exists; to change the applicationServerKey, unsubscribe then resubscribe.
            //unregister if key changes
            .then(function (pushSubscription) {
                sendSubscriptionToBackEnd(pushSubscription);
                console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
                return pushSubscription;
            });
    });
}


function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/')
    ;
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}


function sendSubscriptionToBackEnd(subscription) {
    //https://github.com/github/fetch#sending-cookies
    return fetch('/v1/pushnotifications/save-subscription', {
        credentials: 'same-origin',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
    })
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Bad status code from server.');
            }

            return response.json();
        })
        .then(function(responseData) {
            console.log('saved subscription',responseData)
        });
}

function askPermission() {
    return new Promise(function (resolve, reject) {
        const permissionResult = Notification.requestPermission(function (result) {
            resolve(result);
        });

        if (permissionResult) {
            permissionResult.then(resolve, reject);
        }
    })
        .then(function (permissionResult) {
            if (permissionResult !== 'granted') {
                throw new Error('We weren\'t granted permission.');
            }
        });
}