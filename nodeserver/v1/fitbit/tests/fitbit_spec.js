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

    describe('/v1/login', function() {
        it("successfully login with admin@foo.com:admin@foo.com", function(done) {
            username = 'admin@foo.com';
            request({
                method: "POST",
                json: {
                    "username": username,
                    "password": "admin@foo.com"
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

    describe('fitbit', function () {
        describe('/v1/fitbit as admin', function () {
            it("successfully login", function (done) {
                request({
                    method: "GET",
                    uri: BASE_URL + '/v1/fitbit',
                    headers: {
                        Cookie: cookie
                    }
                }, function (error, response, body) {
                    expect(error).to.be.equal(null);
                    expect(response.statusCode).to.equal(200);
                    expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
                    done();
                });
            });
        });
    })


});