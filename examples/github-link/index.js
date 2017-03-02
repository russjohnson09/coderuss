// https://github.com/login/oauth/authorize

require('dotenv').config();
const express = require('express');
const passport = require('passport');



const app = express();

var server = require('http').Server(app);

server = server.listen(3000,function() {
    console.log(server.address().port);
})


    app.get('/', function (req, res) {

        res.status(200).send('hello world').end();
    });