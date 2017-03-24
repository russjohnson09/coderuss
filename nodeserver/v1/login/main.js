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

    const nodemailer = require('nodemailer');
    const uuid = require('node-uuid');


    var database = opts.database;
    var passport = opts.passport;

    const User = database.collection('user');

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

    function doPasswordReset(username) {
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
            var password_reset = {
                token: token,
                created: Date.now()
            }
            User.updateOne({
                _id: user._id
            }, {
                $set: {
                    'password_reset': password_reset
                }
            }, function(error, result) {});


            var fs = require('fs');
            if (fs.existsSync(__dirname + '/../params.js')) {
                process.env = require(__dirname + '/../params.js').env;
            }




            if (process.env.SMTP_TRANSPORT) {
                var transporter = nodemailer.createTransport(process.env.SMTP_TRANSPORT);
            }

            var mailOptions = {
                from: '"Coderuss" <russ@coderuss.com>', // sender address
                to: user.username, // list of receivers
                subject: 'Password reset', // Subject line
                text: 'Password reset' + JSON.stringify(password_reset), // plaintext body
                html: 'Password reset' + JSON.stringify(password_reset),
                headers: {
                    "message-id": uuid.v1()
                }
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: ' + info.response);
            });
            

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
                    res.setHeader('Content-Type', 'application/json; charset=utf-8');
                    res.status(201);
                    return res.send(JSON.stringify({
                        "message": 'Success',
                        status: "success"
                    }));
                });
                return;
            }
            else {
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(401);
                return res.end(JSON.stringify({
                    "message": 'Unauthorized',
                    status: "unauthorized"
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
    router.post('/oauth/authorize',
        function(req, res) {
            res.json({
                'message': 'hello from oauth'
            });
            winston.debug(req.isAuthenticated());
            if (!req.isAuthenticated()) {
                return res.redirect('/public/login');
            }
            winston.debug(req.user);
            res.send(JSON.stringify(req.user));
            res.end();
        });

    //request access token
    //open to other domains
    router.post('/oauth/access_token',
        function(req, res) {
            res.json({
                'message': 'hello from oauth'
            });
            winston.debug(req.isAuthenticated());
            if (!req.isAuthenticated()) {
                return res.redirect('/public/login');
            }
            winston.debug(req.user);
            res.send(JSON.stringify(req.user));
            res.end();
        });

    module.router = router;

    return module;
};
