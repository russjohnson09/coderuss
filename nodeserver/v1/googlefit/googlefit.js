console.log('loaded googlefit.js', Date.now());

/**
 *
 *
 *
 *
 *
 *
 * @param opts
 * @returns router
 */
module.exports = function (opts) {
    let passport = require('passport');
    let request = require('request');
    let passportOAuth2 = require('passport-oauth2');
    let OAuth2Strategy = passportOAuth2.Strategy;

    let User = opts.User;

    let winston = opts.winston || require('winston');
    winston.info('loaded winston');
    let router = opts.router || require('express').Router();


    const CLIENT_ID = opts.CLIENT_ID;
    const CLIENT_SECRET = opts.CLIENT_SECRET;
    const BASE_URL = opts.BASE_URL;
    const CODERUSS_BASE_URL = opts.CODERUSS_BASE_URL;
    const TOKEN_EXPIRE = opts.TOKEN_EXPIRE || (60 * 60); //Default refresh

    let callbackUrl = BASE_URL + '/auth/callback';

    function addUpdateUser(opts, cb) {
        winston.info('addUpdateUser' + JSON.stringify(opts));
        cb(null, {});
    }


    const AUTH_URI = "https://accounts.google.com/o/oauth2/auth";
    const TOKEN_URI = "https://accounts.google.com/o/oauth2/token";


    const PROFILE_URL = 'https://www.googleapis.com/fitness/v1/users/me/dataSources';
    const DATA_SOURCES_URL = 'https://www.googleapis.com/fitness/v1/users/me/dataSources';

    const UPDATE_HEART_RATE = 'https://www.googleapis.com/fitness/v1/users/me/dataSources/ raw:com.google.heart_rate.bpm:1234567890:Example%20Fit:example-fit-hrm-1:123456/datasets/1411053997000000000-1411057556000000000'


    const DATASOURCE_URL = 'https://www.googleapis.com/fitness/v1/users/me/dataSources'; //POST

    const USERINFO_URL = 'https://www.googleapis.com/userinfo/v2/me';

    const APP_NAME = 'digital-arbor-18810';

    /**
     *
     * 409 conflict when creating a dataSource that already exists.
     {
"name": "example-fit-heart-rate",
"dataStreamId":
   "raw:18810:com.example.fit.someapp:Example Fit:example-fit-hrm-1:123456",
"dataType": {
   "field": [{
       "name": "bpm",
       "format": "floatPoint"
   }],
   "name": "18810"
},
"application": {
   "packageName": "com.example.fit.someapp",
   "version": "1.0"
},
"device": {
   "model": "fit-hrm-1",
   "version": "2",
   "type": "watch",
   "uid": "123456",
   "manufacturer":"Coderuss Fit"
},
"type": "raw"
}
     * @param data
     */
    function getDataStreamID(data)
    {
        // let name = 'Example Fit';
        // // let deviceName = 'example-fit-hrm-1';
        // let ending = '123456';

        let dataStreamAry = [
            data['type'],
            data['dataType']['name'],
            data['application']['packageName'],
            data['device']['manufacturer'],
            data['device']['model'],
            data['device']['uid'],
        ];
        return dataStreamAry.join(':');
    }

    /**
     {
    "name": "example-fit-heart-rate",
    "dataStreamId":
        "raw:com.google.heart_rate.bpm:1234567890:Example Fit:example-fit-hrm-1:123456",
    "dataType": {
        "field": [{
            "name": "bpm",
            "format": "floatPoint"
        }],
        "name": "com.google.heart_rate.bpm"
    },
    "application": {
        "packageName": "com.example.fit.someapp",
        "version": "1.0"
    },
    "device": {
        "model": "example-fit-hrm-1",
        "version": "1",
        "type": "watch",
        "uid": "123456",
        "manufacturer":"Example Fit"
    },
    "type": "raw"
}
     */



    passport.use(new OAuth2Strategy({
            clientID: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            callbackURL: callbackUrl,
            authorizationURL: AUTH_URI,
            tokenURL: TOKEN_URI
        }, function () {
        }
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


    //https://www.googleapis.com/fitness/v1/users/me/dataSources

    /**
     POST /oauth2/v4/token HTTP/1.1
     Host: www.googleapis.com
     Content-length: 233
     content-type: application/x-www-form-urlencoded
     user-agent: google-oauth-playground
     code=4%2FVH0Me75DSTCzuUQCfvxSi-QlRP7pcwnsUz2cdAaYqcQ&redirect_uri=https%3A%2F%2Fdevelopers.google.com%2Foauthplayground&client_id=407408718192.apps.googleusercontent.com&client_secret=************&scope=&grant_type=authorization_code
     HTTP/1.1 200 OK
     Content-length: 1360
     X-xss-protection: 1; mode=block
     X-content-type-options: nosniff
     Transfer-encoding: chunked
     Expires: Mon, 01 Jan 1990 00:00:00 GMT
     Vary: Origin, X-Origin
     Server: GSE
     -content-encoding: gzip
     Pragma: no-cache
     Cache-control: no-cache, no-store, max-age=0, must-revalidate
     Date: Tue, 05 Dec 2017 03:32:47 GMT
     X-frame-options: SAMEORIGIN
     Alt-svc: hq=":443"; ma=2592000; quic=51303431; quic=51303339; quic=51303338; quic=51303337; quic=51303335,quic=":443"; ma=2592000; v="41,39,38,37,35"
     Content-type: application/json; charset=UTF-8
     {
       "access_token": "ya29.GlsZBYLf53ekdKdDHB3JcckigNfxBGwfseeKrgQFvKL0CiracVpqtMjZxskih8SnPPf6Iod9BkfU0BW_nrwxCU0MkWWmSuknw9t974qhaycBrvPyo_hMPq5vEbUm",
       "token_type": "Bearer",
       "expires_in": 3600,
       "refresh_token": "1/G_F9yrZDr0nzU4qsKGwOoisBV9jOWbHh-g2CWwwZAUs",
       "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ijg3NzBmNjE1OGIxMjUwNDBiOThlNTBhMWUwZTY3OTBmZjJmOWVhMDkifQ.eyJhenAiOiI0MDc0MDg3MTgxOTIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI0MDc0MDg3MTgxOTIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTMzNDE3MTE0NjMwOTE0MTEwMzgiLCJlbWFpbCI6InJ1c3Nqb2huc29uMDlAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJmV0xXUWh1eThsaENYN0xzam1VYkd3IiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwiaWF0IjoxNTEyNDQ0NzY3LCJleHAiOjE1MTI0NDgzNjcsIm5hbWUiOiJSdXNzZWxsIEpvaG5zb24iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDYuZ29vZ2xldXNlcmNvbnRlbnQuY29tLy1BZS1UQkp1d3V3RS9BQUFBQUFBQUFBSS9BQUFBQUFBQUJScy9iUXRDVndLaTNmTS9zOTYtYy9waG90by5qcGciLCJnaXZlbl9uYW1lIjoiUnVzc2VsbCIsImZhbWlseV9uYW1lIjoiSm9obnNvbiIsImxvY2FsZSI6ImVuIn0.BqDd9p9o_ylZF0K43IXM6EF4s-QYQMH6fyMo-vbSP_ctUBUCD2G3y9fi00DfWrwx3sUDhL5uWbVSh0wNdyhZz-F7effHKGbZcxAxEhFtWBs6177yeMhrW9nGKmQHCs06Dd1lm345ylsLZAXAvqQsBhk94ounY4YuYcKRYaQF0ufiZ_z4lQd2VkXAvchdu-NShRqcOBGZNanrieuoHtUNcne4ekSMiqVOOGCnn1mICw4TvsH3r5VFrfj2WxqDZZLGH0ay_U6OII_LBLIHe6_q1aGtWdbeJsBDGcDe3fwAncnb_0pvVfH4RBhSptYBXDY52PbYsiHmFFEfpyCtnfYLng"
     }
     */

    //https://gsuite-developers.googleblog.com/2012/01/tips-on-using-apis-discovery-service.html
    //https://developers.google.com/discovery/

        //https://developers.google.com/fit/rest/v1/authorization
    let scope = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',

        'https://www.googleapis.com/auth/fitness.activity.read',
        'https://www.googleapis.com/auth/fitness.activity.write',
        'https://www.googleapis.com/auth/fitness.blood_glucose.read',
        'https://www.googleapis.com/auth/fitness.blood_glucose.write',
        'https://www.googleapis.com/auth/fitness.blood_pressure.read',
        'https://www.googleapis.com/auth/fitness.blood_pressure.write',
        'https://www.googleapis.com/auth/fitness.body.read',
        'https://www.googleapis.com/auth/fitness.body.write',
        'https://www.googleapis.com/auth/fitness.body_temperature.read',
        'https://www.googleapis.com/auth/fitness.body_temperature.write',
        'https://www.googleapis.com/auth/fitness.location.read',
        'https://www.googleapis.com/auth/fitness.location.write',
        'https://www.googleapis.com/auth/fitness.nutrition.read',
        'https://www.googleapis.com/auth/fitness.nutrition.write',
        'https://www.googleapis.com/auth/fitness.oxygen_saturation.read',
        'https://www.googleapis.com/auth/fitness.oxygen_saturation.write',
        'https://www.googleapis.com/auth/fitness.reproductive_health.read',
        'https://www.googleapis.com/auth/fitness.reproductive_health.write'
    ];
    router.get('/auth',
        passport.authenticate('oauth2', {
                scope: scope
            }
        ));



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
                user: CLIENT_ID,
                password: CLIENT_SECRET
            },
            url: TOKEN_URI,
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
                return expressRes.redirect('/angular/#!/googlefit');
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
                        return expressRes.redirect('/angular/#!/googlefit');
                    }
                    else {
                        winston.info(result);

                        User.updateOne({
                            _id: user._id
                        }, {
                            $set: {
                                googlefit_user: {
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
                                return expressRes.redirect('/angular/#!/googlefit?error=failed_user_update');
                            }
                            winston.info(result.result);
                            winston.info(result.upsertedId);
                            return expressRes.redirect('/angular/#!/googlefit');
                        });
                    }
                    request({
                        method: 'GET',
                        headers: {
                            'Authorization': 'Bearer ' + access_token
                        },
                        url: PROFILE_URL,
                        form: requestObj,
                    }, function (error, res, body) {

                        winston.info(error, body, res.headers);
                    })
                })
            }
        });
    });


    /**
     * Refresh the current user's token.
     */
    router.get('/refresh', function (req, res, next) {

        let redirect_uri = req.query.redirect_uri ||
            CODERUSS_BASE_URL + '/angular/#!/googlefit';

        refreshToken(req.user).then(function () {
                res.redirect(redirect_uri);
            },
            function (err) {
                console.log('error redirect to link googlefit', err);
                res.redirect('../auth');
            });
    });

    let promisesByRefreshToken = {};

    function refreshToken(user) {
        return new Promise(function (resolve) {
            resolve();
        })
    }

    //v1/proxy
    var getProxy = function (req, res) {
        let url = req._url;
        let googlefit_user = req.user.googlefit_user;
        let access_token = googlefit_user.access_token;

        let headers = {
            'accept-encoding': 'deflate',
            'authorization': 'Bearer ' + access_token,
            'content-type': 'application/json'
        };

        url += req.params.path;

        let opts = {
            method: req.method,
            headers: headers,
            url: url,
            qs: req.query,
        };

        if (req.body) {
            opts.body = JSON.stringify(req.body);
        }

        request(opts, function (err, proxyResponse, proxyBody) {

            if (err) {
                return res.status(500).send(err).end();
            }

            let responseHeaders = {
                'content-type': proxyResponse.headers['content-type']
            };

            winston.info(responseHeaders);

            return res
                .header(responseHeaders)
                .status(proxyResponse.statusCode)
                .send(proxyBody).end();
        });
    };


    function proxyApiGetToken(req, res, next) {
        return next();
    }

    router.use('/api:path(*)',
        function (req, res, next) {
            next();
        },
        proxyApiGetToken,
        getProxy);


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
        const cookieParser = require('cookie-parser');
        app.use(cookieParser());
        var expressSession = require('express-session');
        var sessionMiddleware = expressSession({
            secret: process.env.EXPRESS_SESSION_SECRET,
            store: new (require("connect-mongo")(expressSession))({
                url: MONGO_URI
            })
        });
        app.use(sessionMiddleware);
        app.use(passport.initialize());
        app.use(passport.session());


        var mainLogger = new winston.Logger({
            transports: [
                new winston.transports.Console({level: 'info'}),
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

                app.use(express.static(path.join(__dirname, '..', '..', 'public/')));

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

                app.use('/v1/googlefit', function (req, res, next) {
                    winston.info('user', {_id: req.user._id + ''});
                    next();
                }, module.exports({
                    CLIENT_ID: process.env.GOOGLE_FIT_CLIENT_ID,
                    CLIENT_SECRET: process.env.GOOGLE_FIT_CLIENT_SECRET,
                    BASE_URL: 'http://localhost:3000/v1/googlefit',
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