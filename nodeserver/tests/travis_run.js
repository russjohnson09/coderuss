//run all tests under a single process
require('dotenv').config();

fs = require('fs'),
path = require('path');
const cp = require('child_process');
const spawn = cp.spawn;

require('dotenv').config();



var main = require(__dirname + './../main.js')({}, function(port) {
    console.log('server listening on port ' + port);
    var child = spawn("npm",['run','test:main'],{ cwd: __dirname, env: process.env });

    child.stdout.on('data', function(data) {
        process.stdout.write(data);
    });

    child.stderr.on('data', function(data) {
        process.stderr.write(data);
        // process.exit(1);
    });
    child.on('exit', function(exitcode) {
        process.exit(exitcode);
        if (exitcode) {
            
        }
    })


});
