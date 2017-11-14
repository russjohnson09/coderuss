 console.log('loaded fitbit.js',Date.now());

 /**
  *
  * https://github.com/jaredhanson/passport-fitbit
  *
  * @param opts
  * @returns router
  */
 module.exports = function(opts)
{

    let passport = require('passport');
    let request = require('request');
    var FitbitStrategy = require( 'passport-fitbit-oauth2' ).FitbitOAuth2Strategy;;


    let winston = opts.winston || require('winston');
    winston.info('loaded winston');
    let router = opts.router || require('express').Router();


    const FITBIT_CLIENT_ID = opts.FITBIT_CLIENT_ID;
    const FITBIT_CLIENT_SECRET = opts.FITBIT_CLIENT_SECRET;
    const BASE_URL = opts.BASE_URL;

    let callbackUrl = BASE_URL + '/auth/callback';

    winston.info(callbackUrl);

    winston.info('hello fitbit.js');

    function addUpdateUser(opts,cb) {
        winston.info('addUpdateUser' + JSON.stringify(opts));

        cb(null,{});
    }

    passport.use(new FitbitStrategy({
            clientID:     FITBIT_CLIENT_ID,
            clientSecret: FITBIT_CLIENT_SECRET,
            // consumerKey: FITBIT_CONSUMER_KEY,
            // consumerSecret: FITBIT_CONSUMER_SECRET,
            callbackURL: callbackUrl,
            // callbackURL: "http://127.0.0.1:3000/auth/fitbit/callback"
        },
        function(token, tokenSecret, profile, cb) {
            addUpdateUser({ fitbitId: profile.id, token : token,
                tokenSecret: tokenSecret}, function(err,user) {
                return cb(err, user);
            });
            // User.findOrCreate({ fitbitId: profile.id }, function (err, user) {
            //     return cb(err, user);
            // });
        }
    ));




    router.get('/',function(req,res,next) {
        return res.json({})
    });

    router.get('/auth',
        passport.authenticate('fitbit', { scope:
            ['activity','heartrate','location','profile'] }
        ));

    const FITBIT_OAUTH_URL = 'https://www.fitbit.com/oauth2/authorize';

    const FITBIT_ACCESS_TOKEN_URL = 'https://api.fitbit.com/oauth2/token';


    // const GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize';
    // const GITHUB_ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token';
    // const GITHUB_API_URL = 'https://api.github.com';

    router.get('/auth/callback',function(req,res,next) {

        return passport.authenticate('fitbit'
            , function(err, user, info) {
                console.log('/auth/callback',err,user,info);

                if (err) {
                    winston.error('bad fitbit auth')
                    return res.redirect('/err');
                }
                else {
                    return res.redirect('/test')
                }
                // Generate a JSON response reflecting authentication status
                if (! user) {

                    return res.send({ success : false, message : 'authentication failed' });
                }
            }
        )(req, res, next);

        console.log('/auth/callback')
        winston.info('/auth/callback');

        let code = req.query.code;

        let requestObj = {
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: callbackUrl
        };

        winston.info(JSON.stringify(requestObj));

        //client_id:client secret
        request({
            method: 'POST',
            // headers: {
            //     'Content-Type': 'application/json'
            // },
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

            }
            else {
                winston.info(body);

                let access_token_response = JSON.parse(body);
                let access_token = access_token_response.access_token;
                let user_id = access_token_response.user_id;
                let refresh_token = access_token_response.refresh_token;
                let scope = access_token_response.scope;


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

                    winston.info(error,body,res.headers);
                })
            }
        })


        },function(req,res,next) {

        return;
        console.log('/auth/callback');

        passport.authenticate('fitbit'
            , function(err, user, info) {
                console.log('/auth/callback',err,user,info);

                if (err) {
                    return next(err); // will generate a 500 error
                }
                // Generate a JSON response reflecting authentication status
                if (! user) {
                    return res.send({ success : false, message : 'authentication failed' });
                }
            }
        )(req, res, next);
            // { failureRedirect: '/login' }),
        // function(req, res) {
        //     // Successful authentication, redirect home.
        //     res.redirect('/');
        //


        }
    );


    return router;
};


 if (require.main === module) {
     (function() {
         let express = require('express');
         let app = express();
         let winston = require('winston');
         require('dotenv').config();


         // var mainLogger = new winston.Logger({
         //     exceptionHandlers: [new winston.transports.Console({
         //         colorize: true,
         //         json: true
         //     })],
         //     exitOnError: process.env.NODE_ENV == 'DEV'
         // });

         const MONGO_URI = process.env.MONGO_URI;
         const MongoClient = require('mongodb').MongoClient;
         let passport = require('passport');

         MongoClient.connect(MONGO_URI, function(err, db) {
             if (err) {
                 throw err;
             }
             app.listen(3000, function () {
                 let router = module.exports({
                     FITBIT_CLIENT_ID: process.env.FITBIT_CLIENT_ID,
                     FITBIT_CLIENT_SECRET: process.env.FITBIT_CLIENT_SECRET,
                     BASE_URL: 'http://localhost:3000/v1/fitbit',
                     winston: winston
                 });
                 app.use('/v1/fitbit', function(req,res,next) {
                     winston.info('user');
                     winston.info(req.user);

                     next();
                 } ,router);

                 app.use('/v1', require(__dirname + '/../../v1/login/main.js')({
                     winston: winston,
                     database: db,
                     passport: passport,
                 }).router);

                 let cp = require('child_process');
                 let spawn = cp.spawn;

                 let child = spawn("mocha", ['./**/*_spec.js'],
                     {cwd: __dirname, env: process.env});
                 child.stdout.on('data', function(data) {
                     process.stdout.write(data);
                 });

                 child.stderr.on('data', function(data) {
                     process.stderr.write(data);
                 });
                 child.on('exit', function(exitcode) {
                     if (exitcode !== 0) {
                         process.exit(exitcode);
                     }
                 });

             });

         });


     })();



 } else {
     console.log('required as a module');
 }