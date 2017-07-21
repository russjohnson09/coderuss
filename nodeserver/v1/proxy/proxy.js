var express = require('express');
const moment = require('moment-timezone');
const r = require('request');

const userRouter = require('./../users/main');
const GITHUB_API_URL = 'https://api.github.com';

const POSTCARD_COST = 1;

const GITHUB_CODERUSS_TOKEN = process.env.GITHUB_CODERUSS_TOKEN || '';

const TVMAZE_API_URL = 'http://api.tvmaze.com';

module.exports = function(opts) {
    var module = {};
    var router = express.Router();
    var app = opts.app;
    var winston = opts.winston;

    var last_request = null;

    console.log(opts);

    var db = opts.database;

    var ObjectID = require('mongodb').ObjectID;

    // const User = db.collection('user');

    router.use(function(req, res, next) {

        if (req.isAuthenticated()) {
            if (req.user.username === process.env.MAIN_ADMIN_USERNAME) {
                req.headers['authorization'] = req.headers['authorization'] || 'Token '+ GITHUB_CODERUSS_TOKEN
            }
        }
        return next();
    });

    // router.get('/github/repos/russjohnson09/coderuss/commits/4c20768f288af579519e887674ddcea5300a7d1d', function(req, res) {
    //     res.json({status:1}).end();
    // });

    var getProxy = function(req,res)
    {
        delete req.headers['referer'];
        delete req.headers['host'];
        req.headers['accept-encoding'] = 'deflate';

        var proxy = req.params.proxy;
        var url;
        if ('github' === proxy) {
           url = GITHUB_API_URL;
        }
        else if ('tvmaze' === proxy) {
           url = TVMAZE_API_URL;
        }
        url += req.params.path;
        console.log('GET',req.headers,url,req.query);
        r({
            method: 'GET',
            headers: req.headers,
            url: url,
            qs: req.query
        }, function (err, proxyResponse, proxyBody) {

            if (err) {
                return res.status(500).send(err).end();
            }
            // console.log('GET',proxyBody,proxyResponse.statusCode,proxyResponse.headers);

            // 'transfer-encoding': 'chunked' error
            // res.set(proxyResponse.headers);
            return res
                .status(proxyResponse.statusCode)
                .send(proxyBody).end();
        });
    };

    router.get('/:proxy(github|tvmaze):path(*)', getProxy);


    router.post('/github:path(*)', function(req, res) {
        delete req.headers['referer'];
        delete req.headers['host'];
        req.headers['accept-encoding'] = 'deflate';
        // console.log('/github:path(*)',req.headers);
        r({
            method: 'POST',
            headers: req.headers,
            json: req.body,
            url: GITHUB_API_URL + req.params.path,
        }, function (err, proxyResponse, proxyBody) {
            if (err) {
                return res.status(500).send(err).end();
            }
            res.set(proxyResponse.headers);
            return res.status(proxyResponse.statusCode).send(proxyBody).end();
        });
    });

    module.router = router;

    return module;
};
