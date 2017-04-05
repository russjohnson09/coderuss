var expect = require('chai').expect;
const path = require('path');

var baseurl = "http://localhost:3000";
const BASE_URL = "http://localhost:3000";

const publicurl = baseurl;

const SCREENSHOTS_DIR = __dirname + '/screenshots';

console.log(SCREENSHOTS_DIR);

describe(path.basename('oauth_client_spec'), function() {
    it('open login page', function() {
        browser.url(publicurl + '/login');
        // expect(browser.getUrl()).to.be.equal(publicurl+'/url'+1);
        browser.screenshot();
    })
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
                console.log(SCREENSHOTS_DIR);
                browser.saveScreenshot(SCREENSHOTS_DIR+'/oauth-client-submit.png');
            });
        })
    });
})
