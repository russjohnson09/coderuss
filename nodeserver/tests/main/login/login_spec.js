var request = require('request');
var expect = require("chai").expect;
var winston = require('winston');


const CONSOLE_LOG_LEVEL = process.env.CONSOLE_LOG_LEVEL || 'info';

winston.loggers.add('testlogger', {
  transports: [
    new(winston.transports.Console)({
      level: CONSOLE_LOG_LEVEL
    }),
  ]
});

var logger = winston.loggers.get('testlogger');


describe("login endpoints >>", function() {

  var baseurl = "http://localhost:3000";
  var loginurl = baseurl + '/v1/login';
  describe('/v1/login', function() {
    it("successfully login with admin@foo.com:admin@foo.com", function(done) {
      request({
        method: "POST",
        json: {
          "username": "admin@foo.com",
          "password": "admin@foo.com"
        },
        uri: loginurl
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

  var uri = baseurl + '/v1/profile';
  describe(uri, function() {
    it("use cookie to view profile", function(done) {
      request({
        method: "GET",
        uri: uri,
        followRedirect: false,
        headers: {
          Cookie: cookie
        }
      }, function(error, response, body) {
        console.log(body);
        expect(error).to.be.equal(null);
        expect(response.statusCode).to.equal(200);
        var data = JSON.parse(body);
        expect(data.username).to.be.equal('admin@foo.com');
        done();
      });
    });
  });


  describe('/v1/login', function() {
    it("fail to login as admin@foo.com:admin2 bad password", function(done) {
      request({
        method: "POST",
        json: {
          "username": "admin@foo.com",
          "password": "admin2"
        },
        uri: loginurl
      }, function(error, response, body) {
        expect(error).to.be.equal(null);
        expect(response.statusCode).to.equal(401);
        expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
        done();
      });
    });
  });


  describe('password reset', function() {
    describe('signup as russjohnson09@gmail.com', function() {
      var requestBody = {
        "username": "russjohnson09@gmail.com",
        "password": "russjohnson09@gmail.com"
      }
      userrussjohnson09 = requestBody;

      it("/v1/login POST", function(done) {
        request({
          method: "POST",
          body: JSON.stringify(requestBody),
          uri: baseurl + '/v1/login',
          headers: {
            'content-type': 'application/json',
          }
        }, function(error, response, body) {
          expect(error).to.be.null;
          logger.info(body);
          body = JSON.parse(body);
          logger.info(JSON.stringify(body, null, '    '));
          logger.info(JSON.stringify(response.headers, null, '    '));
          expect(response.statusCode).to.be.equal(201);

          expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
          expect(response.headers['set-cookie']).not.to.be.undefined;

          expect(body.message).to.be.a('string');
          expect(body.status).to.be.a('string');
          expect(body.status).to.be.equal('success');


          userrussjohnson09.cookie = response.headers['set-cookie'];

          done();
        });
      });
    });


    describe('reset password', function() {

      it("/v1/reqestpasswordreset POST", function(done) {
        var requestBody = {
          "username": "russjohnson09@gmail.com"
        };
        request({
          method: "POST",
          body: JSON.stringify(requestBody),
          uri: baseurl + '/v1/reqestpasswordreset',
          headers: {
            'content-type': 'application/json',
            // Cookie: cookie //no authentication required

          }
        }, function(error, response, body) {
          expect(error).to.be.null;
          logger.info(body);
          body = JSON.parse(body);
          logger.info(JSON.stringify(body, null, '    '));
          logger.info(JSON.stringify(response.headers, null, '    '));
          expect(response.statusCode).to.be.equal(201);

          expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
          expect(response.headers['set-cookie']).not.to.be.undefined;

          expect(body.message).to.be.a('string');
          expect(body.status).to.be.a('string');
          expect(body.status).to.be.equal('success');

          done();
        });
      })

    })

  })

});
