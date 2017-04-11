var request = require('request');
var expect = require("chai").expect;
const path = require('path');
const moniker = require('moniker');
const winston = require('winston');

baseurl = "http://localhost:" + 3000;
alexaurl = baseurl + '/v1/alexa';

const BASE_URL = "http://localhost:" + 3000;
const CONSOLE_LOG_LEVEL = process.env.CONSOLE_LOG_LEVEL || 'info';

winston.loggers.add('testlogger', {
  transports: [
    new(winston.transports.Console)({
      level: CONSOLE_LOG_LEVEL
    }),
  ]
});

var logger = winston.loggers.get('testlogger');


describe(path.basename(__dirname), function() {

  describe("/v1/alexa POST", function() {

    it('responds with 201', function(done) {

      ts = '2017-02-10T07:27:59Z';
      // var ts = '2017-02-23T08:13:48-05:00';

      now = new Date(ts);
      cert_url = 'https://s3.amazonaws.com/echo.api/echo-api-cert-4.pem' // latest valid cert
      signature = 'Qc8OuaGEHWeL/39XTEDYFbOCufYWpwi45rqmM2R4WaSEYcSXq+hUko/88wv48+6SPUiEddWSEEINJFAFV5auYZsnBzqCK+SO8mGNOGHmLYpcFuSEHI3eA3nDIEARrXTivqqbH/LCPJHc0tqNYr3yPZRIR2mYFndJOxgDNSOooZX+tp2GafHHsjjShCjmePaLxJiGG1DmrL6fyOJoLrzc0olUxLmnJviS6Q5wBir899TMEZ/zX+aiBTt/khVvwIh+hI/PZsRq/pQw4WAvQz1bcnGNamvMA/TKSJtR0elJP+TgCqbVoYisDgQXkhi8/wonkLhs68pN+TurbR7GyC1vxw==';
      body = {
        "version": "1.0",
        "session": {
          "new": true,
          "sessionId": "SessionId.7745e45d-3042-45eb-8e86-cab2cf285daf",
          "application": {
            "applicationId": "amzn1.ask.skill.75c997b8-610f-4eb4-bf2e-95810e15fba2"
          },
          "attributes": {},
          "user": {
            "userId": "amzn1.ask.account.AF6Z7574YHBQCNNTJK45QROUSCUJEHIYAHZRP35FVU673VDGDKV4PH2M52PX4XWGCSYDM66B6SKEEFJN6RYWN7EME3FKASDIG7DPNGFFFNTN4ZT6B64IIZKSNTXQXEMVBXMA7J3FN3ERT2A4EDYFUYMGM4NSQU4RTAQOZWDD2J7JH6P2ROP2A6QEGLNLZDXNZU2DL7BKGCVLMNA"
          }
        },
        "request": {
          "type": "IntentRequest",
          "requestId": "EdwRequestId.fa7428b7-75d0-44c8-aebb-4c222ed48ebe",
          "timestamp": ts,
          "locale": "en-US",
          "intent": {
            "name": "InvalidRequest"
          },
          "inDialog": false
        }
      };

      body = JSON.stringify(body);

      request({
        method: "POST",
        body: body,
        uri: alexaurl
      }, function(error, response, body) {
        console.log(body);
        expect(error).to.be.equal(null);
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');

        var data = JSON.parse(body);
        expect(data.version).to.be.equal('1.0');
        expect(data.response).not.to.be.undefined;
        var response = data.response;
        expect(response.shouldEndSession).to.be.true;
        expect(response.outputSpeech).not.to.be.undefined;
        expect(response.outputSpeech.type).to.be.equal('SSML');
        expect(response.outputSpeech.ssml).to.be.a('string');


        done();
      });



    });

    it('statusIntent', function(done) {
      ts = '2017-02-10T07:27:59Z';
      now = new Date(ts);
      body = {
        "version": "1.0",
        "session": {
          "new": true,
          "sessionId": "SessionId.7745e45d-3042-45eb-8e86-cab2cf285daf",
          "application": {
            "applicationId": "amzn1.ask.skill.75c997b8-610f-4eb4-bf2e-95810e15fba2"
          },
          "attributes": {},
          "user": {
            "userId": "amzn1.ask.account.AF6Z7574YHBQCNNTJK45QROUSCUJEHIYAHZRP35FVU673VDGDKV4PH2M52PX4XWGCSYDM66B6SKEEFJN6RYWN7EME3FKASDIG7DPNGFFFNTN4ZT6B64IIZKSNTXQXEMVBXMA7J3FN3ERT2A4EDYFUYMGM4NSQU4RTAQOZWDD2J7JH6P2ROP2A6QEGLNLZDXNZU2DL7BKGCVLMNA"
          }
        },
        "request": {
          "type": "IntentRequest",
          "requestId": "EdwRequestId.fa7428b7-75d0-44c8-aebb-4c222ed48ebe",
          "timestamp": ts,
          "locale": "en-US",
          "intent": {
            "name": "statusIntent"
          },
          "inDialog": false
        }
      };

      body = JSON.stringify(body);

      request({
        method: "POST",
        body: body,
        uri: alexaurl
      }, function(error, response, body) {
        console.log(body);
        expect(error).to.be.equal(null);
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');

        var data = JSON.parse(body);
        expect(data.version).to.be.equal('1.0');
        expect(data.response).not.to.be.undefined;
        var response = data.response;
        expect(response.shouldEndSession).to.be.true;
        expect(response.outputSpeech).not.to.be.undefined;
        expect(response.outputSpeech.type).to.be.equal('SSML');
        expect(response.outputSpeech.ssml).to.be.a('string');
        done();
      });



    });
  });


  describe('authorized alexa application', function() {
    describe('create an access token', function() {
      describe('login', function() {

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


      describe('create an oauth client', function() {
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

    });

    describe('make alexa request with access_token', function() {
      it("/v1/alexa POST", function(done) {
        var requestBody = {
          "session": {
            "sessionId": "SessionId.d0e2411e-682c-49dd-aa8f-34da3464f159",
            "application": {
              "applicationId": "amzn1.ask.skill.1a53d497-6c64-4836-9000-7b2bd4b49d6e"
            },
            "attributes": {},
            "user": {
              "userId": "amzn1.ask.account.AEXZBVFPKKSKUCQEIOZUW2FRZAY5TMB5QQZQKLPZXSHKSESOOPDUQNXZJOAW4EZJZOUH5NSFIJ662HMI2VCNDX6ZD7JAV34QKJFICZY4MDJ6GOKRVFXQTHZCSEBN37NADZLVRBEJKQTQZ3E7G3U7PCU6U2MVFDJXOB76ETP7WTKXS5JFXVCQOG6WYQVXDD25KPOLSRK5JMA5JVY",
              "accessToken": access_token,
            },
            "new": true
          },
          "request": {
            "type": "IntentRequest",
            "requestId": "EdwRequestId.8de7cb1f-61c1-4c3d-991e-fc7a51445e1f",
            "locale": "en-US",
            "timestamp": "2017-04-11T11:51:14Z",
            "intent": {
              "name": "statusIntent",
              "slots": {}
            }
          },
          "version": "1.0"
        };

        request.post({
          followRedirect: false,
          url: BASE_URL + '/v1/alexa',
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
          expect(response.statusCode).to.be.equal(200);

          done();
        });
      })

    })
  });

});
