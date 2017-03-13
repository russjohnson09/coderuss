//https://github.com/oauthjs/express-oauth-server/tree/master/examples/memory

require('dotenv').config();
const express = require('express');
const app = express();
const connect_mongo = require("connect-mongo");
const passport = require('passport');
const crypto = require('crypto');
const request = require('request');
const qs = require('qs');
const expressSession = require('express-session');
const mongodb = require('mongodb');
const exphbs = require('express-handlebars');

var memorystore = require('model.js');

var oauthServer = require('express-oauth-server');
var app = express();

// app.oauth = oauthserver({
//   model: memorystore
// });

var oauth = new oauthServer({ model: memorystore });

app.use(oauth.authenticate());

app.get('/', function (req, res) {
  res.send('Hello World');
})

app.listen(3000);





memorystore.dump();