module.exports = function(opts) {
    var self = {};
    
    var http = require('http');
    var url = require('url');
    var express = require('express');
    var winston = opts.winston || require('winston');
    var fs = require('fs');
    var inspect = require('util').inspect;
    var current_files = {};
    var doDelete = true;
    var ObjectID = require('mongodb').ObjectID;
    var uuid = require('node-uuid');

    const db = opts.database;

    const LOGIN_PATH = '/public/login';

    var router = express.Router();

    var bcrypt = require('bcrypt');


    const User = db.collection('user');
    const OauthToken = db.collection('oauth_token');


    //authorization=token 2a3e269cb969fd914fc183328d879b06e1d00aed1126928123bd0e93936961acbf88f021ddbfc9ab686b9853d42893b944a684b2c202d121551abb5bb06c3008
    router.use(function(req, res, next) {
        winston.debug(req.body);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');

        winston.info(req.headers);

        if (req.isAuthenticated()) {
            return next();
        }

        if (req.headers && req.headers.authorization) {
            var access_token = req.headers.authorization.substr(6)
            OauthToken.findOne({
                access_token: access_token,
            }, function(err, oauthToken) {

                if (oauthToken && oauthToken.user_id) {
                    User.findOne({
                        _id: oauthToken.user_id
                    }, function(err, user) {
                        if (user) {
                            req.user = user;
                            return next();
                        }
                        else {
                            res.status(401);
                            return res.end(JSON.stringify({
                                "message": 'Unauthorized',
                                status: "unauthorized"
                            }));
                        }
                    })
                }
                else {
                    res.status(401);
                    return res.end(JSON.stringify({
                        "message": 'Unauthorized',
                        status: "unauthorized"
                    }));
                }

            });
        }
        else {
            res.status(401);
            return res.end(JSON.stringify({
                "message": 'Unauthorized',
                status: "unauthorized"
            }));
        }

    });

    router.get('/me', function(req, res) {

        User.findOne({
            _id: req.user._id
        }, function(err, user) {
            winston.debug(user);
            if (err) {
                winston.error(err);
                res.status(401);
                return res.end(JSON.stringify({
                    "message": 'Unauthorized',
                    status: "unauthorized"
                }));
            }
            return res.status(200).send(JSON.stringify({
                _id: user._id,
                username: user.username,
                email: user.email || null,
                name: user.name || null,
                logsene_token: user.logsene_token || null,
                dollars_available: user.dollars_available || null,
            })).end();
        });
    });


    router.post('/me', function(req, res) {
        winston.debug(req.headers, {
            endpoint: '/v2/users/me',
            tag: 'headers'
        })
        winston.debug(req.body, {
            endpoint: '/v2/users/me'
        });
        var set = {};
        if (req.body.email !== undefined) {
            set.email = req.body.email;
        }
        if (req.body.name !== undefined) {
            set.name = req.body.name;
        }
        if (req.body.logsene_token !== undefined) {
            set.logsene_token = req.body.logsene_token;
        }
        if (!set.name && !set.email) {
            res.status(400);
            return res.end(JSON.stringify({
                "message": 'Name or email are required fields',
                status: "Bad Request"
            }));
            return;
        }
        User.updateOne({
            _id: ObjectID(req.user._id)
        }, {
            $set: set
        }, function(error, result) {
            if (error) {
                winston.error(error);
            }
            winston.debug(result.result);
            User.findOne({
                _id: req.user._id
            }, function(err, user) {
                winston.debug(user);
                if (err) {
                    winston.error(err);
                    res.status(401);
                    return res.end(JSON.stringify({
                        "message": 'Unauthorized',
                        status: "unauthorized"
                    }));
                }
                return res.status(201).send(JSON.stringify({
                    _id: user._id,
                    username: user.username,
                    email: user.email || null,
                    name: user.name || null
                })).end();
            });
        });

    });


    function isAdmin(username) {
        return username === process.env.MAIN_ADMIN_USERNAME;    
    }
    
    
    function isAdminRouter(req,res,next) {
        // return function(req,res,next) {
            if (!isAdmin(req.user.username)) {
                return res.status(401).json({}).end();
            }
            return next();
        // }
    }
    
    router.use('/:id',isAdminRouter);
    router.use('/:id/inc',isAdminRouter);
    router.use('/:id/dec',isAdminRouter);
    
    
    router.get('/:id', function(req, res) {
        // if (!isAdmin(req.user.username)) {
        //     return res.status(401).json({}).end();
        // }
        User.findOne({
            _id: ObjectID(req.params.id)
        }, function(err, user) {
            winston.debug(user);
            if (err) {
                winston.error(err);
                res.status(401);
                return res.end(JSON.stringify({
                    "message": 'Unauthorized',
                    status: "unauthorized"
                }));
            }
            return res.status(200).send(JSON.stringify({
                _id: user._id,
                username: user.username,
                email: user.email || null,
                name: user.name || null,
                logsene_token: user.logsene_token || null,
                dollars_available: user.dollars_available || null,
            })).end();
        });
    });

    router.post('/:id/inc', function(req, res) {
        if (!req.body.inc || req.body.inc < 0) {
            return res.status(400).json({});
        }
        User.updateOne({
            _id: ObjectID(req.params.id),
            // dollars_available: { $gt: 0 }
        }, {
            $inc: {
                dollars_available: req.body.inc,
            }
        }, function(err, result) {
            if (err) {
                winston.error(err);
                return res.status(500);
            }
            return res.status(201).json(result.result);
        })
    });
    
    router.post('/:id/dec', function(req, res) {
        if (!req.body.dec || req.body.dec < 0) {
            return res.status(400).json({});
        }
        User.updateOne({
            _id: ObjectID(req.params.id),
            dollars_available: { $gt: 0 }
        }, {
            $inc: {
                dollars_available: - req.body.dec,
            }
        }, function(err, result) {
            if (err) {
                winston.error(err);
            }
            if (result.result.nModified == 0) {
                return res.status(429).json(result.result);
            }
            return res.status(201).json(result.result);
        })
    });
    
    self.router = router;
    
    

    return self;

};
