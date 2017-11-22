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

    describe('addresses', function () {
        describe('/v1/users/me/addresses POST', function () {
            it("successfully login", function (done) {
                request({
                    method: "POST",
                    uri: BASE_URL + '/v1/users/me/addresses',
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

                    expect(body.address).to.be.equal('test address');
                    expect(error).to.be.equal(null);
                    expect(response.statusCode).to.equal(200);
                    expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
                    done();
                });
            });
        });

        let addressList = [];

        describe('/v1/users/me/addresses GET', function () {
            it("successfully login", function (done) {
                request({
                    method: "GET",
                    uri: BASE_URL + '/v1/users/me/addresses',
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

                    expect(error).to.be.equal(null);
                    expect(response.statusCode).to.equal(200);
                    expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
                    done();
                });
            });
        });

        describe.skip('/v1/users/me/addresses/:id GET', function () {
            it("get address", function (done) {
                let address = addressList[0];
                request({
                    method: "GET",
                    uri: BASE_URL + '/v1/users/me/addresses/' + address._id,
                    headers: {
                        Cookie: cookie
                    }
                }, function (error, response, body) {
                    console.log(body);

                    body = JSON.parse(body);
                    expect(body.address).to.be.equal('test address');

                    expect(error).to.be.equal(null);
                    expect(response.statusCode).to.equal(200);
                    expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
                    done();
                });
            });
        });


        describe('/v1/login', function() {
            it("successfully login with noaddress@foo.com:admin@foo.com", function(done) {
                request({
                    method: "POST",
                    json: {
                        "username": 'adminnoaddress',
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

        describe('/v1/users/me/addresses GET', function () {
            it("successfully login", function (done) {
                expect(cookie).not.to.be.undefined;
                request({
                    method: "GET",
                    uri: BASE_URL + '/v1/users/me/addresses',
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