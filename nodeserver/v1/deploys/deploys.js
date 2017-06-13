const http = require('http');
const url = require('url');
const fs = require('fs');
const ObjectID = require('mongodb').ObjectID;
const uuid = require('node-uuid');
    
module.exports = function (opts) {

    var express = require('express');
    var winston = opts.winston || require('winston');
    var inspect = require('util').inspect;

    var router = express.Router();



    var module = {};

    const db = opts.db;

    const Init = opts.db.collection('init');


    module.router = router;


    router.get('/', function(req,res) {
        return res.json([]).end();
    })


    return module;
};
    
    
