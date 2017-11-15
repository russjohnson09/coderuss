console.log('loaded fitbit.js', Date.now());

/**
 *
 * https://github.com/jaredhanson/passport-fitbit
 *
 *
 * https://dev.fitbit.com/reference/web-api/basics/#hitting-the-rate-limit
 * Rate limit is currently 150 per user per hour.
 *
 *
 *
 * @param opts
 * @returns router
 */
module.exports = function (opts) {
    let passport = require('passport');
    let request = require('request');
    var FitbitStrategy = require('passport-fitbit-oauth2').FitbitOAuth2Strategy;

    let User = opts.User;

    let winston = opts.winston || require('winston');
    winston.info('loaded winston');
    let router = opts.router || require('express').Router();


    const FITBIT_CLIENT_ID = opts.FITBIT_CLIENT_ID;
    const FITBIT_CLIENT_SECRET = opts.FITBIT_CLIENT_SECRET;
    const BASE_URL = opts.BASE_URL;
    const CODERUSS_BASE_URL = opts.CODERUSS_BASE_URL;
    const TOKEN_EXPIRE = opts.TOKEN_EXPIRE || (60 * 60); //Default refresh


    let callbackUrl = BASE_URL + '/auth/callback';

    winston.info(callbackUrl);

    winston.info('hello fitbit.js');

    function addUpdateUser(opts, cb) {
        winston.info('addUpdateUser' + JSON.stringify(opts));
        cb(null, {});
    }

    passport.use(new FitbitStrategy({
            clientID: FITBIT_CLIENT_ID,
            clientSecret: FITBIT_CLIENT_SECRET,
            callbackURL: callbackUrl,
        },function(){}
    ));

    router.use(function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        else {
            return res.status(401).json({message: 'must be logged in'});
        }
    });


    router.get('/', function (req, res, next) {
        return res.json({})
    });

    router.get('/auth',
        passport.authenticate('fitbit', {
                scope: ['activity', 'heartrate', 'location', 'profile', 'nutrition',
                'settings', 'sleep', 'social', 'weight']
            }
        ));

    const FITBIT_OAUTH_URL = 'https://www.fitbit.com/oauth2/authorize';
    const FITBIT_ACCESS_TOKEN_URL = 'https://api.fitbit.com/oauth2/token';

    router.get('/auth/callback', function (req, expressRes, next) {
            let user = req.user;


            winston.info('/auth/callback');
            let code = req.query.code;
            let requestObj = {
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: callbackUrl
            };
            request({
                method: 'POST',
                auth: {
                    user: FITBIT_CLIENT_ID,
                    password: FITBIT_CLIENT_SECRET
                },
                url: FITBIT_ACCESS_TOKEN_URL,
                form: requestObj,
                // body: JSON.stringify(requestObj)
            }, function (error, res, body) {
                if (error) {
                    winston.error(error);
                }
                winston.info(res.headers);
                winston.info(res.statusCode);

                if (res.statusCode !== 200) {
                    winston.error('unexected statusCode ' + res.statusCode);
                    winston.error(body);
                    return expressRes.redirect('/angular/#!/fitbit');
                }
                else {
                    winston.info(body);

                    let access_token_response = JSON.parse(body);
                    let access_token = access_token_response.access_token;
                    let user_id = access_token_response.user_id;
                    let refresh_token = access_token_response.refresh_token;
                    let scope = access_token_response.scope;
                    let expires_in = access_token_response.expires_in;

                    User.findOne({
                        _id: user._id
                    }, function (err, result) {
                        if (err) {
                            winston.error(err);
                        }
                        if (!result) {
                            winston.error('could not find user', user)
                            return expressRes.redirect('/angular/#!/fitbit');
                        }
                        else {
                            winston.info(result);

                            User.updateOne({
                                _id: user._id
                            }, {
                                $set: {
                                    fitbit_user: {
                                        access_token: access_token,
                                        expires_in: expires_in,
                                        refresh_token: refresh_token,
                                        scope: scope,
                                        //token_type: Bearer
                                        user_id: user_id,
                                    }
                                }
                            }, function (error, result) {
                                if (error) {
                                    winston.error(error);
                                    return expressRes.redirect('/angular/#!/fitbit?error=failed_user_update');
                                }
                                winston.info(result.result);
                                winston.info(result.upsertedId);
                                return expressRes.redirect('/angular/#!/fitbit');
                            });
                        }
                    });


                    //GET https://api.fitbit.com/1/user/-/profile.json

                    /**
                     * https://dev.fitbit.com/reference/web-api/oauth2/#making-requests
                     * {
    "errors": [
        {
            "errorType": "expired_token",
            "message": "Access token expired: eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE0MzAzNDM3MzUsInNjb3BlcyI6Indwcm8gd2xvYyB3bnV0IHdzbGUgd3NldCB3aHIgd3dlaSB3YWN0IHdzb2MiLCJzdWIiOiJBQkNERUYiLCJhdWQiOiJJSktMTU4iLCJpc3MiOiJGaXRiaXQiLCJ0eXAiOiJhY2Nlc3NfdG9rZW4iLCJpYXQiOjE0MzAzNDAxMzV9.z0VHrIEzjsBnjiNMBey6wtu26yHTnSWz_qlqoEpUlpc"
        }
    ]
}
                     */
                    //GET https://api.fitbit.com/1/user/[user-id]/profile.json
                    //Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE0MzAzNDM3MzUsInNjb3BlcyI6Indwcm8gd2xvYyB3bnV0IHdzbGUgd3NldCB3aHIgd3dlaSB3YWN0IHdzb2MiLCJzdWIiOiJBQkNERUYiLCJhdWQiOiJJSktMTU4iLCJpc3MiOiJGaXRiaXQiLCJ0eXAiOiJhY2Nlc3NfdG9rZW4iLCJpYXQiOjE0MzAzNDAxMzV9.z0VHrIEzjsBnjiNMBey6wtu26yHTnSWz_qlqoEpUlpc
                    request({
                        method: 'GET',
                        headers: {
                            'Authorization': 'Bearer ' + access_token
                        },
                        url: 'https://api.fitbit.com/1/user/-/profile.json',
                        form: requestObj,
                        // body: JSON.stringify(requestObj)
                    }, function (error, res, body) {

                        winston.info(error, body, res.headers);
                    })
                }
            })
        }
    );

    /**
     * Refresh the current user's token.
     */
    router.get('/refresh', function(req,res,next) {

        let redirect_uri = req.query.redirect_uri ||
            CODERUSS_BASE_URL + '/angular/#!/fitbit';

        refreshToken(req.user).then(function () {
                res.redirect(redirect_uri);
            },
            function () {
                console.log('error redirect to link fitbit');
                res.redirect('../auth');
            });
    });

    let promisesByRefreshToken = {};
    function refreshToken(user) {
        let fitbit_user = user.fitbit_user;
        let refresh_token = fitbit_user.refresh_token;


        if (promisesByRefreshToken[refresh_token]) {
            return promisesByRefreshToken[refresh_token];
        }

        let promise = (function() {
            let fitbit_user = user.fitbit_user;
            let access_token = fitbit_user.access_token;
            let refresh_token = fitbit_user.refresh_token;
            let expires_at = fitbit_user.expires_at || 0;

            let now = Date.now();

            let requestForm = {
                grant_type: 'refresh_token',
                refresh_token: refresh_token,
                expires_in: TOKEN_EXPIRE
                // expires_in: 5
            };

            let my_expires_at = now + (TOKEN_EXPIRE * 1000);

            winston.info('refresh token ' + JSON.stringify(requestForm));
            let url = 'https://api.fitbit.com/oauth2/token';

            let promise =  new Promise(function (resolve, reject) {
                winston.info('request new token ' + user._id);
                request({
                    method: 'POST',
                    auth: {
                        user: FITBIT_CLIENT_ID,
                        password: FITBIT_CLIENT_SECRET
                    },
                    url: url,
                    form: requestForm
                }, function (err, response, body) {

                    let access_token_response = JSON.parse(body);
                    winston.info('requested new token ',access_token_response);


                    let access_token = access_token_response.access_token;
                    let user_id = access_token_response.user_id;
                    let refresh_token = access_token_response.refresh_token;
                    let scope = access_token_response.scope;
                    let expires_in = access_token_response.expires_in;

                    if (response.statusCode !== 200) {
                        winston.error(response.statusCode);
                        winston.error('invalid response');
                        promisesByRefreshToken[refresh_token] = undefined;
                        return reject();
                    }

                    User.findOne({
                        _id: user._id
                    }, function (err, result) {
                        if (err) {
                            winston.error(err);
                        }
                        if (!result) {
                            winston.error('could not find user', user)
                            return expressRes.redirect('/angular/#!/fitbit');
                        }
                        else {
                            winston.info(result);

                            User.updateOne({
                                _id: user._id
                            }, {
                                $set: {
                                    fitbit_user: {
                                        access_token: access_token,
                                        expires_in: expires_in, //not really sure about the expires_in request on a refresh token. I think the original token needs to have the expires_in set ?
                                        expires_at: my_expires_at,
                                        refresh_token: refresh_token,
                                        scope: scope,
                                        user_id: user_id,
                                    }
                                }
                            }, function (error, result) {
                                winston.info('updated user',result.result);
                                winston.info(result.upsertedId);
                                promisesByRefreshToken[refresh_token] = undefined;
                                resolve();
                            });
                        }
                    });
                });
            });
            return promise;
        })(user);
        promisesByRefreshToken[refresh_token] = promise;
        return promise;
    }

    //v1/proxy
    var getProxy = function(req,res)
    {
        let url = req._url;
        let fitbit_user = req.user.fitbit_user;
        let access_token = fitbit_user.access_token;

        delete req.headers['referer'];
        delete req.headers['host'];
        req.headers['accept-encoding'] = 'deflate';
        req.headers['Authorization'] = 'Bearer ' + access_token;

        url += req.params.path;

        request({
            method: 'GET',
            headers: req.headers,
            url: url,
            // url: 'https://api.fitbit.com/1/user/-/profile.json',
            qs: req.query
        }, function (err, proxyResponse, proxyBody) {

            if (err) {
                return res.status(500).send(err).end();
            }

            let responseHeaders = {
                'content-type': proxyResponse.headers['content-type']
            };

            responseHeaders = proxyResponse.headers;

            winston.info(responseHeaders);

            return res
                .header(responseHeaders)
                .status(proxyResponse.statusCode)
                .send(proxyBody).end();
        });
    };


    router.get('/api:path(*)',function(req,res,next) {
        let fitbit_user = req.user.fitbit_user || {};

        if (!fitbit_user) {
            return res.status(401).json({message: 'no fitbit user link'})
        }

        let expires_at = fitbit_user.expires_at || 0;
        let now = Date.now();
        winston.info('check expiration of fitbit token ',{expires_at: expires_at,
        now: now,expires_at_minus_now: (expires_at - now)});
        if (((expires_at - now) > (60 * 1000))) { //update a minute ahead of timeout
            winston.info('token has not expired.');
            return next();
        }

        refreshToken(req.user).then(function() {
            next();
        },function() {
            return res.status(401).json({message:'failed to refresh token'});
        })
    }, function(req,res,next) {
        req._url = 'https://api.fitbit.com';
        next();
    },getProxy);



    return router;
};


if (require.main === module) {
    (function () {
        let express = require('express');
        let app = express();
        let winston = require('winston');
        let passport = require('passport');
        let path = require('path');

        require('dotenv').config();

        const MONGO_URI = process.env.MONGO_URI;


        var bodyParser = require('body-parser');
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(bodyParser.json());
        const cookieParser  = require('cookie-parser');
        app.use(cookieParser());
        var expressSession = require('express-session');
        var sessionMiddleware = expressSession({
            secret: process.env.EXPRESS_SESSION_SECRET,
            store: new(require("connect-mongo")(expressSession))({
                url: MONGO_URI
            })
        });
        app.use(sessionMiddleware);
        app.use(passport.initialize());
        app.use(passport.session());


        var mainLogger = new winston.Logger({
            transports: [
                new winston.transports.Console({ level: 'info' }),
                ],
            exceptionHandlers: [new winston.transports.Console({
                colorize: true,
                json: true
            })],
            exitOnError: process.env.NODE_ENV == 'DEV'
        });

        mainLogger.debug('mainLogger');
        mainLogger.info('mainLogger');
        mainLogger.error('mainLogger');

        const MongoClient = require('mongodb').MongoClient;

        MongoClient.connect(MONGO_URI, function (err, db) {
            if (err) {
                throw err;
            }
            app.listen(3000, function () {

                app.use(express.static(path.join(__dirname,'..','..', 'public/')));

                app.use('/v1', require(__dirname + '/../../v1/login/main.js')({
                    winston: mainLogger,
                    database: db,
                    passport: passport,
                }).router);

                app.use('/v1/users', require(__dirname + '/../../v1/users/main')({
                    winston: mainLogger,
                    database: db,
                    passport: passport,
                }).router);

                app.use('/v1/fitbit', function (req, res, next) {
                    winston.info('user',{_id: req.user._id + ''});
                    next();
                },  module.exports({
                    FITBIT_CLIENT_ID: process.env.FITBIT_CLIENT_ID,
                    FITBIT_CLIENT_SECRET: process.env.FITBIT_CLIENT_SECRET,
                    BASE_URL: 'http://localhost:3000/v1/fitbit',
                    CODERUSS_BASE_URL: 'http://localhost:3000',
                    winston: winston,
                    User: db.collection('user')
                }));

                let cp = require('child_process');
                let spawn = cp.spawn;

                let child = spawn("mocha", ['./**/*_spec.js'],
                    {cwd: __dirname, env: process.env});
                child.stdout.on('data', function (data) {
                    process.stdout.write(data);
                });

                child.stderr.on('data', function (data) {
                    process.stderr.write(data);
                });
                child.on('exit', function (exitcode) {
                    if (exitcode !== 0) {
                        // process.exit(exitcode);
                    }
                });

            });

        });


    })();


} else {
    console.log('required as a module');
}