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



    let defaultQueueItem = {

    };

    let queueItem1 = {};
    describe('/v1/queueitem POST', function() {
        it("/v1/queueitem POST", function (done) {
            let queueItem = {
                "message": "Complete the task."
            };
            request({
                method: "POST",
                uri: BASE_URL + '/v1/queueitem',
                body: JSON.stringify(queueItem),
                headers: {
                    Cookie: cookie,
                    'content-type': 'application/json'
                },
            }, function (error, response, body) {
                console.log(body);
                expect(error).to.be.equal(null);
                expect(response.statusCode).to.equal(200);

                let data = JSON.parse(body);

                expect(data._id).to.be.a('String');

                queueItem1 = data;

                done();
            });
        });

    });

    describe('/v1/queueitem/:id GET', function() {
        it("/v1/queueitem/:id GET", function (done) {
            request({
                method: "GET",
                uri: BASE_URL + '/v1/queueitem/' + queueItem1._id,
                headers: {
                    Cookie: cookie,
                    'content-type': 'application/json'
                },
            }, function (error, response, body) {
                console.log(body);
                expect(error).to.be.equal(null);
                expect(response.statusCode).to.equal(200);

                let data = JSON.parse(body);

                expect(data._id).to.be.equal(queueItem1._id);

                done();
            });
        });

    });


    describe('/v1/queueitem/:id PUT', function() {
        it("/v1/queueitem/:id PUT", function (done) {
            request({
                method: "PUT",
                uri: BASE_URL + '/v1/queueitem/' + queueItem1._id,
                body: JSON.stringify({"message": 'Message2','completed':0}),
                headers: {
                    Cookie: cookie,
                    'content-type': 'application/json'
                },
            }, function (error, response, body) {
                console.log(body);
                expect(error).to.be.equal(null);
                expect(response.statusCode).to.equal(200);

                let data = JSON.parse(body);

                expect(data._id).to.be.equal(queueItem1._id);

                done();
            });
        });

    });


    describe('/v1/queueitem GET', function() {
        it("/v1/queueitem GET", function (done) {
            request({
                method: "GET",
                uri: BASE_URL + '/v1/queueitem',
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


    describe('/v1/queueitem GET', function() {
        it("/v1/queueitem GET", function (done) {
            request({
                method: "GET",
                uri: BASE_URL + '/v1/queueitem?status=in_progress',
                headers: {
                    Cookie: cookie,
                    'content-type': 'application/json'
                },
            }, function (error, response, body) {
                console.log(body);
                expect(error).to.be.equal(null);
                expect(response.statusCode).to.equal(200);

                let data = JSON.parse(body);

                expect(data.data.length).to.be.greaterThan(0);

                done();
            });
        });

    });


});