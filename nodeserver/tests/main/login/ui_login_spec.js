// https://github.com/webdriverio/webdriverio/blob/24764b920f6652852678b0390234f6dcc1e35daa/CONTRIBUTING.md

// sudo apt-get install oracle-java8-installer

// sudo apt-get install default-jre

// 
// sudo apt-get install default-jdk

// sudo apt-get install openjdk-7-jre
// wget http://selenium-release.storage.googleapis.com/3.3/selenium-server-standalone-3.3.1.jar

// npm install -g selenium-standalone phantomjs-prebuilt
// selenium-standalone install
// selenium-standalone start

//update-alternatives --config java

//sudo apt-get install oracle-java8-installer

const expect = require('chai').expect;
const webdriverio = require('webdriverio');

const BASE_URL = 'http://localhost:3000';

const SCREENSHOT_DIR = __dirname + '/../../screenshots/';


const path = require('path');
const url = require('url');

describe(path.basename(__filename), function() {

    this.timeout(5000);
    var client;

    before(function() {
        client = webdriverio.remote({
            desiredCapabilities: {
                browserName: 'phantomjs'
            }
        });
        return client.init().setViewportSize({
            width: 1920,
            height: 1080,
        });
    });

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

            describe('/v1/todos/public/', function() {
                it('wait for form#create-todo to be visible', function() {
                    return client.waitForVisible('form#create-todo').getUrl().then(function(val) {
                        expect(url.parse(val).pathname, 'on todo page').to.be.equal('/v1/todos/public/');
                    });
                });
                
                it('todo screenshot', function() {
                    return client.saveScreenshot(SCREENSHOT_DIR + Date.now() + '_todo.png');
                });
            });
        });


    });

    after(function() {
        return client.end();
    });
});
