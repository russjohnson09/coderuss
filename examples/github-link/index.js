// https://github.com/login/oauth/authorize

require('dotenv').config();
const express = require('express');
const app = express();
const connect_mongo = require("connect-mongo");
const passport = require('passport');
const crypto = require('crypto');
const request = require('request');
const qs = require('qs');
const expressSession = require('express-session');
const mongodb = require('mongodb');
const exphbs = require('express-handlebars');


const CODERUSS_USER_AGENT = 'CODERUSS';


const mongoose = require("mongoose"); //http://mongoosejs.com/docs/index.html

const Schema = mongoose.Schema;

const User = mongoose.model('User', Schema({
    access_token_github: String,
    id_github: Number
}));


//mongodb connection
var db;


const MongoClient = mongodb.MongoClient


const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_API_URL = 'https://api.github.com';


//db connection setup
(function () {
    mongoose.connect(MONGO_URI);
    db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error"));
    db.once("open", function (callback) {
        console.log("Connection succeeded.");
    });
})()

var main_application;
MongoClient.connect(MONGO_URI, function (err, db) {
    database = mongo_db = db;
});





//setup session
(function () {
    var sessionMiddleware = expressSession(
        {
            secret: 'secret',
            store: new (connect_mongo(expressSession))({
                url: MONGO_URI
            })
        });
    app.use(sessionMiddleware);
})();

//setup views
(function () {
    var hbs = exphbs({
        defaultLayout: 'main',
        helpers: {
            json: function (context) { return JSON.stringify(context, null, '\t'); },
        }
    });

    // app.set('view engine', 'pug');

    app.engine('handlebars', hbs);
    app.set('view engine', 'handlebars');
})();

//server listen
(function () {
    var server = require('http').Server(app);

    server = server.listen(3000, function () {
        console.log(server.address().port);
    });

})();


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
        console.log(res.statusCode);
        console.log(body);

        if (err) {
            console.log(err);
            return callback(err, null);
        }
        var data = JSON.parse(body);
        if (!data.id) {
            console.log('could not get user');
            return callback('could not get user');
        }
        return callback(null, data);
    });
}


//setup routes
(function () {
    app.get('/', function (req, res) {
        var sess = req.session
        console.log(sess);
        if (!sess.user) {
            return res.redirect('/v1/link/github');
        }
        if (!sess.user.access_token_github) {
            return res.redirect('/v1/link/github');
        }
        getGithubUser(sess.user.access_token_github, function (error, user) {
            res.render('home', {
                title: 'Hey', message: 'Hello there!', client_id: process.env.GITHUB_ID,
                'github_user': user
            });
            res.status(200);
            // res.end();
        })

    });

    app.get('/v1/link/github', function (req, res) {
        var sess = req.session;
        console.log(sess)
        console.log(req.query);
        if (req.query.code && req.query.state
            && sess.github_oauth_state === req.query.state) {
            console.log('has code');
            var code = req.query.code;

            addUpdateGithubUser(code, req.query.state, function (err, user) {
                if (err) {
                    return res.end();

                }
                if (user) {
                    sess.user = user;
                    return res.redirect('/');
                }
            })

        }
        else if (req.query.code) {
            res.status(400);
            res.json({ message: "bad request" });
        }
        else {
            sess.github_oauth_state = getToken();
            var github_auth_redirect = getGithubAuthRedirect();
            github_auth_redirect += '&state=' + sess.github_oauth_state;
            res.redirect(github_auth_redirect);
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



function addUpdateGithubUser(code, state, callback) {
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
        // access_token=e72e16c7e42f292c6912e7710c838347ae178b4a&scope=user%2Cgist&token_type=bearer
        console.log(res.headers);
        console.log(res.statusCode);
        if (res.statusCode !== 200) {
            console.log('unexected statusCode ' + res.statusCode);
        }
        else {
            console.log(body);
            var data = JSON.parse(body);
            var access_token_github = data.access_token;
            if (!access_token_github) {
                console.log('failed to get access_token');
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
                    console.log(res.statusCode);
                    console.log(body);

                    if (err) {
                        console.log(err);
                        return callback();
                    }
                    var data = JSON.parse(body);
                    if (!data.id) {
                        console.log('could not link github account');
                        return callback();
                    }
                    User.findOne(
                        {
                            id_github: data.id,
                        }, function (err, user) {
                            if (user) {
                                console.log('user already exists');
                                return callback(null, user);
                            }
                            else {
                                user = new User();
                                user.access_token_github = access_token_github;
                                user.id_github = data.id;
                                user.save(function (err, product, numAffected) {
                                    if (err) {
                                        console.log(err);
                                        return callback();

                                    }
                                    console.log('user saved/updated', numAffected);
                                    return callback(null, user);

                                })
                            }
                        });

                })

            }
        }
    })

}
