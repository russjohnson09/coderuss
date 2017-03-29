var request = require('request');
var expect = require("chai").expect;
var winston = require('winston');

const MongoClient = require('mongodb').MongoClient;

const moniker = require('moniker');


const CONSOLE_LOG_LEVEL = process.env.CONSOLE_LOG_LEVEL || 'warn';
const MONGO_CONNECTION = process.env.MONGO_CONNECTION || 'mongodb://localhost:27017/coderuss';


winston.loggers.add('testlogger', {
  transports: [
    new(winston.transports.Console)({
      level: CONSOLE_LOG_LEVEL
    }),
  ]
});

var logger = winston.loggers.get('testlogger');


describe("login endpoints", function() {
  this.timeout(0);

  describe('setup mongodb connection', function() {
    it('mongo connection', function(done) {
      MongoClient.connect(MONGO_CONNECTION, function(err, db) {

        database = mongo_db = db;
        User = database.collection('user');
        done();
      });
    })
  })

  var baseurl = "http://localhost:3000";
  var loginurl = baseurl + '/v1/login';
  describe('/v1/login', function() {
    it("successfully login with admin@foo.com:admin@foo.com", function(done) {
      username = moniker.choose() + "@foo.com";
      request({
        method: "POST",
        json: {
          "username": username,
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
        // console.log(body);
        expect(error).to.be.equal(null);
        expect(response.statusCode).to.equal(200);
        var data = JSON.parse(body);
        expect(data.username).to.be.equal(username);
        done();
      });
    });
  });


  describe('/v1/login', function() {
    it("fail to login as admin@foo.com:admin2 bad password", function(done) {
      request({
        method: "POST",
        json: {
          "username": username,
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
    describe('signup', function() {
      it("/v1/login POST", function(done) {
        username = moniker.choose() + "@foo.com";
        // username = 'tests123456';
        old_password = 'Password!124';

        var requestBody = {
          "username": username,
          "password": old_password
        };

        logger.info(JSON.stringify(requestBody, null, '   '));

        passwordresetuser = requestBody;

        request({
          method: "POST",
          body: JSON.stringify(requestBody),
          uri: baseurl + '/v1/login',
          headers: {
            'content-type': 'application/json',
          }
        }, function(error, response, body) {
          expect(error).to.be.null;
          // logger.info(body);
          body = JSON.parse(body);
          logger.info(JSON.stringify(body, null, '    '));
          logger.debug(JSON.stringify(response.headers, null, '    '));
          expect(response.statusCode).to.be.equal(201);

          expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
          expect(response.headers['set-cookie']).not.to.be.undefined;

          expect(body.message).to.be.a('string');
          expect(body.status).to.be.a('string');
          expect(body.status).to.be.equal('success');


          passwordresetuser.cookie = response.headers['set-cookie'];

          done();
        });
      });
    });

    describe('login with old_password', function() {
      it("/v1/login POST", function(done) {
        var requestBody = {
          "username": username,
          "password": old_password
        };
        logger.info(JSON.stringify(requestBody, null, '   '));
        request({
          method: "POST",
          uri: baseurl + '/v1/login',
          body: JSON.stringify(requestBody),
          headers: {
            'content-type': 'application/json',
          }
        }, function(error, response, body) {
          expect(error).to.be.null;
          // console.log(body);
          body = JSON.parse(body);
          logger.info(JSON.stringify(body, null, '    '));
          logger.info(JSON.stringify(response.headers, null, '    '));
          expect(response.statusCode).to.be.equal(201);
          expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
          done();
        });
      });
    });



    describe('reset password', function() {

      it("/v1/reqestpasswordreset POST", function(done) {
        var requestBody = {
          "username": username
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
      });


      it('get token from database', function(done) {
        User.findOne({
          username: username
        }, function(err, u) {
          expect(err).to.be.null;
          expect(u).not.to.be.undefined;
          user = u;
          logger.info(JSON.stringify(user));

          expect(u).not.to.be.undefined;

          logger.info(user['password_reset_token']);

          expect(u.password_reset_token).not.to.be.undefined;
          expect(u.password_reset_token).not.to.be.null;

          token = u.password_reset_token;
          logger.info(token);
          done();

        });
      });


      // return; //uncomment to test second part manually;
      it('use token to reset password', function(done) {
        ///passwordreset/:token
        password = 'Password!1234367'
        var requestBody = {
          "password": password
        };
        var url = baseurl + '/v1/passwordreset/' + token;
        winston.info(url);
        request({
          method: "POST",
          body: JSON.stringify(requestBody),
          uri: url,
          headers: {
            'content-type': 'application/json',

          }
        }, function(error, response, body) {
          expect(error).to.be.null;
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
      });


      describe('password has been updated', function() {
        it('mongodb check', function(done) {
          User.findOne({
            username: username
          }, function(err, u) {
            expect(err).to.be.null;
            expect(u).not.to.be.undefined;
            expect(u.password).to.be.a('string');

            expect(u.password).not.to.be.equal(user.password);

            expect(u['password_reset_token']).to.be.null;
            done();

          });
        });
      })


      describe('cannot reuse token', function() {
        it('/v1/passwordreset/:token', function(done) {
          var requestBody = {
            "password": password + '1'
          };
          var url = baseurl + '/v1/passwordreset/' + token;
          winston.info(url);
          request({
            method: "POST",
            body: JSON.stringify(requestBody),
            uri: url,
            headers: {
              'content-type': 'application/json',

            }
          }, function(error, response, body) {
            expect(error).to.be.null;
            body = JSON.parse(body);
            logger.info(JSON.stringify(body, null, '    '));
            logger.info(JSON.stringify(response.headers, null, '    '));
            expect(response.statusCode).to.be.equal(404);

            expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
            expect(response.headers['set-cookie']).not.to.be.undefined;

            expect(body.message).to.be.a('string');
            expect(body.status).to.be.a('string');
            expect(body.status).to.be.equal('not found');

            done();
          });
        })
      });


      it("fail to login with old_password", function(done) {

        var requestBody = {
          "username": username,
          "password": old_password
        };
        request({
          method: "POST",
          uri: baseurl + '/v1/login',
          body: JSON.stringify(requestBody),
          headers: {
            'content-type': 'application/json',

          }
        }, function(error, response, body) {
          expect(error).to.be.null;
          // console.log(body);
          body = JSON.parse(body);
          logger.info(JSON.stringify(body, null, '    '));
          logger.info(JSON.stringify(response.headers, null, '    '));

          expect(response.statusCode).to.equal(401);
          expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
          done();
        });
      });

      it("login with password", function(done) {
        var requestBody = {
          "username": username,
          "password": password
        };

        // console.log(requestBody);

        request({
          method: "POST",
          uri: baseurl + '/v1/login',
          body: JSON.stringify(requestBody),
          headers: {
            'content-type': 'application/json',

          }
        }, function(error, response, body) {
          expect(error).to.be.null;
          // console.log(body);
          body = JSON.parse(body);
          logger.info(JSON.stringify(body, null, '    '));
          logger.info(JSON.stringify(response.headers, null, '    '));
          expect(response.statusCode).to.be.equal(201);
          expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
          done();
        });
      });

    })

  })

});
