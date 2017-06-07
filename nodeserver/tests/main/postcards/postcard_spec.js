var request = require('request');
var expect = require("chai").expect;
const winston = require('winston');

const path = require('path');
const fs = require('fs');

var test_globals = {};

const PORT = 3000;

const BASE_URL = "http://localhost:" + PORT;


const CONSOLE_LOG_LEVEL = process.env.CONSOLE_LOG_LEVEL || 'info';

var FormData = require('form-data');

const http = require('http');




winston.loggers.add('testlogger', {
    transports: [
        new(winston.transports.Console)({
            level: CONSOLE_LOG_LEVEL
        }),
    ]
});

var logger = winston.loggers.get('testlogger');

describe("fax", function() {

    describe("/v1/postcards/send/test POST 403", function() {
        it("/v1/postcards/send/test POST returns status 403", function() {
            return new Promise(function(resolve) {
                var url = BASE_URL + "/v1/postcards/send/test"
                var req = request.post({
                        url: url,
                    },
                    function(err, response, body) {
                        expect(err).to.be.null;
                        logger.info(response.statusCode);
                        logger.info(body);
                        logger.info(response.headers);
                        expect(response.statusCode).to.be.equal(403);
                        resolve();
                    });
            });
        });
    });


    describe('/v1/login', function() {
        var username = "admin@foo.com";
        var password = "admin@foo.com";
        it("successfully login", function(done) {
            request({
                method: "POST",
                json: {
                    "username": username,
                    "password": password
                },
                uri: BASE_URL + '/v1/login'
            }, function(error, response, body) {
                expect(error).to.be.equal(null);
                expect(response.statusCode).to.equal(201);
                expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
                expect(response.headers['set-cookie']).not.to.be.undefined;
                cookie = response.headers['set-cookie'];
                done();
            });
        });
    });

    describe("/v1/postcards/send/test POST", function() {

        it("/v1/postcards/send/test POST returns status 200", function() {
            return new Promise(function(resolve) {
                var url = BASE_URL + "/v1/postcards/send/test"
                var req = request.post({
                        url: url,
                        headers: {
                            'Cookie': cookie
                        }
                    },
                    function(err, response, body) {
                        expect(err).to.be.null;
                        logger.info(response.statusCode);
                        logger.info(body);
                        logger.info(response.headers);
                        expect(response.statusCode).to.be.equal(200);
                        resolve();
                    });
            });
        });

    });

});
