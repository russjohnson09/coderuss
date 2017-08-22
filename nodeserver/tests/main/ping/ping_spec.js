var request = require('request');
var expect = require("chai").expect;

const CONSOLE_LOG_LEVEL = process.env.CONSOLE_LOG_LEVEL || 'info';

var FormData = require('form-data');

const http = require('http');
const winston = require('winston');
const BASE_URL = 'http://localhost:3000';

winston.loggers.add('testlogger', {
    transports: [
        new (winston.transports.Console)({
            level: CONSOLE_LOG_LEVEL
        }),
    ]
});

var logger = winston.loggers.get('testlogger');


describe("API", function () {

    describe("Ping endpoint tests", function () {

        var url = "http://localhost:3000/v1/ping";
        it("returns status 200", function (done) {
            request(url, function (error, response, body) {
                logger.info(body);
                expect(response.statusCode).to.equal(200);
                done();
            });
        });

        it("returns has success in response body", function (done) {
            request(url, function (error, response, body) {
                expect(JSON.parse(response.body).status).to.equal('success');
                done();
            });
        });

        describe('/v1 ping POST', function () {
            it("returns status 200", function (done) {
                request({
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json'
                        },
                        url: url,
                        body: JSON.stringify({
                            test: 'test'
                        })
                    },
                    function (err, response, body) {
                        expect(err).to.be.null;
                        logger.info(response.statusCode);
                        logger.info(body);
                        logger.info(response.headers);
                        expect(response.statusCode).to.be.equal(201);
                        done();
                    });
            });
        });

        describe('get server time', function () {
            it('/v1/faketimer POST', function (done) {
                request({
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json'
                        },
                        url: BASE_URL + '/v1/faketimer',
                        body: JSON.stringify({
                            timestamp: 1503355342482
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

                        expect(body.server.now).to.be.equal(1503355342482);
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
                            seconds: 1
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

                        expect(body.server.now).to.be.equal(1503355342482 + (1*1000));
                        done();
                    });
            });


            let now = Date.now();

            it('/v1/faketimer/clear POST', function (done) {
                request({
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json'
                        },
                        url: BASE_URL + '/v1/faketimer/clear',
                        body: JSON.stringify({
                            seconds: 1
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

    });

});
