var request = require('request');
var expect = require("chai").expect;
const winston = require('winston');
const path = require('path');
const fs = require('fs');
const moment = require('moment-timezone');

const PORT = 3000;

const BASE_URL = "http://localhost:" + PORT;


//TODO add to other user funds
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


    let user_profile = {};
    //GET USER_PROFILE with their amount
    describe('/v1/users/me GET', function() {
        it("/v1/users/me GET", function (done) {
            request({
                method: "GET",
                uri: BASE_URL + '/v1/users/me',
                headers: {
                    Cookie: cookie,
                    'content-type': 'application/json'
                },
            }, function (error, response, body) {
                console.log(body);
                expect(error).to.be.equal(null);
                expect(response.statusCode).to.equal(200);

                user_profile = JSON.parse(body);
                expect(user_profile.amount).not.to.be.undefined;
                done();
            });
        });

    });

    describe('transaction', function () {


        describe('/v1/admin/transaction POST', function () {
            describe('bring user amount to 0', function () {
                it("object tags", function (done) {
                    let amount =  -user_profile.amount;
                    let description = 'bring user amount to 0';
                    let bodyObj = {
                        'amount': amount,
                        'description': description,
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


                        expect(error).to.be.equal(null);
                        expect(response.statusCode).to.equal(200);
                        expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');

                        body = JSON.parse(body);
                        expect(body.data.amount).to.be.equal(amount);
                        expect(body.data.description).to.be.equal(description);


                        done();
                    })
                });


            });

            describe('+100', function () {
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

            let amounts = [-50,-50];
            for(let i in amounts) {
                let amount = amounts[i];
                describe('create transaction', function () {
                    it("object tags", function (done) {
                        let bodyObj = {
                            'amount': amount,
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

            }

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

            describe('by default amount for the user cannot dip bellow 0', function () {
                it("-1", function (done) {
                    let bodyObj = {
                        'amount': '-1',
                        'description': 'not processed',
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
                        expect(response.statusCode).to.equal(400);
                        expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
                        done();
                    })
                });


            });


            describe('create transaction', function () {
                it("object tags", function (done) {
                    let bodyObj = {
                        'amount': '1',
                        'description': 'create 1 dollar',
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