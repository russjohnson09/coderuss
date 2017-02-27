const crypto = require('crypto');
const path = require('path');
const http = require('http');
const url = require('url');
const express = require('express');
const ObjectID = require('mongodb').ObjectID;
const uuid = require('node-uuid');
const fs = require('fs');
const inspect = require('util').inspect;
const bcrypt = require('bcrypt');
var router = express.Router();
const mailer = require(path.join(__dirname,'..','..','utils','mailer'));
// const mailertransporter = mailer.transporter;


module.exports = function (opts) {

    var winston = opts.winston || require('winston');

    var current_files = {};
    var doDelete = true;



    const db = opts.database;

    const LOGIN_PATH = '/public/login';





    const User = db.collection('user');

    router.use(function (req, res, next) {
        winston.debug(req.body);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');

        if (!req.isAuthenticated()) {
            res.status(401);
            return res.end(JSON.stringify({
                "message": 'Unauthorized',
                status: "unauthorized"
            }));
        }
        next();
    });

    router.post('/me/generatepasswordreset', function (req, res) {
        User.findOne({ _id: req.user._id }, function (err, user) {
            if (err) {
                winston.error(err);
                res.status(401);
                return res.end(JSON.stringify({
                    "message": 'Unauthorized',
                    status: "unauthorized"
                }));
            };

            reset_password_token = {
                token: crypto.randomBytes(32).toString('hex'),
                created: Date.now()
            };

            User.updateOne({ _id: req.user._id },
                { $set: { reset_password_token: reset_password_token } }, function (error, result) {
                    if (error) {
                        winston.error(error);
                    }
                    winston.debug(result.result);
                    User.findOne({ _id: req.user._id }, function (err, user) {
                        winston.debug(user);
                        if (err) {
                            winston.error(err);
                            res.status(401);
                            res.setHeader('content-type', 'application/json; charset=utf-8');
                            return res.end(JSON.stringify({
                                "message": 'Unauthorized',
                                status: "unauthorized"
                            }));
                        }

                        var msg = "Your password reset token is: " + reset_password_token.token;

                        var mailOptions = {
                            from: '"Coderuss" <russ@coderuss.com>',
                            to: user.username,
                            subject: 'Password Reset Requested', // Subject line
                            text: msg, // plaintext body
                            html: msg, // html body
                        };

                        mailer.sendMail(mailOptions, function(error, info){
                            if(error){
                                return winston.error(error);
                            }
                            winston.debug('Message sent: ' + info.response);
                        });

                        return res.status(201).send({
                            'status': 'success',
                            'meta': { 'message': 'Check your email for your password reset link.' }
                        });
                    });
                }
            );


        });
    });

    // router.post('/me/resetpasswordwithtoken', function (req, res) {

    //     User.updateOne({ _id: ObjectID(req.user._id) },
    //         { $set: set }, function (error, result) {
    //             if (error) {
    //                 winston.error(error);
    //             }
    //             winston.debug(result.result);
    //             User.findOne({ _id: req.user._id }, function (err, user) {
    //                 winston.debug(user);
    //                 if (err) {
    //                     winston.error(err);
    //                     res.status(401);
    //                     return res.end(JSON.stringify({
    //                         "message": 'Unauthorized',
    //                         status: "unauthorized"
    //                     }));
    //                 }
    //                 return res.status(201).send(JSON.stringify({
    //                     _id: user._id,
    //                     username: user.username,
    //                     email: user.email || null,
    //                     name: user.name || null
    //                 })).end();
    //             });
    //         }
    //     );
    // });

    router.get('/me', function (req, res) {

        User.findOne({ _id: req.user._id }, function (err, user) {
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
                name: user.name || null
            })).end();
        });
    });


    router.post('/me', function (req, res) {
        winston.debug(req.headers, { endpoint: '/v2/users/me', tag: 'headers' })
        winston.debug(req.body, { endpoint: '/v2/users/me' });
        var set = {};
        if (req.body.email !== undefined) {
            set.email = req.body.email;
        }
        if (req.body.name !== undefined) {
            set.name = req.body.name;
        }
        if (!set.name && !set.email) {
            res.status(400);
            return res.end(JSON.stringify({
                "message": 'Bad Request',
                status: "Bad Request"
            }));
            return;
        }
        User.updateOne({ _id: ObjectID(req.user._id) },
            { $set: set }, function (error, result) {
                if (error) {
                    winston.error(error);
                }
                winston.debug(result.result);
                User.findOne({ _id: req.user._id }, function (err, user) {
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
            }
        );

    });

    module.router = router;

    return module;

};