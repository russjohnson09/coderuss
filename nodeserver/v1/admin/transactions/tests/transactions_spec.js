var request = require('request');
var expect = require("chai").expect;
const winston = require('winston');
const path = require('path');
const fs = require('fs');
const moment = require('moment-timezone');

const PORT = 3000;

const BASE_URL = "http://localhost:" + PORT;

describe(path.basename(__dirname), function () {

    let headers = {};

    let user = {
        username: 'admin@foo.com',
        password: 'admin@foo.com'
    };

    describe('/v1/login', function () {
        it("successfully login with admin@foo.com:admin@foo.com", function (done) {
            request({
                method: "POST",
                json: {
                    "username": user.username,
                    "password": user.password
                },
                uri: BASE_URL + '/v1/login'
            }, function (error, response, body) {
                console.log(body);
                expect(error).to.be.equal(null);
                expect(response.statusCode).to.equal(201);
                expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
                expect(response.headers['set-cookie']).not.to.be.undefined;
                cookie = response.headers['set-cookie'];
                done();
            });
        });
    });

    describe('transaction', function () {

        //transaction amount is in cents or the lowest divisble denomination for other countries if available
        describe('/v1/admin/transaction POST', function () {
            describe('create transaction', function () {
                it("object tags", function (done) {
                    let bodyObj = {
                        'amount': '100',
                        'description': 'description',
                    };

                    request({
                        method: "POST",
                        uri: BASE_URL + '/v1/admin/transaction',
                        headers: {
                            Cookie: cookie,
                            'content-type': 'application/json'
                        },
                        body: JSON.stringify(bodyObj)
                    }, function (error, response, body) {
                        console.log(body, response.statusCode);

                        body = JSON.stringify(body);
                        expect(error).to.be.equal(null);
                        expect(response.statusCode).to.equal(200);
                        expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
                        done();
                    })
                });


            });

            describe('create transaction', function () {
                it("object tags", function (done) {
                    let bodyObj = {
                        'amount': '-100',
                        'description': 'description',
                    };

                    request({
                        method: "POST",
                        uri: BASE_URL + '/v1/admin/transaction',
                        headers: {
                            Cookie: cookie,
                            'content-type': 'application/json'
                        },
                        body: JSON.stringify(bodyObj)
                    }, function (error, response, body) {
                        console.log(body, response.statusCode);

                        body = JSON.stringify(body);
                        expect(error).to.be.equal(null);
                        expect(response.statusCode).to.equal(200);
                        expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
                        done();
                    })
                });


            });

            describe('create transaction', function () {
                it("object tags", function (done) {
                    let bodyObj = {
                        'amount': '-100.1234',
                        'description': 'description',
                    };

                    request({
                        method: "POST",
                        uri: BASE_URL + '/v1/admin/transaction',
                        headers: {
                            Cookie: cookie,
                            'content-type': 'application/json'
                        },
                        body: JSON.stringify(bodyObj)
                    }, function (error, response, body) {
                        console.log(body, response.statusCode);

                        body = JSON.stringify(body);
                        expect(error).to.be.equal(null);
                        expect(response.statusCode).to.equal(200);
                        expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
                        done();
                    })
                });


            });

        });


        describe('/v1/admin/transaction GET', function () {
            it('get transactions', function (done) {
                request({
                    method: "GET",
                    uri: BASE_URL + '/v1/admin/transaction',
                    headers: {
                        Cookie: cookie,
                        'content-type': 'application/json'
                    },
                }, function (error, response, body) {
                    console.log(body, response.statusCode);
                    body = JSON.stringify(body);
                    expect(error).to.be.equal(null);
                    expect(response.statusCode).to.equal(200);
                    expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
                    done();
                })
            });
        });



        describe.skip('/v1/admin/transaction/sum GET', function () {
            it('get transactions', function (done) {
                request({
                    method: "GET",
                    uri: BASE_URL + '/v1/admin/transaction/sum',
                    headers: {
                        Cookie: cookie,
                        'content-type': 'application/json'
                    },
                }, function (error, response, body) {
                    console.log(body, response.statusCode);
                    body = JSON.stringify(body);
                    expect(error).to.be.equal(null);
                    expect(response.statusCode).to.equal(200);
                    expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
                    done();
                })
            });
        });

    });


});