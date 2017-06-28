require('dotenv').config();


const expect = require('chai').expect;
const webdriverio = require('webdriverio');

const BASE_URL = 'http://localhost:3000';

const SCREENSHOT_DIR = __dirname + '/../../screenshots/';

//10.0.2.2
const WEBDRIVER_BROWSER = process.env.WEBDRIVER_BROWSER || 'firefox';
const WEBDRIVER_HOST = process.env.WEBDRIVER_HOST || '127.0.0.1';



const path = require('path');
const url = require('url');
const request = require('request');

describe(path.basename(__filename), function() {

    this.timeout(5000);
    var client;

    describe('initialize client', function() {
        console.log(WEBDRIVER_BROWSER,WEBDRIVER_HOST);
        it('start client', function() {
            client = webdriverio.remote({
                host: WEBDRIVER_HOST,

                desiredCapabilities: {
                    browserName: WEBDRIVER_BROWSER,
                }
            });
            return client.init();
        })
    });
    
    
    describe("/my-app GET", function() {
        it("/my-app GET 200", function(done) {
          request({
            method: "GET",
            uri: BASE_URL + '/my-app',
            // followRedirect: false,
            // headers: {
            //   Cookie: cookie
            // }
          }, function(error, response, body) {
            console.log(body);
            expect(error).to.be.equal(null);
            expect(response.statusCode).to.equal(200);
            done();
          });
        });
      });


    describe('/my-app', function() {

        describe('open page', function() {
            it('client.url getUrl', function() {
                return client.url(BASE_URL + '/my-app/').getUrl().then(function(val) {
                    expect(val).to.be.equal(BASE_URL + '/my-app/');
                });
            })
        });
        //Here are some links to help you start
        describe('hello world visible', function() {
            it('hello world visible', function() {
                return client.waitForVisible('h2*=Here are some links').isVisible('h2*=Here are some links').then(function(val) {
                    expect(val).to.be.true;
                })
            })
        });


    });
});
