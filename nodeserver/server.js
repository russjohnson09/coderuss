require('dotenv').config();

console.log('server start',Date.now());


// return;
var main = require('./main.js')({}, function(port) {
    console.log('server listening on port ' + port);
});
