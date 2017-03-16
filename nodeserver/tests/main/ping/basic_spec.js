var request = require('request');
var expect = require("chai").expect;
const PORT = process.env.PORT || 3000;
baseurl = "http://localhost:" + PORT;

describe("API", function() {

  describe("Ping endpoint tests", function() {

    var url = baseurl + "/v1/ping";
    it("returns status 200", function(done) {
      request(url, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it("returns has success in response body", function(done) {
      request(url, function(error, response, body) {
        expect(JSON.parse(response.body).status).to.equal('success');
        done();
      });
    });

  });

});
