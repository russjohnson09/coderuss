
https://travis-ci.org/russjohnson09/coderuss/jobs/221319904
```
[phantomjs #0-1]   get code from client
[phantomjs #0-1]       ✓ /v1/oauth/authorize with client_id, redirect_uri, and state
[phantomjs #0-1]
[phantomjs #0-1]
[phantomjs #0-1] 5 passing (11s)
[phantomjs #0-1] 1 failing
[phantomjs #0-1]
[phantomjs #0-1] 1) oauth_client_spec should be able to login:
[phantomjs #0-1] Timeout of 10000ms exceeded. Try to reduce the run time or increase your timeout for test specs (http://webdriver.io/guide/testrunner/timeouts.html); if returning a Promise, ensure it resolves.
[phantomjs #0-1] Error: Timeout of 10000ms exceeded. Try to reduce the run time or increase your timeout for test specs (http://webdriver.io/guide/testrunner/timeouts.html); if returning a Promise, ensure it resolves.
[phantomjs #0-1]     at Timeout.<anonymous> (/home/travis/build/russjohnson09/coderuss/node_modules/mocha/lib/runnable.js:232:19)
[phantomjs #0-1]     at ontimeout (timers.js:380:14)
[phantomjs #0-1]     at tryOnTimeout (timers.js:244:5)
[phantomjs #0-1]     at Timer.listOnTimeout (timers.js:214:5)
[phantomjs #0-1]
```


https://travis-ci.org/russjohnson09/coderuss/jobs/221323444
```
[phantomjs #0-1] Session ID: ff801490-1f78-11e7-8303-b15c2594da3f
[phantomjs #0-1] Spec: /home/travis/build/russjohnson09/coderuss/wdiotests/main/oauth_client_spec.js
[phantomjs #0-1] Running: phantomjs
[phantomjs #0-1]
[phantomjs #0-1]   oauth_client_spec
[phantomjs #0-1]
[phantomjs #0-1]   oauth_client_spec
[phantomjs #0-1]       ✓ open login page
[phantomjs #0-1]       ✓ should be able to login
[phantomjs #0-1]
[phantomjs #0-1]   create an oauthclient
[phantomjs #0-1]
[phantomjs #0-1]   go to oauthclient page
[phantomjs #0-1]       ✓ browser url
[phantomjs #0-1]       1) /oauthclient validate
[phantomjs #0-1]
[phantomjs #0-1]   submit oauthclient
[phantomjs #0-1]       2) /oauthclient validate
[phantomjs #0-1]
[phantomjs #0-1]   get code from client
[phantomjs #0-1]       3) /v1/oauth/authorize with client_id, redirect_uri, and state
[phantomjs #0-1]       ✓ save screenshot
[phantomjs #0-1]
[phantomjs #0-1]
[phantomjs #0-1] 4 passing (2s)
[phantomjs #0-1] 3 failing
[phantomjs #0-1]
[phantomjs #0-1] 1) go to oauthclient page /oauthclient validate:
[phantomjs #0-1] expected false to be true
[phantomjs #0-1] AssertionError: expected false to be true
[phantomjs #0-1]     at Context.<anonymous> (/home/travis/build/russjohnson09/coderuss/wdiotests/main/oauth_client_spec.js:42:80)
[phantomjs #0-1]     at F (/home/travis/build/russjohnson09/coderuss/node_modules/wdio-sync/node_modules/core-js/library/modules/_export.js:35:28)
[phantomjs #0-1]
[phantomjs #0-1] 2) submit oauthclient /oauthclient validate:
[phantomjs #0-1] expected false to be true
[phantomjs #0-1] AssertionError: expected false to be true
[phantomjs #0-1]     at Context.<anonymous> (/home/travis/build/russjohnson09/coderuss/wdiotests/main/oauth_client_spec.js:48:80)
[phantomjs #0-1]     at F (/home/travis/build/russjohnson09/coderuss/node_modules/wdio-sync/node_modules/core-js/library/modules/_export.js:35:28)
[phantomjs #0-1]
[phantomjs #0-1] 3) get code from client /v1/oauth/authorize with client_id, redirect_uri, and state:
[phantomjs #0-1] oauthClient is not defined
[phantomjs #0-1] ReferenceError: oauthClient is not defined
[phantomjs #0-1]     at Context.<anonymous> (/home/travis/build/russjohnson09/coderuss/wdiotests/main/oauth_client_spec.js:66:39)
[phantomjs #0-1]     at F (/home/travis/build/russjohnson09/coderuss/node_modules/wdio-sync/node_modules/core-js/library/modules/_export.js:35:28)
```


https://travis-ci.org/russjohnson09/coderuss/jobs/221329144
```
[phantomjs #0-1] Session ID: b7705400-1f7b-11e7-a95b-8dfd6075408e
[phantomjs #0-1] Spec: /home/travis/build/russjohnson09/coderuss/wdiotests/main/oauth_client_spec.js
[phantomjs #0-1] Running: phantomjs
[phantomjs #0-1]
[phantomjs #0-1]   oauth_client_spec
[phantomjs #0-1]
[phantomjs #0-1]   oauth_client_spec
[phantomjs #0-1]       ✓ open login page
[phantomjs #0-1]       1) should be able to login
[phantomjs #0-1]
[phantomjs #0-1]   create an oauthclient
[phantomjs #0-1]
[phantomjs #0-1]   go to oauthclient page
[phantomjs #0-1]       ✓ browser url
[phantomjs #0-1]       ✓ /oauthclient validate
[phantomjs #0-1]
[phantomjs #0-1]   submit oauthclient
[phantomjs #0-1]       2) /oauthclient validate
[phantomjs #0-1]
[phantomjs #0-1]   get code from client
[phantomjs #0-1]       3) /v1/oauth/authorize with client_id, redirect_uri, and state
[phantomjs #0-1]       ✓ save screenshot
[phantomjs #0-1]
[phantomjs #0-1]
[phantomjs #0-1] 4 passing (11s)
[phantomjs #0-1] 3 failing
[phantomjs #0-1]
[phantomjs #0-1] 1) oauth_client_spec should be able to login:
[phantomjs #0-1] Timeout of 10000ms exceeded. Try to reduce the run time or increase your timeout for test specs (http://webdriver.io/guide/testrunner/timeouts.html); if returning a Promise, ensure it resolves.
[phantomjs #0-1] Error: Timeout of 10000ms exceeded. Try to reduce the run time or increase your timeout for test specs (http://webdriver.io/guide/testrunner/timeouts.html); if returning a Promise, ensure it resolves.
[phantomjs #0-1]     at Timeout.<anonymous> (/home/travis/build/russjohnson09/coderuss/node_modules/mocha/lib/runnable.js:232:19)
[phantomjs #0-1]     at ontimeout (timers.js:380:14)
[phantomjs #0-1]     at tryOnTimeout (timers.js:244:5)
[phantomjs #0-1]     at Timer.listOnTimeout (timers.js:214:5)
```