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
const LOB_TEST_API_KEY = process.env.LOB_TEST_API_KEY;
const LOB_API_V1_ENDPONT = process.env.LOB_API_V1_ENDPONT;

const winston = require('winston');

winston.loggers.add('testlogger', {
    console: {
        level: process.env.TESTLOGGER_CONSOLE_LEVEL,
        colorize: true
    }
});

const logger = winston.loggers.get('testlogger')

/**
 * info: 422
info: {
    "error": {
        "message": "address_country is not valid. Please ensure you are using the proper ISO-3166 country code",
        "status_code": 422
    }
}
 * */
describe(path.basename(__filename), function() {

    describe('/postcards POST create/send postcard', function() {
        describe('/postcards POST 200', function() {
            it('/postcards POST', function() {
                return new Promise(function(resolve) {
                    var url = LOB_API_V1_ENDPONT + '/postcards';
                    console.log(url);
                    var requestBody = {
                        description: 'Demo Postcard job',
                        to: {
                            name: 'Joe Smith',
                            address_line1: '123 Main Street',
                            address_city: 'Mountain View',
                            address_state: 'CA',
                            address_zip: '94041'
                        },
                        from: {
                            name: 'Joe Smith',
                            address_line1: '123 Main Street',
                            address_city: 'Mountain View',
                            address_state: 'CA',
                            address_zip: '94041'
                        },
                        front: '<html style="padding: 1in; font-size: 50;">Front HTML for {{name}}</html>',
                        back: '<html style="padding: 1in; font-size: 20;">Back HTML for {{name}}</html>',
                        data: {
                            name: 'Harry'
                        }
                    };
                    // var requestBody = {
                    //     'to[address_line1]': '123 Main Street',
                    //     'from[address_line1]': '123 Main Street'
                    // };
                    console.log(requestBody);
                    request({
                        'url': url,
                        'method': 'POST',
                        'form': requestBody,
                        'auth': {
                            'user': LOB_TEST_API_KEY,
                            'pass': ''
                        }
                    }, function(error, response, body) {
                        if (error) logger.error(error);
                        expect(error).to.be.null;

                        logger.info(response.statusCode);
                        logger.info(body);

                        expect(response.statusCode).to.be.equal(200);

                        body = JSON.parse(body);

                        expect(body).to.have.all.keys([
                            "back_template_id", "back_template_version_id", "carrier", "date_created", "date_modified", "description", "expected_delivery_date", "from", "front_template_id", "front_template_version_id", "id", "mail_type", "metadata", "object", "size", "thumbnails", "to", "tracking_events", "url"
                        ]);
                        resolve();
                    })
                })
            })

        })
    });
    return;

    describe('/addresses POST create address', function() {
        describe('/address POST 401', function() {
            it('/addresses POST', function() {
                return new Promise(function(resolve) {
                    var url = LOB_API_V1_ENDPONT + '/addresses';
                    console.log(url);
                    var requestBody = {
                        "description": "Harry - Home",
                        "name": "Harry Zhang",
                        "company": "Lob",
                        "phone": "5555555555",
                        "email": "harry@lob.com",
                        "address_line1": "123 Test Street",
                        "address_line2": "Unit 199",
                        "address_city": "Mountain View",
                        "address_state": "CA",
                        "address_zip": "94085",
                        "address_country": "US"
                    };
                    console.log(requestBody);
                    request({
                        'url': url,
                        'method': 'POST',
                        'form': requestBody,
                        'auth': {
                            'user': LOB_TEST_API_KEY,
                            'pass': ''
                        }
                    }, function(error, response, body) {
                        if (error) logger.error(error);
                        expect(error).to.be.null;

                        logger.info(response.statusCode);
                        logger.info(body);

                        expect(response.statusCode).to.be.equal(200);

                        body = JSON.parse(body);

                        expect(body).to.have.all.keys(['id', "address_city", "address_country", "address_line1", "address_line2", "address_state", "address_zip", "company", "date_created", "date_modified", "description", "email", "metadata", "name", "object", "phone"]);

                        resolve();
                    })
                })
            })

        })
    });

    describe('/address POST 401', function() {
        it('/addresses POST', function() {
            return new Promise(function(resolve) {
                var url = LOB_API_V1_ENDPONT + '/addresses';
                console.log(url);
                var requestBody = {
                    "id": "adr_d3489cd64c791ab5",
                    "description": "Harry - Home",
                    "name": "Harry Zhang",
                    "company": "Lob",
                    "phone": "5555555555",
                    "email": "harry@lob.com",
                    "address_line1": "123 Test Street",
                    "address_line2": "Unit 199",
                    "address_city": "Mountain View",
                    "address_state": "CA",
                    "address_zip": "94085",
                    "address_country": "United States",
                    "metadata": {},
                    "date_created": "2015-04-27T18:52:44.725Z",
                    "date_modified": "2015-04-27T18:52:44.725Z",
                    "object": "address"
                };
                console.log(requestBody);
                request({
                    'url': url,
                    'method': 'POST',
                    'form': requestBody,
                    'auth': {
                        'user': 'invalid_api_key',
                        'pass': ''
                    }
                }, function(error, response, body) {
                    if (error) logger.error(error);
                    expect(error).to.be.null;

                    logger.info(response.statusCode);
                    logger.info(body);

                    expect(response.statusCode, 'user is invalid').to.be.equal(401);
                    resolve();
                })
            })
        })

    })




});
