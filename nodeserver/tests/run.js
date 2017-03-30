//node v2/devices/run_device_tests.js 2>&1 | tee ./mocha_output.log
//unbuffer node v2/devices/run_device_tests.js 2>&1 | tee ./mocha_output.log
require('dotenv').config();

var Mocha = require('mocha'),
    fs = require('fs'),
    path = require('path');


process.on('uncaughtException', function(err) {

    // winston.error('uncaughtException', { message: err.message, stack: err.stack }); // logging with MetaData
    // process.exit(1); // exit with failure
});

// console.log(process.env.NODE_ENV);
// return;

// process.env.CONSOLE_LOG_LEVEL = process.env.CONSOLE_LOG_LEVEL || 'warn';

// Instantiate a Mocha instance.
var mocha = new Mocha({
    // ui: 'tdd',
    reporter: 'list',
    ignoreLeaks: true,
    bail: false
});

mocha.bail(false);

runners = [];
endedCount = 0;

startCount = 0;

failCount = 0;

function addTest(file) {

    mocha.addFile(file);
}

var testOptions = {
    filter: function(val) {
        return val.substr(-8) == '_spec.js';
    }
};

testOptions.directory = __dirname + '/main';

require('dotenv').config();

// dry-run: null
// hookfiles: null
// language: nodejs
// sandbox: false
// init: false
// custom:
//   apiaryApiKey: ''
// names: false
// only: []
// reporter: apiary
// output: []
// header: []
// sorted: false
// user: null
// inline-errors: false
// details: false
// method: []
// color: true
// level: info
// timestamp: false
// silent: false
// path: []
// hooks-worker-timeout: 5000
// hooks-worker-connect-timeout: 1500
// hooks-worker-connect-retry: 500
// hooks-worker-after-connect-wait: 100
// hooks-worker-term-timeout: 5000
// hooks-worker-term-retry: 500
// hooks-worker-handler-host: localhost
// hooks-worker-handler-port: 61321
// blueprint: ./nodeserver/public/v1-swagger.yml
// endpoint: 'http://localhost:3000'

var main = require(__dirname + './../main.js')({}, function(port) {
    console.log('server listening on port ' + port);
    var Dredd = require('dredd');
    var dredd = new Dredd({
        'server': 'http://localhost:3000',
        'options': {
            'path': [__dirname+'/../public/v1-swagger.yml']
        }
    });
    testSuitesRanCount = 0;

    dredd.run(function(err, stats) {
        
        // return;
        testSuitesRanCount++;
        if (err) {
            console.log(err);
            return process.exit(1);
        }
        return process.exit(0);
        // if(testSuitesRanCount === expectedTestSuiteCount) {
        // return process.exit(0);
        // }

        (function(opts, callback) {
            var done = false;
            var readdirCount = 0;
            count = 0;
            var readdir = function(dir) {
                readdirCount++;
                fs.readdir(dir, function(err, files) {
                    count += files.length;
                    files.forEach(function(file) {
                        file = path.join(dir, file);
                        fs.stat(file, function(err, stats) {
                            if (stats.isDirectory()) {
                                count--;
                                readdirCount--;
                                readdir(file);
                                return;
                            }

                            if (file.substr(-8) === '_spec.js') {
                                console.log('added ' + file);
                                // addTest(file);
                                mocha.addFile(file);
                            }
                            count--;
                            console.log(count);
                            // console.log(count);
                            if (count == 0) {
                                readdirCount--;
                                if (readdirCount == 0) {
                                    callback();
                                }
                            }
                        });
                    });
                });
            }
            readdir(opts.directory);
        })(testOptions, function() {
            startCount++;
            console.log('start tests');
            console.log(startCount);

            var runner = mocha.run(function(failures) {
                process.on('exit', function() {
                    console.log('on exit');
                    process.exit(failures);
                })
            });

            runner.on('pass', function(test, err) {})


            runner.on('fail', function(test, err) {
                // console.log(test);
            })

            runner.on('end', function() {
                // console.log('end');
                process.exit(0);
            })
        });
    });



});
