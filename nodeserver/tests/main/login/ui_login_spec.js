require('dotenv').config();


const expect = require('chai').expect;
const webdriverio = require('webdriverio');

const BASE_URL = 'http://localhost:3000';

const SCREENSHOT_DIR = __dirname + '/../../screenshots/';

//10.0.2.2
const WEBDRIVER_BROWSER = process.env.WEBDRIVER_BROWSER || 'phantomjs';
const WEBDRIVER_HOST = process.env.WEBDRIVER_HOST || '127.0.0.1';
// const WEBDRIVER_PORT = process.env.WEBDRIVER_PORT || '8443';



const path = require('path');
const url = require('url');

describe(path.basename(__filename), function() {

    this.timeout(5000);
    var client;

    describe('initialize client', function() {
        it('start client', function() {
            var desiredCapabilities = {
                browserName: WEBDRIVER_BROWSER,
                host: WEBDRIVER_HOST,
                // port: WEBDRIVER_PORT
            };
            console.log(desiredCapabilities);
            client = webdriverio.remote(
                desiredCapabilities);
            return client.init();
            // .setViewportSize({
            //     width: 1920,
            //     height: 1080,
            // });
        })
    })

    describe('/login', function() {

        describe('open page', function() {
            it('client.url getUrl', function() {
                return client.url(BASE_URL + '/login/').getUrl().then(function(val) {
                    expect(val).to.be.equal(BASE_URL + '/login/');
                });
            })
        });
        describe('check form visibility', function() {
            it('form visible', function() {
                return client.isVisible('form').then(function(val) {
                    expect(val).to.be.true;
                })
            })
        })
        describe('fill login form', function() {
            it('username', function() {
                var input_selector = 'input[name=\'username\']',
                    input_value = 'admine123456';
                return client.setValue(input_selector, input_value).getValue(input_selector).then(function(v) {
                    expect(v).to.be.equal(input_value);
                });
            });

            it('password', function() {
                var input_selector = 'input[name=\'password\']',
                    input_value = 'admine123456';
                return client.setValue(input_selector, input_value).getValue(input_selector).then(function(v) {
                    expect(v).to.be.equal(input_value);
                });
            });

            it('login postfill screenshot', function() {
                return client.saveScreenshot(SCREENSHOT_DIR + Date.now() + '_login_postfill.png');
            });
        });

        describe('submit login form', function() {
            var login_button = 'button*=Login';
            it('click ' + login_button, function() {
                return client.click(login_button);
            });

//http://www.guru99.com/alert-popup-handling-selenium.html
            describe('/v1/todos/public/', function() {
                it('wait for form#create-todo to be visible', function() {
                    return client.waitForVisible('form#create-todo',5000).getUrl().then(function(val) {
                        expect(url.parse(val).pathname, 'on todo page').to.be.equal('/v1/todos/public/');
                    });
                });

                it('todo screenshot', function() {
                    return client.saveScreenshot(SCREENSHOT_DIR + Date.now() + '_todo.png');
                });
            });
        });


    });
});
