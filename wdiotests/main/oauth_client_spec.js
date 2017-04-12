var expect = require('chai').expect;
const path = require('path');

var baseurl = "http://localhost:3000";
const BASE_URL = "http://localhost:3000";

const publicurl = baseurl;

const SCREENSHOTS_DIR = __dirname + '/screenshots';

console.log(SCREENSHOTS_DIR);



describe(path.basename('oauth_client_spec'), function() {
    it('open login page', function() {
        return new Promise(function(resolve, reject) {
            browser.url(publicurl + '/login');
            resolve();
        });
    });

    it('should be able to login', function() {
        // filtering property commands
        $('input[name=\'username\']').setValue('admin123456');
        $('input[name=\'password\']').setValue('admin123456');

        console.log('clicking button');
        browser.click('button.coderuss-login');

        browser.waitForVisible('form#create-todo');

        expect(browser.isVisible('form#create-todo'), 'todo form is visible').to.be.true;
    });

    describe('create an oauthclient', function() {
        describe('go to oauthclient page', function() {
            it('browser url', function() {
                browser.url(BASE_URL + '/oauthclient');
            });
            it('/oauthclient validate', function() {
                expect(browser.isVisible('.coderuss-oauthclient-submit')).to.be.true;
            });
        });

        describe('submit oauthclient', function() {
            it('/oauthclient validate', function() {
                expect(browser.isVisible('.coderuss-oauthclient-submit')).to.be.true;
                browser.click('.coderuss-oauthclient-submit');
                // console.log(SCREENSHOTS_DIR);
                browser.saveScreenshot(SCREENSHOTS_DIR + '/oauth-client-submit.png');

                oauthClient = JSON.parse($$('.oauthclient-json')[0].getText());

                // expect($('.oauthclient-json')[0]).not.to.be.undefined;

                // oauthClient = JSON.parse($('.oauthclient-json')[0].innerText);


            });
        })
    });

    describe('get code from client', function() {
        it('/v1/oauth/authorize with client_id, redirect_uri, and state', function() {
            var client_id = encodeURI(oauthClient._id);
            expect(client_id).not.to.be.undefined;

            var url = BASE_URL + '/v1/oauth/authorize?state=1&client_id=' + client_id + '&redirect_uri=' + BASE_URL;
            expect(url).to.be.a('string');

            console.log(url);
            browser.url(url);
        });

        it('save screenshot', function() {
            browser.saveScreenshot(SCREENSHOTS_DIR + '/v1-oauth-authorize.png');
        });
    })
})
