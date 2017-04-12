[![Coverage Status](https://coveralls.io/repos/github/russjohnson09/coderuss/badge.svg?branch=master)](https://coveralls.io/github/russjohnson09/coderuss?branch=master)
[![Build Status](https://secure.travis-ci.org/russjohnson09/coderuss.png?branch=master)](https://travis-ci.org/russjohnson09/coderuss)
[![dependencies Status](https://david-dm.org/russjohnson09/coderuss/status.svg)](https://david-dm.org/russjohnson09/coderuss)
[![Code Climate](https://codeclimate.com/github/russjohnson09/coderuss/badges/gpa.svg)](https://codeclimate.com/github/russjohnson09/coderuss)
[![Issue Count](https://codeclimate.com/github/russjohnson09/coderuss/badges/issue_count.svg)](https://codeclimate.com/github/russjohnson09/coderuss)
[Uptime last 7 days.](https://coderuss.herokuapp.com ) [![Statuscake Uptime Monitoring](https://app.statuscake.com/button/index.php?Track=BVzY2dDKip&Days=7&Design=6)](https://codeclimate.com/github/russjohnson09/coderuss)

Coderuss
===============================
This repo is focused on implementing a web service and frontend
for using this service. Initially I mad no assumptions on what
the best way to do this but have ended up using node for
the api. The frontend is still undecided. Test cases are primarily
endpoint tests although there will definitely be a need for
unit tests when a service is not practical or not efficient.


Changlog
=============
* Added logsene token to user profile and /v1/logsene/errors GET (fixes #67)
* Added oauth token linking to github accounts. 2017-03 #69
* fix to broken cdn https://cdn.socket.io/socket.io-1.4.5.js
* added ability to reset password /v1/passwordresetrequest and /v1/passwordreset/:token see login_spec.js
* added oauth spec
* moved cdn to repo
* /v1/todos/public/ display datetime on notification for debugging fixes #2
* added external_resources fixes #47
