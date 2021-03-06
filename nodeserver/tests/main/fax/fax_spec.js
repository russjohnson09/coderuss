var request = require('request');
var expect = require("chai").expect;
const winston = require('winston');

const path = require('path');
const fs = require('fs');

var test_globals = {};

const PORT = 3000;

const BASE_URL = "http://localhost:" + PORT;


const TEST_FAX = process.env.TEST_FAX || '6082719000';


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

    describe("Temp file create and get", function() {

        it("/api/v1/files/tmp POST returns status 201", function() {
            return new Promise(function(resolve) {
                var url = BASE_URL + "/api/v1/files/tmp"
                var formData = {
                    file: fs.createReadStream(path.join(__dirname, '..', '..', '..', 'utils', 'fixtures', 'test1.txt'))
                };
                request.post({
                        url: url,
                        formData: formData
                    },
                    function(err, response, body) {
                        expect(err).to.be.null;
                        logger.info(response.statusCode);
                        resolve();
                    });
            });
        });

        it("/api/v1/files/tmp POST returns status 201", function() {
            return new Promise(function(resolve) {
                var url = BASE_URL + "/api/v1/files/tmp"
                var req = request.post({
                        url: url,
                    },
                    function(err, response, body) {
                        expect(err).to.be.null;
                        logger.info(response.statusCode);
                        resolve();
                    });
                var form = req.form();
                form.append('file', new Buffer('123'), {
                    filename: 'myfile.txt',
                    contentType: 'text/plain'
                });
            });
        });




        it("/v1/fax POST returns status 201", function() {
            return new Promise(function(resolve) {
                var url = BASE_URL + "/v1/fax"
                var req = request.post({
                        url: url,
                    },
                    function(err, response, body) {
                        expect(err).to.be.null;
                        logger.info(response.statusCode);
                        logger.info(body);
                        expect(response.statusCode).to.be.equal(201);
                        resolve();
                    });

                var form = req.form();
                req.headers['Cookie'] = cookie;

                form.append('file', new Buffer('123'), {
                    filename: 'myfile.txt',
                    // contentType: 'text/plain'
                });
                form.append('fax', TEST_FAX);
            });
        });

    });

});
