var expect = require('chai').expect;

var baseurl = "http://localhost:3000";

const publicurl = baseurl;

describe('login', function() {
    it('open login page', function() {
        browser.url(publicurl+'/login');
        // expect(browser.getUrl()).to.be.equal(publicurl+'/url'+1);
        browser.screenshot();
    })
    it('should be able to login', function () {
        // filtering property commands
        $('input[name=\'username\']').setValue('admin123456');
        $('input[name=\'password\']').setValue('admin123456');

        console.log('clicking button');
        browser.click('button.coderuss-login');

        browser.waitForVisible('form#create-todo');

        expect(browser.isVisible('form#create-todo'),'todo form is visible').to.be.true;

    });
});