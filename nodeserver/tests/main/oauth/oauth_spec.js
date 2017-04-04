const expect = require('chai').expect;

const request = require('request');
const path = require('path');
const winston = require('winston');
const moniker = require('moniker');

const CONSOLE_LOG_LEVEL = process.env.CONSOLE_LOG_LEVEL || 'info';

winston.loggers.add('testlogger', {
  transports: [
    new(winston.transports.Console)({
      level: CONSOLE_LOG_LEVEL
    }),
  ]
});

var logger = winston.loggers.get('testlogger');

const BASE_URL = "http://localhost:" + 3000;


describe(path.basename(__dirname), function() {

  describe('successfully login', function() {
    // it("/v1/ping GET", function(done) {
    //   request({
    //     method: "POST",
    //     uri: BASE_URL + '/v1/ping'
    //   }, function(error, response, body) {
    //     expect(error).to.be.equal(null);
    //     body = JSON.parse(body);
    //     logger.info(JSON.stringify(body, null, '    '));
    //     expect(response.statusCode).to.equal(201);
    //     done();
    //   });
    // });

    it("/v1/login POST", function(done) {
      username = moniker.choose() + "@foo.com";
      request({
        method: "POST",
        json: {
          "username": username,
          "password": "admin@foo.com"
        },
        uri: BASE_URL + '/v1/login'
      }, function(error, response, body) {
        expect(error).to.be.equal(null);
        expect(response.statusCode).to.equal(201);
        expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
        expect(response.headers['set-cookie']).not.to.be.undefined;
        cookie = response.headers['set-cookie'];
        done();
      });
    });

  });


  describe('oauth client registration', function() {
    it('/v1/oauthclients POST', function(done) {

      var requestBody = {
        redirect_uri: 'http://localhost'
      };

      request.post({
        followRedirect: false,
        url: BASE_URL + '/v1/oauthclients',
        body: JSON.stringify(requestBody),
        headers: {
          'content-type': 'application/json',
          Cookie: cookie
        }
      }, function(error, response, body) {
        expect(error).to.be.null;
        logger.info(body);
        body = JSON.parse(body);
        logger.info(JSON.stringify(body, null, '    '));
        expect(response.statusCode).to.be.equal(201);

        done();
      });
    });

    it('/v1/oauthclients GET', function(done) {

      var requestBody = {
        redirect_uri: 'http://localhost'
      };

      request.get({
        followRedirect: false,
        url: BASE_URL + '/v1/oauthclients',
        headers: {
          'content-type': 'application/json',
          Cookie: cookie
        }
      }, function(error, response, body) {
        expect(error).to.be.null;
        logger.info(body);
        body = JSON.parse(body);
        logger.info(JSON.stringify(body, null, '    '));
        expect(response.statusCode).to.be.equal(200);

        done();
      });
    });

  });

  return;
  describe('get access_token from code to be used to authorize', function() {

    it('/login/oauth/access_token POST', function(done) {

      var requestBody = {
        client_id: 'client_id',
        client_secret: 'client_secret',
        code: '1'
      };

      request.post({
        followRedirect: false,
        url: BASE_URL + '/login/oauth/access_token',
        body: JSON.stringify(requestBody),
        headers: {
          'content-type': 'application/json',
          // 'Authorization': 'token ' + token
        }
      }, function(error, response, body) {
        expect(error).to.be.null;
        logger.info(body);
        body = JSON.parse(body);
        logger.info(JSON.stringify(body, null, '    '));
        expect(response.statusCode).to.be.equal(201);

        expect(body.access_token).not.to.be.undefined;
        expect(body.access_token).not.to.be.null;

        access_token = body.access_token;
        done();
      });
    });
  })


  describe("basic authorization", function() {

    it('/v1/users/me GET Authorization: token', function(done) {

      request.get({
        followRedirect: false,
        url: BASE_URL + '/v1/users/me',
        headers: {
          'content-type': 'application/json',
          'Authorization': 'token ' + access_token
        }
      }, function(error, response, body) {
        expect(error).to.be.null;
        logger.info(body);
        body = JSON.parse(body);
        logger.info(JSON.stringify(body, null, '    '));
        expect(response.statusCode).to.be.equal(200);
        done();
      });
    })
  })

})
