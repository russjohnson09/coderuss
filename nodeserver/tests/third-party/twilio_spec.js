// https://api.twilio.com/2010-04-01
//https://www.twilio.com/docs/api/rest/sending-messages?code-sample=code-send-a-message-with-an-image-url&code-language=curl&code-sdk-version=default

//https://www.twilio.com/docs/api/rest/test-credentials

// curl -X POST 'https://api.twilio.com/2010-04-01/Accounts/AC881932ec9c24aaab490a0946c3ae1107/Messages.json' \
// --data-urlencode 'To=+15558675309'  \
// --data-urlencode 'From=+15017250604'  \
// --data-urlencode 'Body=This is the ship that made the Kessel Run in fourteen parsecs?'  \
// -d 'MediaUrl=https://c1.staticflickr.com/3/2899/14341091933_1e92e62d12_b.jpg' \
// -u AC881932ec9c24aaab490a0946c3ae1107:your_auth_token

require('dotenv').config();

const to = process.env.TWILIO_TEST_TO;
const from = process.env.TWILIO_TEST_FROM;

var request = require('request');
var expect = require("chai").expect;
const path = require('path');

const port = 3000;
const BASE_URL = "http://localhost:" + port;

const TESTLOGGER_CONSOLE_LEVEL = process.env.TESTLOGGER_CONSOLE_LEVEL ? process.env.TESTLOGGER_CONSOLE_LEVEL : 'info';
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTHTOKEN = process.env.TWILIO_AUTHTOKEN;
const TWILIO_BASE_URL = process.env.TWILIO_BASE_URL;

// console.log(TWILIO_BASE_URL);
// console.log(TWILIO_ACCOUNT_SID);
// console.log(TWILIO_AUTHTOKEN);

// console.log(process.env)

// return;

const winston = require('winston');

winston.loggers.add('testlogger', {
    console: {
        level: process.env.TESTLOGGER_CONSOLE_LEVEL,
        colorize: true
    }
});

const logger = winston.loggers.get('testlogger')


//400
//{"code": 21603, "message": "A 'From' phone number is required.", "more_info": "https://www.twilio.com/docs/errors/21603", "status": 400}
// 201
// {"sid": "SM444dd49ef737406eb5613cadbea3fc86", "date_created": "Tue, 09 May 2017 18:27:49 +0000", "date_updated": "Tue, 09 May 2017 18:27:49 +0000", "date_sent": null, "account_sid": "ACfe315dd4a3d5617b494305b6963a4c7a", "to": "+15005550006", "from": "+15005550006", "messaging_service_sid": null, "body": "Sent from your Twilio trial account - test body", "status": "queued", "num_segments": "1", "num_media": "0", "direction": "outbound-api", "api_version": "2010-04-01", "price": null, "price_unit": "USD", "error_code": null, "error_message": null, "uri": "/2010-04-01/Accounts/ACfe315dd4a3d5617b494305b6963a4c7a/Messages/SM444dd49ef737406eb5613cadbea3fc86.json", "subresource_uris": {"media": "/2010-04-01/Accounts/ACfe315dd4a3d5617b494305b6963a4c7a/Messages/SM444dd49ef737406eb5613cadbea3fc86/Media.json"}}

describe(path.basename(__filename), function() {

    this.timeout(30 * 1000);
    describe('send text', function() {
        it('/Accounts/:sid/Messages.json', function() {
            return new Promise(function(resolve) {
                var url = TWILIO_BASE_URL + '/2010-04-01/Accounts/' + TWILIO_ACCOUNT_SID + '/Messages.json';
                console.log(url);
                var requestBody = {
                    'To': to,
                    'From': from,
                    'Body': 'test body'
                };
                console.log(requestBody);
                request({
                    'url': url,
                    'method': 'POST',
                    'form': requestBody,
                    'auth': {
                        'user': TWILIO_ACCOUNT_SID,
                        'pass': TWILIO_AUTHTOKEN
                    }
                }, function(error, response, body) {
                    if (error) logger.error(error);
                    expect(error).to.be.null;

                    logger.info(response.statusCode);
                    logger.info(body);

                    expect(response.statusCode).to.be.equal(201);

                    body = JSON.parse(body);

                    expect(body).to.contain.all.keys(['sid', 'to', 'from', 'account_sid', 'status','uri']);
                    
                    message = body;
                    
                    expect(message.status).to.equal('queued');
                    expect(message.sid).to.be.a('String');
                    var uri = '/2010-04-01/Accounts/' + TWILIO_ACCOUNT_SID + '/Messages/'+message.sid+'.json'
                    expect(message.uri).to.equal(uri);

                    //most strict
                    // expect(body).to.have.all.keys(['sid']);

                    resolve();
                })
            })
        })
    });
    
    
    describe('get text', function() {
        it('/Accounts/:sid/Messages/:message_id.json GET', function() {
            return new Promise(function(resolve) {
                var url = TWILIO_BASE_URL + message.uri;
                console.log(url);
                request({
                    'url': url,
                    'method': 'GET',
                    'auth': {
                        'user': TWILIO_ACCOUNT_SID,
                        'pass': TWILIO_AUTHTOKEN
                    }
                }, function(error, response, body) {
                    if (error) logger.error(error);
                    expect(error).to.be.null;

                    logger.info(response.statusCode);
                    logger.info(body);

                    expect(response.statusCode).to.be.equal(403); //unauthorized

                    body = JSON.parse(body);

                    // expect(body).to.contain.all.keys(['sid', 'to', 'from', 'account_sid', 'status','uri']);
                    
                    // message = body;
                    
                    // expect(message.status).to.equal('queued');
                    // expect(message.sid).to.be.a('String');
                    // var uri = '/2010-04-01/Accounts/' + TWILIO_ACCOUNT_SID + '/Messages/'+message.sid+'.json'
                    // expect(message.uri).to.equal(uri);

                    //most strict
                    // expect(body).to.have.all.keys(['sid']);

                    resolve();
                })
            })
        })

    })

});
