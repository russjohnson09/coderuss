var request = require('request');
var expect = require("chai").expect;

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


var base_url = 'http://localhost:3000'


describe("API", function() {

  describe("Ping endpoint tests", function() {


    describe('/v1/ping/eventlogger POST', function() {
      it("returns status 201", function(done) {
        var requestBody = {
          "id": "evt_80001f1f73ac0efc",
          "body": {
            "id": "psc_0d6060bb12cbc646",
            "description": "Test Postcard",
            "metadata": {},
            "to": {
              "id": "adr_7bd7c2fab9806205",
              "description": "Test Address",
              "name": "Larry Lobster",
              "address_line1": "123 Test St",
              "address_line2": "Unit 1",
              "address_city": "San Francisco",
              "address_state": "CA",
              "address_zip": "94107",
              "address_country": "United States",
              "metadata": {},
              "date_created": "2017-06-12T22:59:28.582Z",
              "date_modified": "2017-06-12T22:59:28.582Z",
              "object": "address"
            },
            "from": {
              "id": "adr_d9a18b0f8eb19351",
              "description": "Test Address",
              "name": "Larry Lobster",
              "address_line1": "123 Test St",
              "address_line2": "Unit 1",
              "address_city": "San Francisco",
              "address_state": "CA",
              "address_zip": "94107",
              "address_country": "United States",
              "metadata": {},
              "date_created": "2017-06-12T22:59:28.583Z",
              "date_modified": "2017-06-12T22:59:28.583Z",
              "object": "address"
            },
            "message": null,
            "url": "https://s3-us-west-2.amazonaws.com/assets.lob.com/psc_0d6060bb12cbc646.pdf?AWSAccessKeyId=AKIAIILJUBJGGIBQDPQQ&Expires=1499945974&Signature=iXDanROUL7WIiKpBAr7wnSJ52T4%3D",
            "carrier": "USPS",
            "tracking_events": [{
              "id": "evnt_3acb6fd534261b2",
              "name": "In Transit",
              "location": "94107",
              "time": "2017-06-12T22:59:28.584Z",
              "date_created": "2017-06-12T22:59:28.584Z",
              "date_modified": "2017-06-12T22:59:28.584Z",
              "object": "tracking_event"
            }, {
              "id": "evnt_d9661474da8a86f",
              "name": "In Local Area",
              "location": "94107",
              "time": "2017-06-12T22:59:28.584Z",
              "date_created": "2017-06-12T22:59:28.584Z",
              "date_modified": "2017-06-12T22:59:28.584Z",
              "object": "tracking_event"
            }],
            "thumbnails": [{
              "small": "https://s3-us-west-2.amazonaws.com/assets.lob.com/psc_0d6060bb12cbc646_thumb_small_1.png?AWSAccessKeyId=AKIAIILJUBJGGIBQDPQQ&Expires=1499945974&Signature=Avw%2FQoSmjhvlFODbGs3WMFoszSM%3D",
              "medium": "https://s3-us-west-2.amazonaws.com/assets.lob.com/psc_0d6060bb12cbc646_thumb_medium_1.png?AWSAccessKeyId=AKIAIILJUBJGGIBQDPQQ&Expires=1499945974&Signature=ztT68BmhX8dVtm3wt6K1PWcro8U%3D",
              "large": "https://s3-us-west-2.amazonaws.com/assets.lob.com/psc_0d6060bb12cbc646_thumb_large_1.png?AWSAccessKeyId=AKIAIILJUBJGGIBQDPQQ&Expires=1499945974&Signature=vqlSTpWlpWv0yOZHKou7GSrhRhc%3D"
            }, {
              "small": "https://s3-us-west-2.amazonaws.com/assets.lob.com/psc_0d6060bb12cbc646_thumb_small_2.png?AWSAccessKeyId=AKIAIILJUBJGGIBQDPQQ&Expires=1499945974&Signature=%2BYcw9as9kLFMiKJviChIA5xqDIQ%3D",
              "medium": "https://s3-us-west-2.amazonaws.com/assets.lob.com/psc_0d6060bb12cbc646_thumb_medium_2.png?AWSAccessKeyId=AKIAIILJUBJGGIBQDPQQ&Expires=1499945974&Signature=PQ%2FtdWzmeeOYr32LaxturDzUedc%3D",
              "large": "https://s3-us-west-2.amazonaws.com/assets.lob.com/psc_0d6060bb12cbc646_thumb_large_2.png?AWSAccessKeyId=AKIAIILJUBJGGIBQDPQQ&Expires=1499945974&Signature=%2FByj%2FBLlBJp%2BFw8uymMT6HUCkzI%3D"
            }],
            "size": "4x6",
            "mail_type": "usps_first_class",
            "expected_delivery_date": "2017-06-20",
            "date_created": "2017-06-12T22:59:28.582Z",
            "date_modified": "2017-06-12T22:59:28.582Z",
            "object": "postcard"
          },
          "reference_id": "psc_0d6060bb12cbc646",
          "event_type": {
            "id": "postcard.in_local_area",
            "enabled_for_test": false,
            "resource": "postcards",
            "object": "event_type"
          },
          "date_created": "2017-06-13T11:39:34.356Z",
          "object": "event"
        }
        request({
            method: 'POST',
            headers: {
              'content-type': 'application/json'
            },
            url: base_url + '/v1/ping/eventlogger',
            body: JSON.stringify(requestBody)
          },
          function(err, response, body) {
            expect(err).to.be.null;
            expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
            body = JSON.parse(body);
            expect(response.statusCode).to.be.equal(201);

            expect(body.event_type).to.be.a('String');
            
            expect(body.endpoint).to.be.equal('/v1/ping/eventlogger');

            expect(body.event_type).to.be.equal(requestBody.event_type.id);
            done();
          });
      });
    });

  });

});
