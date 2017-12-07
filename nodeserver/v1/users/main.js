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



    let isLoggedInRouter = self.isLoggedInRouter = function (req,res,next) {
        if (req.user === undefined || req.user._id === undefined) {
            return res.status(401).json({message:'Not authorized.',
                meta: {
                    file: 'users/main.js',
                    params: req.params,
                }}).end();
        }
        return next();
    };

    router.get('/me',isLoggedInRouter, function(req, res) {

        User.findOne({
            _id: req.user._id
        }, function(err, user) {
            winston.debug(user);
            if (err) {
                winston.error(err);
                res.status(401);
                return res.json({
                    "message": 'Unauthorized',
                    status: "unauthorized"
                });
            }
            return res.status(200).json({
                _id: user._id,
                username: user.username,
                email: user.email || null,
                name: user.name || null,
                logsene_token: user.logsene_token || null,
                dollars_available: user.dollars_available || null,
                amount: user.amount || 0,
                is_admin: isAdmin(user.username) ? 1 : 0
            }).end();
        });
    });


    router.post('/me', function(req, res) {
        winston.debug(req.headers, {
            endpoint: '/v2/users/me',
            tag: 'headers'
        });
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
            return res.json({
                "message": 'Name or email are required fields',
                status: "Bad Request"
            });
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
                    return res.json({
                            "message": 'Unauthorized',
                            status: "unauthorized"
                        }
                    );
                }
                return res.status(201).json({
                    _id: user._id,
                    username: user.username,
                    email: user.email || null,
                    name: user.name || null
                }).end();
            });
        });

    });


    let isAdmin = self.isAdmin = function (username) {
        return username === process.env.MAIN_ADMIN_USERNAME;    
    };

    let isAdminRouter = self.isAdminRouter = function (req,res,next) {
        if (!isAdmin(req.user.username)) {
            return res.status(401).json({message:'Not authorized.',
            meta: {
                file: 'users/main.js',
                params: req.params,
            }}).end();
        }
        return next();
    };


    (function() {
        router.use('/',isAdminRouter);
        router.use('/me:path(*)',isLoggedInRouter);
        router.use('/:id',isAdminRouter);
        router.use('/:id/inc',isAdminRouter);
        router.use('/:id/dec',isAdminRouter);

        router.get('/', function(req, res) {

            User.find({},
                {dollars_available: 1, username: 1,fitbit_user: 1}).sort({
                "username": 1
            }).toArray(function (err, results) {
                res.json(results).end();
            });
        });


        router.get('/:id', function(req, res) {
            User.findOne({
                _id: ObjectID(req.params.id)
            }, function(err, user) {
                winston.debug(user);
                if (err) {
                    winston.error(err);
                    res.status(401);
                    return res.json({
                        "message": 'Unauthorized',
                        status: "unauthorized"
                    });
                }
                return res.status(200).json({
                    _id: user._id,
                    username: user.username,
                    email: user.email || null,
                    name: user.name || null,
                    logsene_token: user.logsene_token || null,
                    dollars_available: user.dollars_available || null,
                }).end();
            });
        });

        router.post('/:id/inc', function(req, res) {
            if (!req.body.inc || req.body.inc < 0) {
                return res.status(400).json({});
            }
            User.updateOne({
                _id: ObjectID(req.params.id),
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
    })();

    
    self.router = router;
    
    

    return self;

};
