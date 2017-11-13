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


    describe('fitbit', function () {
        describe('/v1/fitbit as admin', function () {
            it("successfully login", function (done) {
                request({
                    method: "GET",
                    uri: BASE_URL + '/v1/fitbit'
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