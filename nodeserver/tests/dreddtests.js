let initilize = function(opts) {

    // C:\Users\lain\PhpstormProjects\coderuss\nodeserver\public\v1-swagger.yml
    var self = {};
    var Dredd = require('dredd');
    var configuration = {
        server: "http://127.0.0.1:3000",
        options: {
            path: __dirname + "./../public/v1-swagger.yml",
            // endpoint: 'http://localhost:3000',
            sandbox: true,
            hookfiles: [__dirname + './hooks/v1-hook.js']
        }
    };
    var dredd = new Dredd(configuration);

    self.run = function(cb) {
        cb = cb || function() {};
        dredd.run(function (error, stats) {
            console.log(error,stats);
            cb(error,stats);
            // your callback code here
        });
    };

    return self;
};

module.exports = initilize;


if (!module.parent) {
    d = initilize({});

    d.run();

}