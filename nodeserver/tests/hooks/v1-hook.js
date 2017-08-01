var hooks = require('hooks');


hooks.log('loaded hooks');

hooks.beforeAll(function (transactions, done) {
    hooks.log('before all',transactions);
    done();
});


hooks.beforeEach(function (transaction) {
    hooks.log('before each');
});