var fs = require('fs');
var mongodb = require('mongodb');
var uuid = require('node-uuid');
const crypto = require('crypto');
var http = require('http');
var url = require('url');
var express = require('express');
var bcrypt = require('bcrypt');

const mongoose = require("mongoose"); //http://mongoosejs.com/docs/index.html
const request = require('request');

const ObjectID = mongodb.ObjectID;


module.exports = function (opts) {

    var winston = opts.winston;



    const CODERUSS_USER_AGENT = 'CODERUSS';

    var self = {};

    var router = express.Router();

    self.router = router;

    const User = opts.db.collection('user');


    //mongodb connection
    var db;


    const MongoClient = mongodb.MongoClient


    const MONGO_URI = process.env.MONGO_URI;
    const GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize';
    const GITHUB_ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token';
    const GITHUB_API_URL = 'https://api.github.com';


    //db connection setup
    (function () {
        mongoose.connect(MONGO_URI);
        db = mongoose.connection;
        db.on("error", console.error.bind(console, "connection error"));
        db.once("open", function (callback) {
            winston.debug("Connection succeeded.");
        });
    })()

    var main_application;
    MongoClient.connect(MONGO_URI, function (err, db) {
        database = mongo_db = db;
    });

    function getGithubUser(access_token_github, callback) {
        request.get({
            headers: {
                'content-type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': CODERUSS_USER_AGENT,
                'Authorization': 'token ' + access_token_github,
            },
            url: GITHUB_API_URL + '/user',
        }, function (err, res, body) {
            winston.debug(res.statusCode);
            winston.debug(body);

            if (err) {
                winston.error(err);
                return callback(err, null);
            }
            var data = JSON.parse(body);
            if (!data.id) {
                winston.error('could not get user');
                return callback('could not get user');
            }
            return callback(null, data);
        });
    }


    //setup routes
    (function () {

        router.get('/github/user', function (req, ExpressRes) {
            var sess = req.session;
            var user = req.user;
            if (!user.access_token_github) {
                return res.redirect('/github/link');
            }
            request.get({
                headers: {
                    'content-type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': CODERUSS_USER_AGENT,
                    'Authorization': 'token ' + user.access_token_github,
                },
                url: GITHUB_API_URL + '/user',
            }, function (err, res, body) {
                winston.debug(res.statusCode);
                winston.debug(body);

                ExpressRes.status(res.statusCode);
                return ExpressRes.send(body);
            });
        });

            router.get('/github/link', function (req, res) {
                var sess = req.session;

                if (req.query.code && req.query.state
                    && sess.github_oauth_state === req.query.state) {
                    winston.info('has code');
                    var code = req.query.code;

                    addUpdateGithubUser(req.user, code, req.query.state, function (err, user) {
                        if (err) {
                            winston.error(err);

                        }
                        res.redirect('/profile');
                        return res.end();

                    })

                }
                else if (req.query.code) {
                    res.redirect(400, '/');
                    return res.json({ message: "bad request" });
                }
                else {
                    sess.github_oauth_state = getToken();
                    var github_auth_redirect = getGithubAuthRedirect();
                    github_auth_redirect += '&state=' + sess.github_oauth_state;
                    return res.redirect(github_auth_redirect);
                }
            });
        })()


        function getToken() {
            return crypto.randomBytes(64).toString('hex');
        }

        function getGithubAuthRedirect() {
            var token = getToken();
            var url = GITHUB_OAUTH_URL + '?scope=user,repo&client_id='
                + process.env.GITHUB_ID;
            return url;
        }



        function addUpdateGithubUser(user, code, state, callback) {
            request.post({
                headers: {
                    'content-type': 'application/json',
                    'Accept': 'application/json'
                },
                url: GITHUB_ACCESS_TOKEN_URL,
                body: JSON.stringify({
                    client_id: process.env.GITHUB_ID,
                    client_secret: process.env.GITHUB_SECRET,
                    code: code,
                    state: state
                })
            }, function (error, res, body) {
                winston.debug(res.headers);
                winston.debug(res.statusCode);
                if (res.statusCode !== 200) {
                    winston.error('unexected statusCode ' + res.statusCode);
                }
                else {
                    winston.debug(body);
                    var data = JSON.parse(body);
                    var access_token_github = data.access_token;
                    if (!access_token_github) {
                        winston.error('failed to get access_token');
                    }
                    else {
                        request.get({
                            headers: {
                                'content-type': 'application/json',
                                'Accept': 'application/json',
                                'User-Agent': CODERUSS_USER_AGENT,
                                'Authorization': 'token ' + access_token_github,
                            },
                            url: GITHUB_API_URL + '/user',
                        }, function (err, res, body) {
                            winston.debug(res.statusCode);
                            winston.debug(body);

                            if (err) {
                                winston.error(err);
                                return callback();
                            }
                            var data = JSON.parse(body);
                            if (!data.id) {
                                winston.error('could not link github account');
                                return callback();
                            }
                            winston.info(user._id);
                            User.findOne({ _id: user._id }, function (err, result) {
                                if (err) {
                                    winston.error(err);
                                }
                                if (!result) {
                                    winston.error('could not find user', user)
                                    return callback();
                                }
                                else {
                                    winston.info(result);

                                    User.updateOne({ _id: user._id },
                                        {
                                            $set:
                                            {
                                                access_token_github: access_token_github
                                            }
                                        }, function (error, result) {
                                            if (error) {
                                                winston.error(error);
                                                return callback();
                                            }
                                            winston.info(result.result);
                                            winston.info(result.upsertedId);
                                            return callback();
                                        });
                                }
                            });

                        })

                    }
                }
            })

        }

        return self;
    };
