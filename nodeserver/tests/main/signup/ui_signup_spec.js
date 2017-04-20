const expect = require('chai').expect;
const webdriverio = require('webdriverio');

const BASE_URL = 'http://localhost:3000';

const SCREENSHOT_DIR = __dirname + '/../../screenshots/';


const path = require('path');
const url = require('url');
const crypto = require('crypto');

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

    describe('/singup', function() {

        describe('open page', function() {
            it('client.url getUrl', function() {
                return client.url(BASE_URL + '/signup/')
                    //https://github.com/AtomLinter/linter-eslint/issues/210
                    // .getUrl() //chaining this was causing issues
                    .then(
                        function(val) {
                            // expect(val).to.be.equal(BASE_URL + '/login/');
                        });
            });
            it('client.url getUrl', function() {
                return client.getUrl()
                    .then(
                        function(val) {
                            var parsedUrl = url.parse(val);
                            expect(parsedUrl.path).not.to.be.undefined;
                            expect(parsedUrl.path).to.be.equal('/signup/');
                        });
            });
        });


        describe('check form visibility', function() {
            it('form visible', function() {
                return client.isVisible('form').then(function(val) {
                    expect(val).to.be.true;
                })
            })
        });

        describe.skip('negative test', function() {
            describe('invalid submissons', function() {
                describe('email is invalid', function() {
                    it('email', function() {
                        username = 'user' + crypto.randomBytes(8).toString('hex');
                        var input_selector = 'input[name=\'email\']',
                            input_value = username;
                        return client.setValue(input_selector, input_value).getValue(input_selector).then(function(v) {
                            expect(v).to.be.equal(input_value);
                        });
                    });

                    it('password too short')

                })
            })
        })

        describe('fill singup form', function() {
            it('email', function() {
                username = 'user' + crypto.randomBytes(8).toString('hex') + '@foo.com';
                var input_selector = 'input[name=\'email\']',
                    input_value = username;
                return client.setValue(input_selector, input_value).getValue(input_selector).then(function(v) {
                    expect(v).to.be.equal(input_value);
                });
            });

            it('password', function() {
                var input_selector = 'input[name=\'password\']',
                    input_value = 'password';
                return client.setValue(input_selector, input_value).getValue(input_selector).then(function(v) {
                    expect(v).to.be.equal(input_value);
                });
            });

            it('singup postfill screenshot', function() {
                return client.saveScreenshot(SCREENSHOT_DIR + '1_signup_postfill.png');
            });
        });

        describe('submit singup form', function() {
            var login_button = 'button*=Sign up';
            it('click ' + login_button, function() {
                return client.click(login_button);
            });

            describe('/v1/todos/public/', function() {
                it('wait for form#create-todo to be visible', function() {
                    return client.waitForVisible('form#create-todo').getUrl().then(function(val) {
                        expect(url.parse(val).pathname, 'on todo page').to.be.equal('/v1/todos/public/');
                    });
                });

                // it('todo screenshot', function() {
                //     return client.saveScreenshot(SCREENSHOT_DIR + Date.now() + '_todo.png');
                // });
            });
        });

        describe('/signup', function() {
            it('url=/signup', function() {
                return client.url(BASE_URL + '/signup/')
                    // .then(
                    //     function(val) {
                    //     });
            });
            it('getUrl', function() {
                return client.getUrl()
                    .then(
                        function(val) {
                            var parsedUrl = url.parse(val);
                            expect(parsedUrl.path).not.to.be.undefined;
                            expect(parsedUrl.path).to.be.equal('/signup/');
                        });
            });

            describe('submit sigunup form existing user bad password', function() {
                it('email', function() {
                    var input_selector = 'input[name=\'email\']',
                        input_value = username;
                    return client.setValue(input_selector, input_value).getValue(input_selector).then(function(v) {
                        expect(v).to.be.equal(input_value);
                    });
                });

                it('password', function() {
                    var input_selector = 'input[name=\'password\']',
                        input_value = 'badpassword';
                    return client.setValue(input_selector, input_value).getValue(input_selector).then(function(v) {
                        expect(v).to.be.equal(input_value);
                    });
                });

                it('waitForVisible notification', function() {
                    var selector = 'div.noty_body';

                    client.waitForVisible(selector)
                        .isVisible(selector).then(function(val) {
                            expect(val).to.be.true;
                        })
                })

                it('singup postfill screenshot', function() {
                    return client.saveScreenshot(SCREENSHOT_DIR + '10_signup_postfill_bad_password.png');
                });
                
                it.skip('notification closes');
                
                it.skip('notification redirects to login');
            })
        })



    });

    after(function() {
        return client.end();
    });
});
