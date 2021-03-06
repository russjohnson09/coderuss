const alexa = require("alexa-app");
const express = require('express');

const r = require('request');

const moment = require('moment-timezone');
const tz = 'America/New_York';

const travis_master_branch = "https://api.travis-ci.org/repos/russjohnson09/coderuss/branches/master";

const seven_day_uptime = 'https://uptime.statuscake.com/?TestID=mOB59axrug';


const VERSION = '1.0';

const cheerio = require('cheerio');

const AUTH_RUSS_SKILL_ID = 'amzn1.ask.skill.1a53d497-6c64-4836-9000-7b2bd4b49d6e';


// https://github.com/tejashah88/alexa-app-example/blob/master/index.js
module.exports = function(app) {


    // ALWAYS setup the alexa app and attach it to express before anything else.
    var alexaApp = new alexa.app("v1/alexa");

    var winston = app.get('winston');

    winston.info('started alexa');

    alexaApp.express({
        expressApp: app,
        router: express.Router(),

        // verifies requests come from amazon alexa. Must be enabled for production.
        // You can disable this if you're running a dev environment and want to POST
        // things to test behavior. enabled by default.
        checkCert: process.env.ALEXA_CHECK_CERT != 0,

        // sets up a GET route when set to true. This is handy for testing in
        // development, but not recommended for production. disabled by default
        // debug: true
    });

    // now POST calls to /test in express will be handled by the app.request() function

    // from here on you can setup any other express routes or middlewares as normal
    app.set("view engine", "ejs");

    alexaApp.launch(function(request, response) {
        // winston.info(request);

        if (request.applicationId === AUTH_RUSS_SKILL_ID) {
            // winston.info(request.data);
            response.say("Welcome to auth russ an authorized application.");

            return;
        }

        response.say("Wel");
    });
    /**
{
  "intents": [
    {
      "intent": "AMAZON.StopIntent"
    },
    {
      "intent": "AMAZON.CancelIntent"
    },
    {
      "intent": "statusIntent"
    },
    {
      "intent": "nameIntent",
      "slots": [
      {
                "name": "NAME",
                "type": "LITERAL"
            }
      ]
    }
  ]
}

//utterences
nameIntent my {name is|name's} {names|NAME}
nameIntent set my name to {names|NAME}
**/

    // alexaApp.dictionary = {
    //     "names": ["matt", "joe", "bob", "bill", "mary", "jane", "dawn"]
    // };

    // alexaApp.intent("nameIntent", {
    //         "slots": {
    //             "NAME": "LITERAL"
    //         },
    //         "utterances": [
    //             "my {name is|name's} {names|NAME}", "set my name to {names|NAME}"
    //         ]
    //     },
    //     function(request, response) {
    //         response.say("Success!");
    //     }
    // );

    function getAlexaReadableTime(serverstarted) {
        return moment(serverstarted).tz(tz).format('MMMM Do, h mm a z');
    }

    var getAccessToken = function(alexaRequest) {
        console.log(alexaRequest);
        if (!alexaRequest || !alexaRequest.sessionDetails ||
            !alexaRequest.sessionDetails ||
            !alexaRequest.sessionDetails.accessToken) {
            return null;
        }
        return alexaRequest.sessionDetails.accessToken;
    }

    function doStatusIntent(resolve, reject, alexaRequest, alexaResponse) {

        var accessToken = getAccessToken(alexaRequest);

        console.log('accessToken');
        console.log(accessToken);



        var port = app.get('port');
        var serverport;
        var count = 0;
        var expectedCount = 2;
        var serverstarted;
        var lastBuildStatus;
        var ar = alexaResponse;
        var logcount, user;
        var msg = '';

        if (accessToken) {
            expectedCount++;
            r.get({
                url: 'http://0.0.0.0:' + port + '/v1/users/me',
                headers: {
                    'content-type': 'application/json',
                    'Authorization': 'token ' + accessToken
                }
            }, function(error, response, body) {
                console.log(body);
                if (response.statusCode < 400) {
                    user = JSON.parse(body);
                }
                readResponse();
            })
        }

        // https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-voice-interface-and-user-experience-testing
        //https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-functional-testing
        // https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-voice-interface-and-user-experience-testing#supportive-prompting
        function readResponse() {
            count++;
            if (count == expectedCount) {
                console.log(serverstarted);
                console.log(user);
                var humanReadableTime = getAlexaReadableTime(serverstarted);
                if (user && user.username) {
                    msg += 'Hello ' + user.username + ' .';
                }

                msg += ' This server was deployed on ' + humanReadableTime +
                    '. The status of the most recent build for this repository\'s master branch is ' + lastBuildStatus;
                if (logcount) {
                    msg += ". Your application has logged " + logcount +
                        " events today."
                }

                console.log(msg);
                console.log(lastBuildStatus);
                alexaResponse.say(msg);
                resolve();
                return;
            }
        }

        r.get({
            url: travis_master_branch
        }, function(error, response, body) {
            lastBuildStatus = JSON.parse(body).branch.state;
            console.log(lastBuildStatus);
            readResponse();
        })


        r.get({
            headers: {
                'content-type': 'application/json'
            },
            url: 'http://0.0.0.0:' + port + '/v1/ping/detailed',
        }, function(error, response, body) {
            if (error) {
                console.log(error);
                alexaResponse.say("I'm sorry but there was an error processing your request.");
                resolve();
                return;
            }
            else {
                console.log(body);
                var data = JSON.parse(body);
                serverstarted = data.server.started;
                serverport = data.server.port;
                if (data.logcount) {
                    logcount = data.logcount;
                }
                readResponse();
            }
        });

    }

    alexaApp.dictionary.logs = ['error', 'info', 'all'];


    alexaApp.intent('rateMyAppIntent', {
        "utterances": [
            "rate my app",
            "rating",
        ]
    }, function(alexaRequest, alexaResponse) {
        alexaResponse.say('A plus. Good job');
    });

    alexaApp.intent("logIntent", {
            "slots": {
                "LOG": "LITERAL"
                    // "log": "LOG"
                    /**
                    error
                    info
                    all
                    **/
            },
            "utterances": [
                "log search {logs|LOG}",
                "log {logs|LOG}",
                "search logs {logs|LOG}"

            ]
        },
        function(alexaRequest, alexaResponse) {
            var log = alexaRequest.slot("LOG");
            if (!log) {
                log = 'all';
            }

            var accessToken = getAccessToken(alexaRequest);

            if (!accessToken) {
                alexaResponse.say('Not authorized.');
            }

            return new Promise(function(resolve, reject) {
                alexaResponse.say('Searching on ' + log + ' logs.');
                setTimeout(function() {
                    alexaResponse.say('Query turned up 10 logs.');
                    resolve();

                }, 1000);


            });

            winston.info(alexaRequest.data.request);
            // winston.info(log);
            // response.say("Finding logs " + request.slot("LOG"));

            // response.say("Success!");
        }
    );

    alexaApp.intent("statusIntent", {
            "utterances": [
                "status",
                "get status"
            ]
        },
        function(alexaRequest, alexaResponse) {
            return new Promise(function(resolve, reject) {
                doStatusIntent(resolve, reject, alexaRequest, alexaResponse);
            });;
        }
    );





    // winston.info(alexaApp.schema());
    // winston.info(alexaApp.utterances());

    console.log(alexaApp.schema());
    console.log(alexaApp.utterances());



}
