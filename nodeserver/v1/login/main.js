module.exports = function(opts) {
    var http = require('http');
    var url = require('url');
    var express = require('express');
    var winston = opts.winston || require('winston');
    var fs = require('fs');
    var ObjectID = require('mongodb').ObjectID;

    var router = express.Router();
    var bcrypt = require('bcrypt');

    const crypto = require('crypto');
    const async = require('async');
    const ejs = require('ejs');


    const nodemailer = require('nodemailer');
    const pickupTransport = require('nodemailer-pickup-transport');

    const uuid = require('node-uuid');

    const transporter = getTransporter();

    function getTransporter() {
        if (process.env.SMTP_TRANSPORT) {
            return nodemailer.createTransport(process.env.SMTP_TRANSPORT);
        }
        else {
            return nodemailer.createTransport(
                pickupTransport({
                    directory: __dirname + '/../../email'
                }));
        }
    }


    var database = opts.database;
    var passport = opts.passport;

    const User = database.collection('user');
    const OauthClient = database.collection('oauth_client');

    const OauthToken = database.collection('oauth_token');


    const CODERUSS_FROM_ADDRESS = process.env.CODERUSS_FROM_ADDRESS || '"foo" <foo@example.com>';
    const CODERUSS_BASE_URL = process.env.CODERUSS_BASE_URL;


    winston.info('from address: ' + CODERUSS_FROM_ADDRESS);

    const LocalStrategy = require('passport-local').Strategy;

    var comparePassword = function(password, hash, callback) {
        // Load hash from your password DB. 
        bcrypt.compare(password, hash, function(err, res) {
            callback(err, res)
        });
    }

    var hashPassword = function(password, callback) {
        bcrypt.genSalt(function(err, salt) {
            bcrypt.hash(password, salt, function(err, hash) {
                callback(err, hash);
            });
        });
    }

    passport.use(new LocalStrategy(
        function(username, password, done) {
            winston.debug('start authentication');
            winston.debug('start authentication');
            winston.debug(username);
            winston.debug(password);
            User.findOne({
                username: username
            }, function(err, user) {
                if (err) {
                    winston.error(err);
                    return done(err);
                }
                if (!user) {
                    hashPassword(password, function(err, hash) {
                        if (err) {
                            winston.error(err);
                        }
                        User.insertOne({
                                username: username,
                                password: hash
                            },
                            function(error, result) {
                                winston.debug(result);
                                return done(null, {
                                    _id: result.insertedId
                                });
                            });
                    });
                    return;
                }
                comparePassword(password, user.password, function(err, res) {
                    if (!res) {
                        winston.debug('password does not match')
                        return done(null, false);
                    }
                    else {
                        winston.debug('user found password match');
                        return done(null, user);
                    }

                });

            });
        }
    ));


    passport.serializeUser(function(user, done) {
        winston.debug('serializeUser');
        winston.debug(user);
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        winston.debug('deserializeUser');
        winston.debug(id);
        User.findOne({
            _id: ObjectID(id)
        }, function(err, user) {
            winston.debug(user);
            if (err) {
                winston.error(err);
            }
            done(err, user);
        });
    });


    function getToken() {
        return crypto.randomBytes(64).toString('hex');
    }

    function getResetUrl(token) {
        return CODERUSS_BASE_URL + '/passwordreset?token=' + token;
    }

    function doPasswordReset(username) {
        winston.info('password reset for user: ' + username);
        var token = getToken();

        // winston.warn('password_reset');

        User.findOne({
            username: username
        }, function(err, user) {
            if (err) {
                winston.error(err);
                return;
            }
            if (!user) {
                return;
            }
            User.updateOne({
                _id: user._id
            }, {
                $set: {
                    password_reset_token: token,
                    password_reset_created: Date.now()
                }
            }, function(error, result) {
                if (error) {
                    winston.error(error);
                }
            });

            var text, html;

            var data = {
                user: user,
                token: token,
                reset_url: getResetUrl(token)
            };

            async.parallel([
                function(callback) {
                    winston.info('html generate');
                    // return callback();
                    // var filename = path.join('.');
                    ejs.renderFile(__dirname + '/password_reset.ejs', data, {}, function(err, str) {
                        html = str;
                        winston.info(html);
                        callback();
                    });
                },
                function(callback) {
                    winston.info('text generate');
                    ejs.renderFile(__dirname + '/password_reset.ejs', data, {}, function(err, str) {
                        text = str;
                        winston.info(text);
                        callback();
                    });
                }

            ], function(err, results) {
                winston.info('send email')
                    // winston.info(results);
                var mailOptions = {
                    from: CODERUSS_FROM_ADDRESS,
                    to: user.username, // list of receivers
                    subject: 'Password reset', // Subject line
                    text: text, // plaintext body
                    html: html,
                    headers: {
                        "message-id": uuid.v1()
                    }
                };

                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        return winston.error(error);
                    }
                    winston.info(info);
                });
            });

        });

    }



    router.get('/oauth/authorize', function(req, res) {
        if (!req.isAuthenticated()) {
            res.status(401);
            return res.json({
                "message": 'Unauthorized',
                "status": "unauthorized"
            });
        }

        if (!req.query) {
            res.status(400);
            return res.json({
                "message": 'Bad Request',
                status: "bad request"
            });
        }
        //|| !req.query.redirect_uri
        if (!req.query.client_id) { // || !req.query.state) {
            res.status(400);
            return res.json({
                "message": 'Bad Request',
                status: "bad request"
            });
        }

        winston.info(req.query.client_id);

        res.sendFile('authorize.html', {
            root: __dirname
        });

    })


    router.post('/oauthclients', function(req, res) {
        if (!req.isAuthenticated()) {
            res.status(401);
            return res.json({
                "message": 'Unauthorized',
                "status": "unauthorized"
            });
        }

        var userId = req.user._id;

        OauthClient.insertOne({
                client_secret: getToken(),
                user_id: userId
            },
            function(error, result) {
                OauthClient.findOne({
                    _id: result.insertedId
                }, function(err, oauthClient) {
                    if (err) {
                        winston.error(err);
                        return response500(res);
                    }
                    winston.info(oauthClient);
                    res.status(201);
                    res.json(
                        oauthClient
                        //     {
                        //     _id: oauthClient._id,
                        //     client_secret: oauthClient.client_secret,
                        //     user_id: oauthClient.user_id
                        // }
                    ).end();
                });


            })
    });



    router.get('/oauthclients', function(req, res) {
        if (!req.isAuthenticated()) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.status(401);
            return res.json({
                "message": 'Unauthorized',
                "status": "unauthorized"
            });
        }
        var userId = req.user._id;
        OauthClient.find({
            user_id: userId
        }).toArray((function(err, results) {
            if (err) {
                winston.error(err);
            }
            res.setHeader('content-type', 'application/json; charset=utf-8');

            res.json(results);
        }));
    });


    function response500(res) {
        res.status(500);
        return res.json({
            "message": 'error',
            "status": "error"
        });
    }


    router.post('/reqestpasswordreset', function(req, res) {

        doPasswordReset(req.body.username);

        res.status(201);
        res.json({
            status: 'success',
            message: "Reset link sent to user\'s email"
        }).end();
    })


    router.post('/passwordreset/:token', function(req, res) {

        winston.info(req.params);

        User.findOne({
            password_reset_token: req.params.token
        }, function(err, u) {
            if (!u) {
                res.status(404);
                return res.json({
                    'status': 'not found',
                    'message': 'Token not found'
                }).end();
            }
            hashPassword(req.body.password, function(err, hash) {
                User.updateOne({
                    _id: u._id
                }, {
                    $set: {
                        password_reset_token: null,
                        password: hash
                    }
                }, function(error, result) {
                    res.status(201);
                    res.json({
                        status: 'success',
                        message: "Password reset",
                        result: {
                            result: result.result,
                            upsertedId: result.upsertedId,
                            matchedCount: result.matchedCount,
                            upsertedCount: result.upsertedCount
                        }
                    }).end();
                })

            });
        });

    })

    //http://passportjs.org/docs/authenticate
    router.post('/login', function(req, res, next) {
        return passport.authenticate('local', function(err, user, info) {
            if (err) {
                return next(err);
            }

            winston.debug(user);

            if (user !== false) {
                req.logIn(user, function(err) {
                    if (err) {
                        return next(err);
                    }
                    res.status(201);
                    return res.json({
                        "message": "Success",
                        "status": "success"
                    }).end();
                });
                return;
            }
            else {
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(401);
                return res.end(JSON.stringify({
                    "message": 'Unauthorized',
                    "status": "unauthorized"
                }));
            }
            if (!user) {
                return res.redirect('/login');
            }
            req.logIn(user, function(err) {
                if (err) {
                    return next(err);
                }
                return res.redirect('/users/' + user.username);
            });
        })(req, res, next);
    });

    router.get('/logout',
        function(req, res) {
            req.logout();
            res.redirect('/');
        });

    router.get('/profile',
        function(req, res) {
            winston.debug(req.isAuthenticated());
            if (!req.isAuthenticated()) {
                return res.redirect('/public/login');

            }
            winston.debug(req.user);
            res.send(JSON.stringify(req.user));
            res.end();
        });


    //authorize the application
    // router.post('/oauth/authorize',
    //     function(req, res) {
    //         res.json({
    //             'message': 'hello from oauth'
    //         });
    //         winston.debug(req.isAuthenticated());
    //         if (!req.isAuthenticated()) {
    //             return res.redirect('/public/login');
    //         }
    //         winston.debug(req.user);
    //         res.send(JSON.stringify(req.user));
    //         res.end();
    //     });

    //request access token
    //open to other domains
    router.post('/oauth/access_token',
        function(req, res) {
            winston.info('oauth');

            winston.info(req.body);

            var client_id = req.body.client_id
            var client_secret = req.body.client_secret;
            var code = req.body.code;
            
            winston.info(req.headers);


            if (!client_id || !client_secret || !code) {
                res.status(400);
                return res.json({
                    "message": 'client_id, client_secret, and code are required',
                    status: "badrequest"
                });
            }


            OauthClient.findOne({
                _id: ObjectID(client_id)
            }, function(err, oauthClient) {
                if (err) {
                    winston.error(err);
                    return response500(res);
                }

                if (!oauthClient || (oauthClient.client_secret != client_secret)) {
                    res.status(401);
                    return res.json({
                        "message": 'Unauthorized',
                        status: "unauthorized"
                    });
                    return;
                }

                OauthToken.findOne({
                    code: code,
                    client_id: oauthClient._id
                }, function(err, oauthToken) {
                    if (err) {
                        winston.error(err);
                        return response500(res);
                    }

                    if (!oauthToken) {
                        winston.info('oauthtoken not found')
                        res.status(401);
                        return res.json({
                            "message": 'Unauthorized',
                            status: "unauthorized"
                        });
                        return;
                    }

                    var access_token = getToken();

                    OauthToken.updateOne({
                        _id: oauthToken._id
                    }, {
                        $set: {
                            access_token: access_token
                        }
                    }, function(err, result) {

                        if (err) {
                            winston.error(err);
                            return response500(res);
                        }

                        winston.info(result.result);
                        
                        res.status(201);
                        return res.json({
                            'access_token': access_token,
                            'scope': OauthToken.scope,
                            'token_type': OauthToken.token_type
                        })
                    })
                });

            });
        });


    router.post('/oauth/authorize', function(req, res) {
        winston.info('oauth');

        if (!req.isAuthenticated()) {
            res.status(401);
            return res.json({
                "message": 'Unauthorized',
                status: "unauthorized"
            });
        }

        if (!req.body) {
            res.status(400);
            return res.json({
                "message": 'Bad Request',
                status: "bad request"
            });
        }
        //|| !req.query.redirect_uri
        if (!req.body.client_id) { // || !req.query.state) {
            res.status(400);
            return res.json({
                "message": 'Bad Request',
                status: "bad request"
            });
        }
        var client_id = req.body.client_id;

        winston.info(client_id);

        OauthClient.findOne({
            _id: ObjectID(client_id)
        }, function(err, oauthClient) {
            if (err) {
                winston.error(err);
                return response500(res);
            }

            // winston.info(oauthClient);

            if (!oauthClient) {
                res.status(401);
                return res.json({
                    "message": 'Unauthorized',
                    status: "unauthorized"
                });
            }

            var code = getToken();

            OauthToken.insertOne({
                code: code,
                // access_token: 'admin_token',
                user_id: ObjectID(req.user._id),
                client_id: ObjectID(client_id),
                scope: 'default',
                token_type: 'bearer',
                created: Date.now()
            }, function(err, result) {
                if (err) {
                    winston.error(err);
                    return response500(res);
                }
                else {
                    winston.info(result.result, {
                        'type': 'oauth token updated'
                    })
                    res.status(201);
                    return res.json({
                        code: code,
                        meta: {
                            "message": 'Success',
                            "status": "success"
                        }
                    });
                }
            });
        });


    });


    module.router = router;

    return module;
};
