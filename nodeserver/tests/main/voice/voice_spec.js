var request = require('request');
var expect = require("chai").expect;

const PORT = process.env.PORT || 3000;
baseurl = "http://localhost:" + PORT;


describe("Voice endpoints", function() {

  var url = baseurl + "/api/v1/voice/events?query_param=1";
  describe('/events', function() {
    it("returns status 201", function(done) {
      request({
        method: "POST",
        json: {
          "event": 1
        },
        uri: url
      }, function(error, response, body) {
        expect(error).to.be.equal(null);
        expect(response.statusCode).to.equal(201);
        console.log(response.headers);
        expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
        done();
      });
    });
  });

  describe('/answers', function() {
    it("returns status 201", function(done) {
      var url = baseurl + "/api/v1/voice/answers?query_param=1";

      request({
        method: "GET",
        json: {
          "event": 1
        },
        uri: url
      }, function(error, response, body) {
        expect(error).to.be.equal(null);
        expect(response.statusCode).to.equal(200);
        console.log(response.headers);
        expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
        done();
      });
    });
  });

});
