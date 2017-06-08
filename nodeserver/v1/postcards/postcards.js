var express = require('express');
const moment = require('moment-timezone');
const r = require('request');

const userRouter = require('./../users/main');


// const FAX_URL = process.env.FAX_URL || 'https://api.phaxio.com/v2/faxes'; //429 response will cause test error
const FAX_URL = process.env.FAX_URL || 'http://localhost:3000/v1/ping';

const LOB_LIVE_API_KEY = process.env.LOB_LIVE_API_KEY || 'INVALID';
const LOB_TEST_API_KEY = process.env.LOB_TEST_API_KEY;
const LOB_API_V1_ENDPONT = process.env.LOB_API_V1_ENDPONT;

const POSTCARD_COST = 1;

module.exports = function(opts) {
    var module = {};
    var router = express.Router();
    var app = opts.app;
    var winston = opts.winston;
    
    console.log(opts);

    var db = opts.database;
    
    var ObjectID = require('mongodb').ObjectID;

    const User = db.collection('user');

    router.use(function(req, res, next) {
        winston.debug('authentication status');
        winston.debug(req.isAuthenticated());
        winston.debug(req.user);
        if (!req.isAuthenticated()) {
            return res.status(403).json({
                status: 403
            });
        }
        next();
    });

    router.post('/', function(req, res) {
        User.updateOne({
            _id: req.user._id,
            dollars_available: {
                $gt: 0
            }
        }, {
            $inc: {
                dollars_available: -POSTCARD_COST,
            }
        }, function(err, result) {
            if (err) {
                winston.error(err);
            }
            if (result.result.nModified == 0) {
                return res.status(429).json(result.result);
            }
            var url = LOB_API_V1_ENDPONT + '/postcards';
            var requestBody = req.body;
            winston.info(url);
            r({
                'url': url,
                'method': 'POST',
                'form': requestBody,
                'auth': {
                    'user': LOB_TEST_API_KEY,
                    'pass': ''
                }
            }, function(error, response, body) {
                if (error) winston.error(error);
                res.set(response.headers);
                return res.status(response.statusCode).send(body).end();
            });
        });
    });

    router.post('/send/test', function(req, res) {
        var url = LOB_API_V1_ENDPONT + '/postcards';
        var requestBody = {
            description: 'Demo Postcard job',
            to: {
                name: 'Joe Smith',
                address_line1: '123 Main Street',
                address_city: 'Mountain View',
                address_state: 'CA',
                address_zip: '94041'
            },
            from: {
                name: 'Joe Smith',
                address_line1: '123 Main Street',
                address_city: 'Mountain View',
                address_state: 'CA',
                address_zip: '94041'
            },
            front: '<html style="padding: 1in; font-size: 50;">Front HTML for {{name}}</html>',
            back: '<html style="padding: 1in; font-size: 20;">Back HTML for {{name}}</html>',
            data: {
                name: 'Harry'
            }
        };
        console.log(requestBody);
        r({
            'url': url,
            'method': 'POST',
            'form': requestBody,
            'auth': {
                'user': LOB_TEST_API_KEY,
                'pass': ''
            }
        }, function(error, response, body) {
            if (error) winston.error(error);
            res.set(response.headers);
            return res.status(response.statusCode).send(body).end();
        })
    });

    module.router = router;

    return module;
};
