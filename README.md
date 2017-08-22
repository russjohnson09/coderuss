[![Coverage Status](https://coveralls.io/repos/github/russjohnson09/coderuss/badge.svg?branch=master)](https://coveralls.io/github/russjohnson09/coderuss?branch=master)
[![Build Status](https://secure.travis-ci.org/russjohnson09/coderuss.png?branch=master)](https://travis-ci.org/russjohnson09/coderuss)
[![dependencies Status](https://david-dm.org/russjohnson09/coderuss/status.svg)](https://david-dm.org/russjohnson09/coderuss)
[![Code Climate](https://codeclimate.com/github/russjohnson09/coderuss/badges/gpa.svg)](https://codeclimate.com/github/russjohnson09/coderuss)
[![Issue Count](https://codeclimate.com/github/russjohnson09/coderuss/badges/issue_count.svg)](https://codeclimate.com/github/russjohnson09/coderuss)
[Uptime last 7 days.](https://coderuss.herokuapp.com ) [![Statuscake Uptime Monitoring](https://app.statuscake.com/button/index.php?Track=BVzY2dDKip&Days=7&Design=6)](https://codeclimate.com/github/russjohnson09/coderuss)

# Coderuss
This repo is focused on implementing a web service and frontend
for using this service. Initially I mad no assumptions on what
the best way to do this but have ended up using node for
the api. The frontend is still undecided. Test cases are primarily
endpoint tests although there will definitely be a need for
unit tests when a service is not practical or not efficient.

# Install
* Install mongo ```docker/scripts/mongo-install.sh```
* Start mongo ```docker/scripts/mongo-start.sh```
* Install node packages. ```npm install```
* Copy .env.example to .env
* Optionally install frotz ```sudo apt-get install frotz```
* Start node server ```npm start```
* Run tests ```npm run test```

# Features
There is an attempt to document features here but this list should not be considered
complete. Reference tests as the source of truth.

## TV Shows
See ```nodeserver/tests/main/tvshows/tvshows_notifications_spec.js``` for tests.
###Endpoints
* /v1/proxy/tvmaze/* proxy to tvmaze api (public but not over https)

###Cron
Check tv shows for next air date and notify user. Todos module manages user
socket io for the time being.


# Changelog
* /github/webhook POST webhook added
* /angular (ui endpoint) added movie search
* /v1/ping/eventlogger POST added for lob and potentially others
* /api/v1/files/tmp added expirationCount to delete after x uses 
* /postcards/preview
* /postcards/test UI testing postcards api
* /v1/postcards POST protected by paywall
* /v1/users/:id/inc POST increase available credit available to user
* /v1/users/:id/dec POST decrease available credit available to user
* /v1/postcards/send/test POST added
* /postcards UI added (test only)
* Added loopback app as /v2
* Added faxing with phaxio.
* Added basic TRD mkdocs, fixes #110
* Added logsene token to user profile and /v1/logsene/errors GET (fixes #67)
* Added oauth token linking to github accounts. 2017-03 #69
* fix to broken cdn https://cdn.socket.io/socket.io-1.4.5.js
* added ability to reset password /v1/passwordresetrequest and /v1/passwordreset/:token see login_spec.js
* added oauth spec
* moved cdn to repo
* /v1/todos/public/ display datetime on notification for debugging fixes #2
* added external_resources fixes #47

# TODOS
* Checkout with unique id for postcards to prevent duplication.

## Billing Invoicing
Something like this https://github.com/overshard/timestrap for time tracking
and invoicing. Tmetric did a good job but billing is now a paid feature.

## Release Notes
Send release notes to users from some directory in the repo.

##Checkout
Add orders, products, anything needed for a full featured ecommerce site. Use https://www.pwinty.com/ApiDocs/Photos/2_3#Create
for reference. Pwinty groups all order items as photos even though they have other products.
Maybe use something more generic. 

Tracking an orders as billable components is probably enough. 
https://developer.paypal.com/docs/api/invoicing/ is a good reference for invoicing.

###Idempotent Request
Not creating duplicate orders is something very important. https://lob.com/docs#idempotent-requests 
has a implementation of idempotent requests.


## Unstable tests
## https://travis-ci.org/russjohnson09/coderuss/jobs/267275160
/v1/postcards POST timeout 2000. relies on lob service so this is probably the source
of the timeout. Fix is either stub this and loose integration, increase timeout which 
could lead to other problems or just monitor.


