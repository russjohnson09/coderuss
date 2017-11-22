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
        username : 'admin@foo.com',
        password: 'admin@foo.com'
    };

    describe('/v1/login', function() {
        it("successfully login with admin@foo.com:admin@foo.com", function(done) {
            request({
                method: "POST",
                json: {
                    "username": user.username,
                    "password": user.password
                },
                uri: BASE_URL + '/v1/login'
            }, function(error, response, body) {
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

    describe('address', function () {
        describe('/v1/users/me/address POST', function () {
            it("successfully login", function (done) {
                request({
                    method: "POST",
                    uri: BASE_URL + '/v1/users/me/address',
                    headers: {
                        Cookie: cookie,
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({name:'test address','address': 'test address',
                        'city': 'Detroit',
                    'state': 'MI'})
                }, function (error, response, body) {
                    console.log(body);
                    body = JSON.parse(body);
                    let data = body.data;
                    expect(error).to.be.equal(null);
                    expect(response.statusCode).to.equal(200);
                    expect(data.address).to.be.equal('test address');
                    expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
                    done();
                });
            });
        });

        let addressList = [];

        let fullAddresses;
        describe('/v1/users/me/address GET', function () {
            it("successfully login", function (done) {
                request({
                    method: "GET",
                    uri: BASE_URL + '/v1/users/me/address',
                    headers: {
                        Cookie: cookie
                    }
                }, function (error, response, body) {
                    console.log(body);

                    body = JSON.parse(body);

                    addressList = body.data;
                    expect(addressList.length).to.be.greaterThan(0);

                    let address = addressList[0];

                    expect(address.address).to.be.equal('test address');

                    fullAddresses = Object.assign({},addressList);

                    expect(error).to.be.equal(null);
                    expect(response.statusCode).to.equal(200);
                    expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
                    done();
                });
            });
        });

        let address1;
        describe('/v1/users/me/address/:id GET', function () {
            it("get address", function (done) {
                let address = addressList[0];
                request({
                    method: "GET",
                    uri: BASE_URL + '/v1/users/me/address/' + address._id + '?t=1',
                    headers: {
                        Cookie: cookie
                    }
                }, function (error, response, body) {
                    console.log(body);

                    body = JSON.parse(body);
                    let address = body.data;
                    address1 = address;
                    expect(address.address).to.be.equal('test address');

                    expect(error).to.be.equal(null);
                    expect(response.statusCode).to.equal(200);
                    expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
                    done();
                });
            });
        });


        describe('/v1/users/me/address/:id GET', function () {
            it("invalid id", function (done) {
                let address = addressList[0];
                request({
                    method: "GET",
                    uri: BASE_URL + '/v1/users/me/address/' + 1,
                    headers: {
                        Cookie: cookie
                    }
                }, function (error, response, body) {

                    body = JSON.parse(body);
                    expect(error).to.be.equal(null);
                    expect(response.statusCode).to.equal(400);
                    expect(body.meta.message).not.to.be.undefined;
                    expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
                    done();
                });
            });
        });


        describe('/v1/users/me/addresslist POST', function() {
            it("400 address_id is required", function (done) {
                expect(cookie).not.to.be.undefined;
                let bodyObj = {
                    name: 'test address',
                    address: 'test address',
                    city: 'Detroit',
                    state: 'MI'
                };
                let headers = {
                    cookie: cookie,
                    'content-type':  'application/json'
                };
                let requestOpts = {
                    method: "POST",
                    uri: BASE_URL + '/v1/users/me/addresslist',
                    headers: headers,
                    body: JSON.stringify(bodyObj)
                };

                request(requestOpts, function (error, response, body) {
                    console.log(body);

                    body = JSON.parse(body);



                    expect(error).to.be.equal(null);
                    expect(response.statusCode).to.equal(400);
                    expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');

                    done();
                });
            });
        });

        describe('/v1/users/me/addresslist POST', function() {
            it("create addresslist with address_id [] for me", function (done) {
                expect(cookie).not.to.be.undefined;
                let bodyObj = {
                    name: 'test address',
                    address: 'test address',
                    city: 'Detroit',
                    state: 'MI',
                    address_id: []
                };
                let headers = {
                    cookie: cookie,
                    'content-type':  'application/json'
                };
                let requestOpts = {
                    method: "POST",
                    uri: BASE_URL + '/v1/users/me/addresslist',
                    headers: headers,
                    body: JSON.stringify(bodyObj)
                };

                request(requestOpts, function (error, response, body) {
                    console.log(body);

                    body = JSON.parse(body);



                    expect(error).to.be.equal(null);
                    expect(response.statusCode).to.equal(200);
                    expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');

                    addressList = body.data;
                    expect(addressList).not.to.be.undefined;

                    done();
                });
            });

            it("create addresslist with address_id [null] for me", function (done) {
                expect(cookie).not.to.be.undefined;
                let bodyObj = {
                    name: 'address list 2',
                    address_id: [null]
                };
                let headers = {
                    cookie: cookie,
                    'content-type':  'application/json'
                };
                let requestOpts = {
                    method: "POST",
                    uri: BASE_URL + '/v1/users/me/addresslist',
                    headers: headers,
                    body: JSON.stringify(bodyObj)
                };

                request(requestOpts, function (error, response, body) {
                    console.log(body);

                    body = JSON.parse(body);

                    expect(error).to.be.equal(null);
                    expect(response.statusCode).to.equal(400);
                    expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
                    done();
                });
            });


            it("create addresslist with address_id [:address1._id] for me", function (done) {
                expect(cookie).not.to.be.undefined;
                expect(address1).not.to.be.undefined;
                expect(address1._id).to.be.a('string');
                let bodyObj = {
                    name: 'address list 2',
                    address_id: [address1._id]
                };
                let headers = {
                    cookie: cookie,
                    'content-type':  'application/json'
                };
                let requestOpts = {
                    method: "POST",
                    uri: BASE_URL + '/v1/users/me/addresslist',
                    headers: headers,
                    body: JSON.stringify(bodyObj)
                };

                request(requestOpts, function (error, response, body) {
                    console.log(body);

                    body = JSON.parse(body);



                    expect(error).to.be.equal(null);
                    expect(response.statusCode).to.equal(200);
                    expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');

                    addressList = body.data;
                    expect(addressList).not.to.be.undefined;

                    done();
                });
            });

            //full address list
            it("create addresslist with address_id [:address1._id,:address2_id] for me", function (done) {
                expect(cookie).not.to.be.undefined;
                expect(address1).not.to.be.undefined;
                expect(address1._id).to.be.a('string');
                let address_id = (function() {
                    let result = [];
                    for (let i in fullAddresses) {
                        result.push(fullAddresses[i]._id);
                    }
                    return result;
                })();

                console.log(address_id,fullAddresses);
                expect(address_id).length.to.be.greaterThan(0);

                let bodyObj = {
                    name: 'address list full',
                    address_id: address_id
                };
                let headers = {
                    cookie: cookie,
                    'content-type':  'application/json'
                };
                let requestOpts = {
                    method: "POST",
                    uri: BASE_URL + '/v1/users/me/addresslist',
                    headers: headers,
                    body: JSON.stringify(bodyObj)
                };

                request(requestOpts, function (error, response, body) {
                    console.log(body);

                    body = JSON.parse(body);



                    expect(error).to.be.equal(null);
                    expect(response.statusCode).to.equal(200);
                    expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');

                    addressList = body.data;
                    expect(addressList).not.to.be.undefined;

                    done();
                });
            });
        });


        let addressList1;
        describe('/v1/users/me/addresslist GET', function() {
            it("get addresslist for me", function (done) {
                expect(cookie).not.to.be.undefined;
                request({
                    method: "GET",
                    uri: BASE_URL + '/v1/users/me/addresslist',
                    headers: {
                        Cookie: cookie
                    }
                }, function (error, response, body) {
                    console.log(body);

                    body = JSON.parse(body);

                    let addressLists = body.data;
                    expect(addressLists.length).to.be.greaterThan(1);

                    addressList1 = addressLists[0];

                    expect(error).to.be.equal(null);
                    expect(response.statusCode).to.equal(200);
                    expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
                    done();
                });
            });
        });

        describe('/v1/users/me/addresslist/:id GET', function() {
            it("get addresslist for me", function (done) {
                expect(cookie).not.to.be.undefined;
                request({
                    method: "GET",
                    uri: BASE_URL + '/v1/users/me/addresslist/' + addressList1._id,
                    headers: {
                        Cookie: cookie
                    }
                }, function (error, response, body) {
                    console.log(body);

                    body = JSON.parse(body);

                    let addressList = body.data;

                    expect(addressList1._id).to.be.equal(addressList._id);

                    expect(error).to.be.equal(null);
                    expect(response.statusCode).to.equal(200);
                    expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
                    done();
                });
            });
        });

        return;


        //login for user with no address
        describe('user missing address', function () {


            describe('/v1/login', function () {
                it("successfully login with noaddress@foo.com:admin@foo.com", function (done) {
                    request({
                        method: "POST",
                        json: {
                            "username": 'adminnoaddress',
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

            describe('/v1/users/me/address GET', function () {
                it("get me address", function (done) {
                    expect(cookie).not.to.be.undefined;
                    request({
                        method: "GET",
                        uri: BASE_URL + '/v1/users/me/address',
                        headers: {
                            Cookie: cookie
                        }
                    }, function (error, response, body) {
                        console.log(body);

                        body = JSON.parse(body);

                        addressList = body.data;
                        expect(addressList.length).to.be.lessThan(1);

                        expect(error).to.be.equal(null);
                        expect(response.statusCode).to.equal(200);
                        expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
                        done();
                    });
                });
            });


            describe('/v1/users/me/addresslist GET', function () {
                it("get addresslist for me", function (done) {
                    expect(cookie).not.to.be.undefined;
                    request({
                        method: "GET",
                        uri: BASE_URL + '/v1/users/me/addresslist',
                        headers: {
                            Cookie: cookie
                        }
                    }, function (error, response, body) {
                        console.log(body);

                        body = JSON.parse(body);

                        addressList = body.data;
                        expect(addressList.length).to.be.lessThan(1);

                        expect(error).to.be.equal(null);
                        expect(response.statusCode).to.equal(200);
                        expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
                        done();
                    });
                });
            });

        })

    });





});