'use strict';
const LOOPBACK_API_PORT = process.env.LOOPBACK_API_PORT || 0;

var loopback = require('loopback');
var boot = require('loopback-boot');

var app = module.exports = loopback();
app.set('port',LOOPBACK_API_PORT);

app.start = function() {
  // start the web server
  return app.listen(LOOPBACK_API_PORT,function(s) {
    app.emit('started');
    console.log(s);
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
