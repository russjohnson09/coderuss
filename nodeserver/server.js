require('dotenv').config();



// return;
var main = require('./main.js')({}, function(port) {
    console.log('server listening on port ' + port);
});
