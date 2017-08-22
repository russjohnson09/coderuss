var request = require('request');
var expect = require("chai").expect;
const winston = require('winston');
const path = require('path');
const fs = require('fs');
const moment = require('moment-timezone');
// var socket = require('socket.io-client')(socketurl);



let helper = require('./../helper')({});

const PORT = 3000;

const BASE_URL = "http://localhost:" + PORT;


const CONSOLE_LOG_LEVEL = process.env.CONSOLE_LOG_LEVEL || 'info';
var admin_username = process.env.MAIN_ADMIN_USERNAME || 'admin@foo.com';

const http = require('http');


winston.loggers.add('testlogger', {
    transports: [
        new (winston.transports.Console)({
            level: CONSOLE_LOG_LEVEL
        }),
    ]
});

var logger = winston.loggers.get('testlogger');

describe(path.basename(__dirname), function () {

    let headers = {};



    describe('unauthorized', function () {
        it('/v3/users/me/tvshows POST', function (done) {
            request({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    url: BASE_URL + '/v3/users/me/tvshows',
                    body: JSON.stringify({
                        tvmaze_id: 4189
                    })
                },
                function (err, response, body) {
                    expect(err).to.be.null;
                    logger.info(response.statusCode);
                    logger.info(body);
                    logger.info(response.headers);
                    expect(response.statusCode).to.be.equal(401);
                    done();
                });
        });
    });

    let user = {
        // "username": "username" +Date.now()+"@foo.com",
        "username": "username" + "@foo.com",
        "password": "P@ssw0rd"
    };

    let headersAdminJson;
    let cookie;

    describe('login and add tvshow', function () {
        describe('/v1/login as admin', function () {
            var username = admin_username;
            var password = "admin@foo.com";
            it("successfully login", function (done) {
                request({
                    method: "POST",
                    json: user,
                    uri: BASE_URL + '/v1/login'
                }, function (error, response, body) {
                    expect(error).to.be.equal(null);
                    expect(response.statusCode).to.equal(201);
                    expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
                    expect(response.headers['set-cookie']).not.to.be.undefined;
                    cookie = response.headers['set-cookie'];
                    headersAdminJson = {
                        'Cookie': cookie,
                        'Content-Type': 'application/json'
                    };
                    done();
                });
            });
        });
    })

    // /v3/users/me/tvshows

    /**
     * {tvmaze_id: 4189}
     tvmaze_id
     :
     4189
     */

    describe('add mock of general hospital and get notification for new episode', function () {
        it('/v3/users/me/tvshows POST', function (done) {
            request({
                    method: 'POST',
                    headers: headersAdminJson,
                    url: BASE_URL + '/v3/users/me/tvshows',
                    body: JSON.stringify({
                        tvmaze_id: 4189
                    })
                },
                function (err, response, body) {
                    expect(err).to.be.null;
                    logger.info(response.statusCode);
                    logger.info(body);
                    logger.info(response.headers);
                    expect(response.statusCode).to.be.equal(200);
                    done();
                });
        });


        it('/v3/users/me/tvshows GET', function (done) {
            request({
                    method: 'GET',
                    headers: headersAdminJson,
                    url: BASE_URL + '/v3/users/me/tvshows',
                },
                function (err, response, body) {
                    expect(err).to.be.null;
                    body = JSON.parse(body);
                    logger.info(response.statusCode);
                    logger.info(JSON.stringify(body, null, '    '));
                    logger.info(response.headers);
                    expect(response.statusCode).to.be.equal(200);
                    done();
                });
        });

        it('/v1/proxy/tvmaze/shows/4189 GET', function (done) {
            request({
                    method: 'GET',
                    headers: headersAdminJson,
                    url: BASE_URL + '/v1/proxy/tvmaze/shows/4189',
                },
                function (err, response, body) {
                    expect(err).to.be.null;
                    body = JSON.parse(body);
                    logger.info(response.statusCode);
                    logger.info(JSON.stringify(body, null, '    '));
                    logger.info(response.headers);
                    expect(response.statusCode).to.be.equal(200);
                    done();
                });
        });

        // /v1/proxy/tvmaze/episodes/1251059
        it('/v1/proxy/tvmaze/episodes/1251059 GET', function (done) {
            request({
                    method: 'GET',
                    headers: headersAdminJson,
                    url: BASE_URL + '/v1/proxy/tvmaze/episodes/1251059',
                },
                function (err, response, body) {
                    expect(err).to.be.null;
                    body = JSON.parse(body);

                    logger.info(response.statusCode);
                    logger.info(JSON.stringify(body, null, '    '));
                    logger.info(response.headers);
                    expect(response.statusCode).to.be.equal(200);
                    expect(body).to.be.deep.equal({
                        "id": 1251059,
                        "url": "http://www.tvmaze.com/episodes/1251059/general-hospital-55x79-ep-13857",
                        "name": "Ep. #13857 stubbed",
                        "season": 55,
                        "number": 79,
                        "airdate": "2017-07-26",
                        "airtime": "14:00",
                        "airstamp": "2017-07-26T18:00:00+00:00",
                        "runtime": 60,
                        "image": null,
                        "summary": null,
                        "_links": {
                            "self": {
                                "href": "http://api.tvmaze.com/episodes/1251059"
                            }
                        }
                    })
                    done();
                });
        });


        it('/v1/proxy/tvmaze/episodes/4189 GET', function (done) {
            request({
                    method: 'GET',
                    headers: headersAdminJson,
                    url: BASE_URL + '/v1/proxy/tvmaze/episodes/4189',
                },
                function (err, response, body) {
                    expect(err).to.be.null;
                    logger.info(response.statusCode);
                    logger.info(body);
                    logger.info(response.headers);
                    expect(response.statusCode).to.be.equal(200);
                    done();
                });
        });

    });


    let genNextEpisode = {
        "id": 1251059,
        "url": "http://www.tvmaze.com/episodes/1251059/general-hospital-55x79-ep-13857",
        "name": "Ep. #13857 stubbed",
        "season": 55,
        "number": 79,
        "airdate": "2017-07-26",
        "airtime": "14:00",
        "airstamp": "2017-07-26T18:00:00+00:00",
        "runtime": 60,
        "image": null,
        "summary": null,
        "_links": {
            "self": {
                "href": "http://api.tvmaze.com/episodes/1251059"
            }
        }
    };
    describe('get notification on general hospital episode 1251059', function() {

        let startMoment = moment('2017-07-25').startOf('day');

        it('/v1/faketimer POST', function (done) {
            request({
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json'
                    },
                    url: BASE_URL + '/v1/faketimer',
                    body: JSON.stringify({
                        timestamp: parseInt(startMoment.format('x'))
                    })
                },
                function (err, response, body) {
                    expect(err).to.be.null;
                    logger.info(response.statusCode);
                    logger.info(body);
                    logger.info(response.headers);
                    expect(response.statusCode).to.be.equal(200);
                    done();
                });
        });

        it('/v1/faketimer/increment POST', function (done) {
            request({
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json'
                    },
                    url: BASE_URL + '/v1/faketimer/increment',
                    body: JSON.stringify({
                        seconds: 60*60, //do a one hour loop
                        // seconds: 60*60*24 //go through one entire day
                    })
                },
                function (err, response, body) {
                    expect(err).to.be.null;
                    logger.info(response.statusCode);
                    logger.info(body);
                    logger.info(response.headers);
                    expect(response.statusCode).to.be.equal(200);
                    done();
                });
        });

        let socketurl = 'http://localhost:3000/v3/users/me/notifications';
        socketurl = 'http://localhost:3000/v1/todos';

        it('wait for tv notification task to complete', function(done)
        {
            let socket = require('socket.io-client')(socketurl, {
                extraHeaders: {
                    Cookie: cookie
                }
            });

            socket.on('notification', function (data) {
                console.log(data);
                var data = JSON.parse(data);
                expect(data.message).to.be
                    .equal('A new episode of General Hospital stubbed comes out on July 26th!');
                expect(data.type).to.be.equal('tvshow_airdate');

                socket.close();
                done();
            });

            // this.timeout(10000);
            // setTimeout(function() {
            //     done();
            // },2000)
        });

        it('/v1/faketimer/clear POST', function (done) {
            request({
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json'
                    },
                    url: BASE_URL + '/v1/faketimer/clear'
                },
                function (err, response, body) {
                    expect(err).to.be.null;
                    logger.info(response.statusCode);
                    logger.info(body);
                    logger.info(response.headers);
                    expect(response.statusCode).to.be.equal(200);
                    done();
                });
        });


        it('/v3/users/me/notifications GET', function (done) {
            console.log(headersAdminJson);
            request({
                    method: 'GET',
                    headers: headersAdminJson,
                    url: BASE_URL + '/v3/users/me/notifications'
                },
                function (err, response, body) {
                    expect(err).to.be.null;
                    logger.info(response.statusCode);
                    logger.info(body);
                    logger.info(response.headers);
                    expect(response.statusCode).to.be.equal(200);

                    body = JSON.parse(body);

                    expect(body).to.be.an('array');
                    expect(body.length).to.be.equal(1);
                    expect(body[0].message).to.be.equal("A new episode of General Hospital stubbed comes out on July 26th!");

                    done();
                });
        });


    });


    describe('clear faketimer', function() {
        let now = Date.now();

        it('/v1/faketimer/clear POST', function (done) {
            request({
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json'
                    },
                    url: BASE_URL + '/v1/faketimer/clear'
                },
                function (err, response, body) {
                    expect(err).to.be.null;
                    logger.info(response.statusCode);
                    logger.info(body);
                    logger.info(response.headers);
                    expect(response.statusCode).to.be.equal(200);
                    done();
                });
        });

        it('/v1/ping GET', function(done)
        {
            request({
                    method: 'GET',
                    headers: {
                        'content-type': 'application/json'
                    },
                    url: BASE_URL + '/v1/ping',
                    body: JSON.stringify({
                        test: 'test'
                    })
                },
                function (err, response, body) {
                    expect(err).to.be.null;
                    logger.info(response.statusCode);
                    logger.info(body);
                    logger.info(response.headers);
                    expect(response.statusCode).to.be.equal(200);

                    body = JSON.parse(body);

                    expect(body.server.now).not.to.be.lessThan(now);
                    done();
                });
        });
    })

    describe.skip('misc', function () {

        ///v1/proxy/tvmaze/episodes/1251058
        //view episode details
        it('/v1/proxy/tvmaze/episodes/4189 GET', function (done) {
            request({
                    method: 'GET',
                    headers: headersAdminJson,
                    url: BASE_URL + '/v1/proxy/tvmaze/episodes/4189',
                },
                function (err, response, body) {
                    expect(err).to.be.null;
                    logger.info(response.statusCode);
                    logger.info(body);
                    logger.info(response.headers);
                    expect(response.statusCode).to.be.equal(200);
                    done();
                });
        });

    })
});