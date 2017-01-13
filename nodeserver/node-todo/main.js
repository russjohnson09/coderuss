module.exports = function (opts) {

    var mainApp = opts.app;
    // set up ======================================================================
    var express = require('express');
    var app = express(); 						// create our app w/ express
    var mongoose = require('mongoose'); 				// mongoose for mongodb
    var port = process.env.PORT || 0; 				// set the port
    var database = require('./config/database'); 			// load the database config
    var morgan = require('morgan');
    var bodyParser = require('body-parser');
    var methodOverride = require('method-override');

    const MONGO_CONNECTION = process.env.MONGO_CONNECTION || 'mongodb://localhost:27017/voice';


    // configuration ===============================================================
    mongoose.connect(MONGO_CONNECTION); 	// Connect to local MongoDB instance. A remoteUrl is also available (modulus.io)

    app.use(express.static('./public')); 		// set the static files location /public/img will be /img for users
    app.use(morgan('dev')); // log every request to the console
    app.use(bodyParser.urlencoded({'extended': 'true'})); // parse application/x-www-form-urlencoded
    app.use(bodyParser.json()); // parse application/json
    app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
    app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request

    var router = express.Router();

    // routes ======================================================================
    var todoRoutes = require('./app/routes.js')(router);
    console.log(todoRoutes);
    // app.use('/todos',todoRoutes);


    // listen (start app with node server.js) ======================================
    var s = app.listen(port);
    console.log("App listening on port " + s.address().port);
    mainApp.set('todo-port', s.address().port);
    // console.log(server);

}
