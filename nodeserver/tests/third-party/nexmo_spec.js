
require('dotenv').config();

const NEXMO_TEST_TO = process.env.NEXMO_TEST_TO;
const NEXMO_TEST_FROM = process.env.NEXMO_TEST_FROM;

var request = require('request');
var expect = require("chai").expect;
const path = require('path');

const TESTLOGGER_CONSOLE_LEVEL = process.env.TESTLOGGER_CONSOLE_LEVEL ? process.env.TESTLOGGER_CONSOLE_LEVEL : 'info';
const NEXMO_API_KEY = process.env.NEXMO_API_KEY;
const NEXMO_API_SECRET = process.env.NEXMO_API_SECRET;
const NEXMO_BASE_URL = process.env.NEXMO_BASE_URL;

// curl -X POST  https://rest.nexmo.com/sms/json \
// -d api_key=key \
// -d api_secret=SECRET \
// -d to=15555555555 \
// -d from=441632960960 \
// -d text="Hello from Nexmo"
//ADD_YOUR_LVN 
const winston = require('winston');

winston.loggers.add('testlogger', {
    console: {
        level: process.env.TESTLOGGER_CONSOLE_LEVEL,
        colorize: true
    }
});

const logger = winston.loggers.get('testlogger')


//200
//  {
//     "message-count": "1",
//     "messages": [{
//         "to": "15555555555",
//         "status": "15",
//         "error-text": "Illegal Sender Address - rejected",
//         "network": "310004"
//     }]

describe(path.basename(__filename), function() {

    this.timeout(30 * 1000);
    describe('send text', function() {
        it('/sms/json', function() {
            return new Promise(function(resolve) {
                var url = NEXMO_BASE_URL + '/sms/json';
                console.log(url);
                var requestBody = {
                    'api_key': NEXMO_API_KEY,
                    'api_secret': NEXMO_API_SECRET,
                    'to': NEXMO_TEST_TO,
                    'from': 'NexmoWorks',
                    'text': 'test'
                };
                console.log(requestBody);
                request({
                    'url': url,
                    'method': 'POST',
                    'form': requestBody,
                }, function(error, response, body) {
                    if (error) logger.error(error);
                    expect(error).to.be.null;

                    logger.info(response.statusCode);
                    logger.info(body);

                    expect(response.statusCode).to.be.equal(200);

                    body = JSON.parse(body);

                    expect(body).to.contain.all.keys(['message-count', 'messages']);
                    
                    message = body;
                    
                    expect(body['message-count']).to.equal("1");
                    
                    expect(body['messages']).to.be.an("Array");
                    expect(body['messages'].length).to.be.equal(1);
                    
                    expect(body['messages'][0]).to.be.an('Object');
                    
                    message = body['messages'][0];
                    
                    expect(message).to.contain.all.keys([
                        'to', 
                    'status',
                    'network'
                    ]);
                    
                    
                    // expect(message.status).not.to.be.equal("15");
                

                    resolve();
                })
            })
        })
    });
    
    
    // describe('get text', function() {
    //     it('/Accounts/:sid/Messages/:message_id.json GET', function() {
    //         return new Promise(function(resolve) {
    //             var url = TWILIO_BASE_URL + message.uri;
    //             console.log(url);
    //             request({
    //                 'url': url,
    //                 'method': 'GET',
    //                 'auth': {
    //                     'user': TWILIO_ACCOUNT_SID,
    //                     'pass': TWILIO_AUTHTOKEN
    //                 }
    //             }, function(error, response, body) {
    //                 if (error) logger.error(error);
    //                 expect(error).to.be.null;

    //                 logger.info(response.statusCode);
    //                 logger.info(body);

    //                 expect(response.statusCode).to.be.equal(403); //unauthorized

    //                 body = JSON.parse(body);

    //                 // expect(body).to.contain.all.keys(['sid', 'to', 'from', 'account_sid', 'status','uri']);
                    
    //                 // message = body;
                    
    //                 // expect(message.status).to.equal('queued');
    //                 // expect(message.sid).to.be.a('String');
    //                 // var uri = '/2010-04-01/Accounts/' + TWILIO_ACCOUNT_SID + '/Messages/'+message.sid+'.json'
    //                 // expect(message.uri).to.equal(uri);

    //                 //most strict
    //                 // expect(body).to.have.all.keys(['sid']);

    //                 resolve();
    //             })
    //         })
    //     })

    // })

});
