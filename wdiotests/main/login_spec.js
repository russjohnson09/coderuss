var expect = require('chai').expect;

var baseurl = "http://localhost:3000";
const BASE_URL = "http://localhost:3000";


const publicurl = baseurl;

describe('login', function() {
    it('open login page', function() {
        browser.url(publicurl + '/login');
        expect(browser.getUrl()).to.be.equal(publicurl + '/login/');
        // browser.screenshot();
    });

    it('should be able to login', function() {
        // filtering property commands
        // $('input[name=\'username\']').setValue('admin123456');
        // $('input[name=\'password\']').setValue('admin123456');

        browser.setValue('input[name=\'username\']', 'admin123456');
        browser.setValue('input[name=\'password\']', 'admin123456');

        expect(browser.getValue('input[name=\'username\']')).to.be.equal('admin123456');
        expect(browser.getValue('input[name=\'password\']')).to.be.equal('admin123456');

        expect(browser.isVisible('button.coderuss-login'));
        browser.click('button.coderuss-login');
        
        browser.waitForVisible('form#create-todo');
        
        expect(browser.getUrl()).to.be.equal(BASE_URL + '/v1/todos/public/');

        expect(browser.isVisible('form#create-todo'), 'todo form is visible').to.be.true;

    });
});
