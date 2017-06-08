var request = require('request');
var expect = require("chai").expect;
const winston = require('winston');
const path = require('path');
const fs = require('fs');

var test_globals = {};

const PORT = 3000;

const BASE_URL = "http://localhost:" + PORT;


const CONSOLE_LOG_LEVEL = process.env.CONSOLE_LOG_LEVEL || 'info';
var admin_username = process.env.MAIN_ADMIN_USERNAME || 'admin@foo.com';

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

describe(path.basename(__dirname), function() {

    //429 response no funds

    var headersNotAdmin;
    describe('/v1/login as notadmin', function() {
        var username = 'notadmin@foo.com';
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
                headersNotAdmin = {
                    'Cookie': cookie
                }
                headersNotAdminJson = {
                    'Cookie': cookie,
                    'content-type': 'application/json'
                }
                done();
            });
        });
    });

    var userIdNotAdmin;
    describe('/v1/users/me as notadmin', function() {
        it("/v1/users/me as notadmin", function(done) {
            request({
                method: "GET",
                headers: headersNotAdmin,
                uri: BASE_URL + '/v1/users/me'
            }, function(error, response, body) {
                expect(error).to.be.equal(null);
                expect(response.statusCode).to.equal(200);

                body = JSON.parse(body);

                logger.info(JSON.stringify(body, null, '    '))

                expect(body._id).to.be.a('String');

                userIdNotAdmin = body._id;
                done();
            });
        });
    });

    describe('get nonadmin by id', function() {
        it("/v1/:id GET returns status 401 for non admin user", function() {
            return new Promise(function(resolve) {
                var url = BASE_URL + "/v1/users/" + userIdNotAdmin
                var req = request({
                        method: 'GET',
                        headers: headersNotAdmin,
                        url: url,
                    },
                    function(err, response, body) {
                        expect(err).to.be.null;
                        logger.info(response.statusCode);
                        logger.info(body);
                        logger.info(response.headers);
                        expect(response.statusCode).to.be.equal(401);
                        resolve();
                    });
            });
        });

    });


    describe('check isadmin', function() {
        it('/v1/ping/isadmin', function(done) {
            request({
                method: "GET",
                uri: BASE_URL + '/v1/ping/isadmin',
                headers: {
                    'Cookie': cookie
                }
            }, function(error, response, body) {
                expect(error).to.be.null;
                expect(response.statusCode).to.equal(401);
                body = JSON.parse(body);
                logger.info(JSON.stringify(body, null, '    '))
                expect(body).to.have.all.keys(['message', 'status'
                    // ,'meta'
                ]);;
                done();
            });
        })
    });

    var headersAdmin;
    var headersAdminJson;
    describe('/v1/login as admin', function() {
        var username = admin_username;
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

                headersAdmin = {
                    'Cookie': cookie
                };

                headersAdminJson = {
                    'Cookie': cookie,
                    'Content-Type': 'application/json'
                };
                done();
            });
        });
    });

    describe('check isadmin', function() {
        it('/v1/ping/isadmin', function(done) {
            request({
                method: "GET",
                uri: BASE_URL + '/v1/ping/isadmin',
                headers: headersAdmin
            }, function(error, response, body) {
                expect(error).to.be.null;
                expect(response.statusCode).to.equal(200);
                body = JSON.parse(body);
                expect(body).to.have.all.keys(['status', 'meta']);;
                done();
            });
        });
    });

    describe('get nonadmin by id', function() {
        it("/v1/:id GET returns status 200", function() {
            return new Promise(function(resolve) {
                var url = BASE_URL + "/v1/users/" + userIdNotAdmin
                var req = request({
                        method: 'GET',
                        headers: headersAdmin,
                        url: url,
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

    describe('increase nonadmin funds', function() {
        it("/v1/:id/inc POST returns status 400", function() {
            return new Promise(function(resolve) {
                var url = BASE_URL + "/v1/users/" + userIdNotAdmin + '/inc'
                var req = request({
                        method: 'POST',
                        headers: headersAdmin,
                        url: url,
                    },
                    function(err, response, body) {
                        expect(err).to.be.null;
                        logger.info(response.statusCode);
                        logger.info(body);
                        logger.info(response.headers);
                        expect(response.statusCode).to.be.equal(400);
                        resolve();
                    });
            });
        });

        it("/v1/:id/inc POST returns status 201", function() {
            return new Promise(function(resolve) {
                var url = BASE_URL + "/v1/users/" + userIdNotAdmin + '/inc'
                var req = request({
                        method: 'POST',
                        headers: headersAdminJson,
                        url: url,
                        body: JSON.stringify({
                            inc: 1000
                        })
                    },
                    function(err, response, body) {
                        expect(err).to.be.null;
                        logger.info(response.statusCode);
                        logger.info(body);
                        logger.info(response.headers);
                        expect(response.statusCode).to.be.equal(201);
                        resolve();
                    });
            });
        });

        it("/v1/:id/inc POST returns status 201", function() {
            return new Promise(function(resolve) {
                var url = BASE_URL + "/v1/users/" + userIdNotAdmin + '/inc'
                var req = request({
                        method: 'POST',
                        headers: headersNotAdmin,
                        url: url,
                        body: JSON.stringify({
                            inc: 1000
                        })
                    },
                    function(err, response, body) {
                        expect(err).to.be.null;
                        logger.info(response.statusCode);
                        logger.info(body);
                        logger.info(response.headers);
                        expect(response.statusCode).to.be.equal(401); //nonadmin cannot increase funds
                        resolve();
                    });
            });
        });

    });

    var nonAdminFunds;
    describe('get nonadmin funds', function() {
        it("/v1/:id GET returns status 200", function() {
            return new Promise(function(resolve) {
                var url = BASE_URL + "/v1/users/" + userIdNotAdmin
                var req = request({
                        method: 'GET',
                        headers: headersAdmin,
                        url: url,
                    },
                    function(err, response, body) {
                        expect(err).to.be.null;
                        logger.info(response.statusCode);
                        logger.info(body);
                        logger.info(response.headers);
                        expect(response.statusCode).to.be.equal(200);

                        body = JSON.parse(body);

                        expect(body.dollars_available).to.be.a('Number');
                        nonAdminFunds = body.dollars_available;
                        resolve();
                    });
            });
        });

    });


    describe('descrease nonadmin funds', function() {
        it("/v1/:id/dec POST returns status 400", function() {
            return new Promise(function(resolve) {
                var url = BASE_URL + "/v1/users/" + userIdNotAdmin + '/dec'
                var req = request({
                        method: 'POST',
                        headers: headersAdmin,
                        url: url,
                    },
                    function(err, response, body) {
                        expect(err).to.be.null;
                        logger.info(response.statusCode);
                        logger.info(body);
                        logger.info(response.headers);
                        expect(response.statusCode).to.be.equal(400);
                        resolve();
                    });
            });
        });


        it("/v1/:id/dec POST returns status 201", function() {
            return new Promise(function(resolve) {
                var url = BASE_URL + "/v1/users/" + userIdNotAdmin + '/dec'
                var req = request({
                        method: 'POST',
                        headers: headersAdminJson,
                        url: url,
                        body: JSON.stringify({
                            dec: nonAdminFunds
                        })
                    },
                    function(err, response, body) {
                        expect(err).to.be.null;
                        logger.info(response.statusCode);
                        logger.info(body);
                        logger.info(response.headers);
                        expect(response.statusCode).to.be.equal(201);
                        resolve();
                    });
            });
        });

    });


    describe('descrease nonadmin funds', function() {
        it("/v1/:id/dec POST returns status 400", function() {
            return new Promise(function(resolve) {
                var url = BASE_URL + "/v1/users/" + userIdNotAdmin + '/dec'
                var req = request({
                        method: 'POST',
                        headers: headersAdmin,
                        url: url,
                    },
                    function(err, response, body) {
                        expect(err).to.be.null;
                        logger.info(response.statusCode);
                        logger.info(body);
                        logger.info(response.headers);
                        expect(response.statusCode).to.be.equal(400);
                        resolve();
                    });
            });
        });


        it("/v1/:id/dec POST returns status 429 no funds to decrease", function() {
            return new Promise(function(resolve) {
                var url = BASE_URL + "/v1/users/" + userIdNotAdmin + '/dec'
                var req = request({
                        method: 'POST',
                        headers: headersAdminJson,
                        url: url,
                        body: JSON.stringify({
                            dec: 1
                        })
                    },
                    function(err, response, body) {
                        expect(err).to.be.null;
                        logger.info(response.statusCode);
                        logger.info(body);
                        logger.info(response.headers);
                        expect(response.statusCode).to.be.equal(429);
                        resolve();
                    });
            });
        });

    });


    describe("/v1/postcards POST 429 response no funds", function() {
        it("/v1/postcards POST returns status 429 response no funds", function() {
            return new Promise(function(resolve) {
                var url = BASE_URL + "/v1/postcards"
                var req = request({
                        method: 'POST',
                        headers: headersNotAdminJson,
                        form: {
                            description: 'Demo Postcard job',
                            to: {
                                name: 'Joe Smith',
                                address_line1: '123 Main Street',
                                address_city: 'Mountain View',
                                address_state: 'CA',
                                address_zip: '94041'
                            },
                            from: {
                                name: 'Joe Smith',
                                address_line1: '123 Main Street',
                                address_city: 'Mountain View',
                                address_state: 'CA',
                                address_zip: '94041'
                            },
                            front: '<html style="padding: 1in; font-size: 50;">Front HTML for {{name}}</html>',
                            back: '<html style="padding: 1in; font-size: 20;">Back HTML for {{name}}</html>',
                            data: {
                                name: 'Harry'
                            }
                        },
                        url: url,
                    },
                    function(err, response, body) {
                        expect(err).to.be.null;
                        logger.info(response.statusCode);
                        logger.info(body);
                        logger.info(response.headers);
                        expect(response.statusCode).to.be.equal(429);
                        resolve();
                    });
            });
        });
    });


    describe('increase nonadmin funds', function() {
        it("/v1/:id/inc POST returns status 201", function() {
            return new Promise(function(resolve) {
                var url = BASE_URL + "/v1/users/" + userIdNotAdmin + '/inc'
                var req = request({
                        method: 'POST',
                        headers: headersAdminJson,
                        url: url,
                        body: JSON.stringify({
                            inc: 1000
                        })
                    },
                    function(err, response, body) {
                        expect(err).to.be.null;
                        logger.info(response.statusCode);
                        logger.info(body);
                        logger.info(response.headers);
                        expect(response.statusCode).to.be.equal(201);
                        resolve();
                    });
            });
        });
    });
    
        describe('get nonadmin funds', function() {
        it("/v1/:id GET returns status 200", function() {
            return new Promise(function(resolve) {
                var url = BASE_URL + "/v1/users/" + userIdNotAdmin
                var req = request({
                        method: 'GET',
                        headers: headersAdmin,
                        url: url,
                    },
                    function(err, response, body) {
                        expect(err).to.be.null;
                        logger.info(response.statusCode);
                        logger.info(body);
                        logger.info(response.headers);
                        expect(response.statusCode).to.be.equal(200);

                        body = JSON.parse(body);

                        expect(body.dollars_available).to.be.a('Number');
                        nonAdminFunds = body.dollars_available;
                        
                        expect(body.dollars_available).to.be.greaterThan(0);
                        resolve();
                    });
            });
        });

    });



    describe("/v1/postcards POST 200 response", function() {
        it("/v1/postcards POST 200 response", function() {
            return new Promise(function(resolve) {
                var url = BASE_URL + "/v1/postcards"
                var req = request({
                        method: 'POST',
                        headers: headersNotAdminJson,
                        form: {
                            description: 'Demo Postcard job',
                            to: {
                                name: 'Joe Smith',
                                address_line1: '123 Main Street',
                                address_city: 'Mountain View',
                                address_state: 'CA',
                                address_zip: '94041'
                            },
                            from: {
                                name: 'Joe Smith',
                                address_line1: '123 Main Street',
                                address_city: 'Mountain View',
                                address_state: 'CA',
                                address_zip: '94041'
                            },
                            front: '<html style="padding: 1in; font-size: 50;">Front HTML for {{name}}</html>',
                            back: '<html style="padding: 1in; font-size: 20;">Back HTML for {{name}}</html>',
                            data: {
                                name: 'Harry'
                            }
                        },
                        url: url,
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
