var request = require('request');
var expect  = require("chai").expect;

const CONSOLE_LOG_LEVEL = process.env.CONSOLE_LOG_LEVEL || 'info';

var FormData = require('form-data');

const http = require('http');
const winston = require('winston');

winston.loggers.add('testlogger', {
    transports: [
        new(winston.transports.Console)({
            level: CONSOLE_LOG_LEVEL
        }),
    ]
});

var logger = winston.loggers.get('testlogger');


describe("API", function() {

  describe("Ping endpoint tests", function() {

    var url = "http://localhost:3000/v1/ping";
    it("returns status 200", function(done) {
      request(url, function(error, response, body) {
        logger.info(body);
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it("returns has success in response body", function(done) {
      request(url, function(error, response, body) {
        expect(JSON.parse(response.body).status).to.equal('success');
        done();
      });
    });

  });

});