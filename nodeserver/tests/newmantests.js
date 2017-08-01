let initilize = function(opts) {

    var newman = require('newman'); // require newman in your project



    self.run = function(cb) {
        newman.run({
            collection: require('./coderuss_v1_ping.postman_collection.json'),
            reporters: 'cli'
        }, function (err) {
            if (err) { throw err; }
            console.log('collection run complete!');
        });
    };

    return self;
};

module.exports = initilize;


if (!module.parent) {
    d = initilize({});

    d.run();

}