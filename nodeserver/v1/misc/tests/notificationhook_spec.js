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


    let user_profile = {};


    let defaultQueueItem = {};


    let notificationHookId;
    describe('create a notification hook', function () {
        it("/v1/notificationhook POST", function (done) {
            request({
                method: "POST",
                uri: BASE_URL + '/v1/notificationhook',
                body: JSON.stringify({}),
                headers: {
                    Cookie: cookie,
                    'content-type': 'application/json'
                },
            }, function (error, response, body) {
                console.log(body);
                expect(error).to.be.equal(null);
                expect(response.statusCode).to.equal(200);

                body = JSON.parse(body);
                expect(body._id).to.be.a('string');
                notificationHookId = body._id;
                done();
            });
        });
    });

    describe('/v1/notificationhook GET', function () {
        it("/v1/notificationhook GET", function (done) {
            request({
                method: "GET",
                uri: BASE_URL + '/v1/notificationhook',
                headers: {
                    Cookie: cookie,
                    'content-type': 'application/json'
                },
            }, function (error, response, body) {
                console.log(body);
                expect(error).to.be.equal(null);
                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    });


    describe('/v1/notificationhook/:id/notify POST', function () {
        it("/v1/notificationhook/:id/notify POST", function (done) {
            request({
                method: "POST",
                uri: BASE_URL + '/v1/notificationhook/' + notificationHookId + '/notify',
                body: JSON.stringify({
                    'message': 'hello'
                }),
                headers: {
                    Cookie: cookie,
                    'content-type': 'application/json'
                },
            }, function (error, response, body) {
                console.log(body);
                expect(error).to.be.equal(null);
                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    });


});