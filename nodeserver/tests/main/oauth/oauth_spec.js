require('dotenv').config();


const expect = require('chai').expect;

const request = require('request');
const path = require('path');
const winston = require('winston');
const moniker = require('moniker');

const CONSOLE_LOG_LEVEL = process.env.CONSOLE_LOG_LEVEL || 'info';

const AMAZON_CLIENT_ID = process.env.AMAZON_CLIENT_ID;

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

        oauthClient = body;

        expect(oauthClient._id).to.be.a('string');
        expect(oauthClient.client_secret).to.be.a('string');

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


  describe('oauth2 get code', function() {
    it('/v1/oauth/authorize POST', function(done) {
      var requestBody = {
        client_id: oauthClient._id
      };
      request.post({
        followRedirect: false,
        url: BASE_URL + '/v1/oauth/authorize',
        body: JSON.stringify(requestBody),
        headers: {
          'content-type': 'application/json',
          Cookie: cookie //is an authenticated user
        }
      }, function(error, response, body) {
        expect(error).to.be.null;
        logger.info(body);
        body = JSON.parse(body);
        logger.info(JSON.stringify(body, null, '    '));
        expect(response.statusCode).to.be.equal(201);

        expect(body.code).to.be.a('string');

        code = body.code;

        done();
      });
    });

  });


  //   info: oauth
  // info:  grant_type=authorization_code, code=6bc196c56ce011cd29858a3466e32ea3bedc44862cf7488096bf2940802df7fea01c812fc6a8bd9aa8a8d0d01493ad3f42783df0bb62885567bb5bc6fa81c35f, redirect_uri=https://pitangui.amazon.com/api/skill/link/M2NWQJVXYCCF8Q, client_id=58eb73f4317cbc0898341ec7, client_secret=fbe8d8bc37e12d0f46ccb27b601ea866cca4e1865caeb0fdd9c5f698b4adba65a3920fabc70899bcea4e990f379febc4b60ced36eb1b2bdf706f8a7ddec117b5
  // info:  x-forwarded-for=72.21.217.74, x-forwarded-proto=https, accept-encoding=gzip,deflate, user-agent=Apache-HttpClient/4.5.x (Java/1.8.0_112), host=0d4bd21a.ngrok.io, content-length=426, content-type=application/x-www-form-urlencoded, connection=close
  // info:  ok=1, nModified=1, n=1
  // { access_token: 'eb8ca631b2b9df8253368d0d8926878eebd2a0f32ee4a000f03bf80421bebf0a475b9aadc359af258b2cb17f23d668b58f1da9300b815f20e678f5a5d92be72c',
  //   scope: 'default',
  //   token_type: 'bearer',
  //   refresh_token: '56466a6e1563a78ac6eb674ac9af357b3fc9e26f889ecf87c976f8cd3ecbf44fd94438890312c3bde42c420a5fd0ea1f680546d8095874eb3147deed678686e0',
  //   expires_in: 3600 }
  // info: ::ffff:127.0.0.1 - - [11/Apr/2017:00:12:42 +0000] "POST /v1/oauth/access_token HTTP/1.1" 200 - "-" "Apache-HttpClient/4.5.x (Java/1.8.0_112)"
  // AMAZON_CLIENT_ID

  describe('get access_token from code to be used to authorize', function() {

    it('/v1/oauth/access_token POST', function(done) {

      // var requestBody = {
      //   grant_type: 'authorization_code',
      //   code: '6bc196c56ce011cd29858a3466e32ea3bedc44862cf7488096bf2940802df7fea01c812fc6a8bd9aa8a8d0d01493ad3f42783df0bb62885567bb5bc6fa81c35f',
      //   // redirect_uri: 'https://pitangui.amazon.com/api/skill/link/M2NWQJVXYCCF8Q',
      //   client_id: '58eb73f4317cbc0898341ec7',
      //   client_secret: 'fbe8d8bc37e12d0f46ccb27b601ea866cca4e1865caeb0fdd9c5f698b4adba65a3920fabc70899bcea4e990f379febc4b60ced36eb1b2bdf706f8a7ddec117b5'
      // };

      var requestBody = {
        grant_type: 'authorization_code',
        code: code,
        // redirect_uri: 'https://pitangui.amazon.com/api/skill/link/M2NWQJVXYCCF8Q',
        client_id: oauthClient._id,
        client_secret: oauthClient.client_secret
      };

      request.post({
        followRedirect: false,
        url: BASE_URL + '/v1/oauth/access_token',
        body: JSON.stringify(requestBody),
        headers: {
          'content-type': 'application/json',
          // 'Authorization': 'token ' + token
        }
      }, function(error, response, body) {

        expect(error).to.be.null;
        logger.info(body);
        console.log(body);
        body = JSON.parse(body);
        logger.info(JSON.stringify(body, null, '    '));
        expect(response.statusCode).to.be.equal(200);

        expect(body.access_token).not.to.be.undefined;
        expect(body.access_token).not.to.be.null;

        access_token = body.access_token;
        refresh_token = body.refresh_token;

        done();
      });
    });
  });

  describe('code cannot be used more than once', function() {
    it('/v1/oauth/access_token POST', function(done) {

      // var requestBody = {
      //   grant_type: 'authorization_code',
      //   code: '6bc196c56ce011cd29858a3466e32ea3bedc44862cf7488096bf2940802df7fea01c812fc6a8bd9aa8a8d0d01493ad3f42783df0bb62885567bb5bc6fa81c35f',
      //   // redirect_uri: 'https://pitangui.amazon.com/api/skill/link/M2NWQJVXYCCF8Q',
      //   client_id: '58eb73f4317cbc0898341ec7',
      //   client_secret: 'fbe8d8bc37e12d0f46ccb27b601ea866cca4e1865caeb0fdd9c5f698b4adba65a3920fabc70899bcea4e990f379febc4b60ced36eb1b2bdf706f8a7ddec117b5'
      // };

      var requestBody = {
        grant_type: 'authorization_code',
        code: code,
        // redirect_uri: 'https://pitangui.amazon.com/api/skill/link/M2NWQJVXYCCF8Q',
        client_id: oauthClient._id,
        client_secret: oauthClient.client_secret
      };

      request.post({
        followRedirect: false,
        url: BASE_URL + '/v1/oauth/access_token',
        body: JSON.stringify(requestBody),
        headers: {
          'content-type': 'application/json',
          // 'Authorization': 'token ' + token
        }
      }, function(error, response, body) {

        expect(error).to.be.null;
        logger.info(body);
        console.log(body);
        body = JSON.parse(body);
        logger.info(JSON.stringify(body, null, '    '));
        expect(response.statusCode, 'code has been used and is now invalid').to.be.equal(401);

        done();
      });
    });

  })


  describe('refresh oauth2 token', function() {
    it('/v1/oauth/access_token POST', function(done) {

      var requestBody = {
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
        client_id: oauthClient._id,
        client_secret: oauthClient.client_secret
      };

      request.post({
        followRedirect: false,
        url: BASE_URL + '/v1/oauth/access_token',
        body: JSON.stringify(requestBody),
        headers: {
          'content-type': 'application/json',
        }
      }, function(error, response, body) {

        expect(error).to.be.null;
        logger.info(body);
        console.log(body);
        body = JSON.parse(body);
        logger.info(JSON.stringify(body, null, '    '));
        expect(response.statusCode).to.be.equal(200);

        expect(body.access_token).not.to.be.undefined;
        expect(body.access_token).not.to.be.null;

        expect(body.access_token, 'access_token is refreshed (new)').not.to.be.equal(access_token);
        expect(body.refresh_token, 'refresh_token has not been changed').to.be.equal(refresh_token);
        access_token = body.access_token;

        done();
      });
    });

  })

  describe("authorization using oauth2 token", function() {

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
