var bodyParser = require('body-parser');
var express = require('express');
var extend = require('util')._extend;


var spawn = require('child_process').spawn;
// var cmd = 'ls server.js';
// var cwd = __dirname+'/node-todo';

// cmd = 'ls '+__dirname+'/node-todo';
cmd = 'npm';
args = ['start'];

var op = require('openport');


op.find(function(err, port) {
    if(err) { console.log(err); return; }
  // yea! we have an open port. 
    todoPort = port;
    var env = extend(process.env, { PORT: todoPort });    
    var child = spawn(cmd, args, {
        cwd: 'node-todo',
        env: env,
    }, function (err) {
        console.log(err);
    });
    child.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    child.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });

    child.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
    child.on('error', function (err) {
        console.log('dir error', err);
    });
});

// return;

// console.log(cmd);
// exec(cmd, function (error, stdout, stderr) {
//     console.log(error);
//     console.log(stdout);
//     console.log(stderr);
// });

// console.log(1);
// return;

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var envvars = process.env || {};

var params = {};
try {
    params = require(__dirname + '/params');
}
catch (e) {
}
var envparams = params.env || {};

envvars = extend(envvars, params.env);


var port = envvars.PORT || 3000;
const PORT = port;
var ip = envvars.IP || '0.0.0.0';
var init = envvars.INIT || false;

const NEXMO_API_KEY = envvars.NEXMO_API_KEY || '123';
const NEXMO_API_SECRET = envvars.NEXMO_API_SECRET || '123';
const NEXMO_BASE_URL = envvars.NEXMO_BASE_URL || 'http://localhost:3100';
const CONSOLE_LOG_LEVEL = envvars.CONSOLE_LOG_LEVEL || 'info';
const VOICE_API_BASE_URL = envvars.VOICE_API_BASE_URL || 'http://localhost:3000/api/v1/voice';
const PAPERTRAIL_LEVEL = envvars.PAPERTRAIL_LEVEL || 'warn';
const FTP_BASE = envvars.FTP_BASE || 'http://localhost';
const FTP_HOST = envvars.FTP_HOST || 'http://localhost';
const FTP_PASSWORD = envvars.FTP_PASSWORD || 'http://localhost';
const FTP_USER = envvars.FTP_USER || 'http://localhost';

const low = require('lowdb');
const fs = require('fs');
const path = require('path');
var winston = require('winston');

var Papertrail = require('winston-papertrail').Papertrail;
var winston = logger = new winston.Logger({
    transports: [
        new winston.transports.File({
            level: 'info',
            filename: path.join(__dirname, 'access.log'),
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.Console({
            level: CONSOLE_LOG_LEVEL,
            handleExceptions: true,
            json: true,
            colorize: true
        }),
        new Papertrail({
            handleExceptions: true,
            host: 'logs5.papertrailapp.com',
            port: 26785,
            program: 'nodeserver',
            level: PAPERTRAIL_LEVEL,
        })

    ],
    exitOnError: false
});

const PROTOCOL = envvars.PROTOCOL || 'http';
const ENDPOINT_PORT = envvars.ENDPOINT_PORT || port;
const HOST = envvars.HOST || 'localhost';
const BASE_URL = PROTOCOL + "://" + HOST + ':' + ENDPOINT_PORT;
const CRON_TIMER_SECONDS = envvars.CRON_TIMER_SECONDS || 300;

const MongoClient = require('mongodb').MongoClient;

const MONGO_CONNECTION = envvars.MONGO_CONNECTION || 'mongodb://localhost:27017/voice';
const MONGO_URI = envvars.MONGO_URI || 'mongodb://localhost:27017';


//voice application setup
var main_application;
MongoClient.connect(MONGO_CONNECTION, function (err, db) {
    mongo_db = db;
    addVoiceRouter();

});

function addVoiceRouter() {
    var voice = require('./v1/voice.js')({
        db: mongo_db, express: express, winston: winston,
        app: app, nexmo: {
            api_key: NEXMO_API_KEY, api_secret: NEXMO_API_SECRET,
            base_url: NEXMO_BASE_URL
        },
        base_url: VOICE_API_BASE_URL,
        main_application: main_application
    });
    app.use('/api/v1/voice', voice.router);
}

var morgan = require('morgan');


logger.stream = {
    write: function (message, encoding) {
        logger.log('debug', message);
    }
};

// create a write stream (in append mode)

// setup the logger
app.use(morgan('combined', { stream: logger.stream }));

app.use(express.static(path.join(__dirname, 'public/')));




var ping = require('./v1/ping.js')({});
var fileapi = require('./v1/files/main.js')({ winston: winston });
var ftp = require('./v1/ftp/main.js')({ winston: winston });
// var todo = require('./node-todo/main.js')({ app: app });

app.use('/api/v1/files', fileapi.router);
app.use('/api/v1/ping', ping.router);
// app.use('/api/v1/ftp', ftp.router); //not important

app.use('/ping', ping.router);

//contains listen for io to work
require('./dashboard/app.js')({ HOST: HOST, PORT: port, winston: winston, app: app });

var request = require('request');
var cron = require('node-cron');

cron.schedule('*/' + CRON_TIMER_SECONDS + ' * * * * *', function () {
    var url = BASE_URL + '/ping';
    request.get({
        headers: { 'X-PING': 'PING' },
        url: url,
        followRedirect: false
    }, function (error, response, body) {
    });
    request.post({
        headers: { 'X-PING': 'PING' },
        url: url,
        followRedirect: false
    }, function (error, response, body) {
    });
});



//proxy 
var https = require('https');
var http = require('http');
var proxy = require('http-proxy').createProxyServer();
request_body_array = [];


var privateKey = fs.readFileSync(__dirname + '/certs/localhost.key', 'utf8');
var certificate = fs.readFileSync(__dirname + '/certs/localhost.crt', 'utf8');
var credentials = { key: privateKey, cert: certificate };

var uuid = require('node-uuid');
http.
    createServer(
    function (req, res) {
        var proxyReq = req;
        var proxyRes = res;

        var proxy_uuid = uuid.v1();

        var url = require('url');
        var path = url.parse(proxyReq.url, true).pathname;
        if (path.indexOf('/todos') !== -1) {
            var target = 'http://0.0.0.0:' + todoPort + path.substr(6);
            // var target = 'http://localhost:' + todoPort + '/';
            winston.log('info', 'target:' + target);
            proxy.web(proxyReq, proxyRes, {
                target: target,
                secure: false,
                ignorePath: true,
                prependPath: false
            }, function (err) {
                winston.log('error', err);
                proxyRes.writeHead(502);
                proxyRes.end("There was an error. Please try again");
            });
        }
        else if (path.indexOf('/private/Downloads') !== -1) {
            var www_authenticate = require('www-authenticate');
            var authenticator = www_authenticate.authenticator(FTP_USER, FTP_PASSWORD);

            var options = {
                url: FTP_BASE + path,
                method: 'GET',
                path: path,
                rejectUnauthorized: false,
                headers: proxyReq.headers
            };
            request(options,
                function (err, res, body) {
                    console.log(res.statusCode);
                    console.log(res.headers);
                    console.log(body);
                    if (err) {
                        console.log(err);
                        return;
                    }
                    if (res.statusCode === 401) {
                        authenticator.get_challenge(res);
                        authenticator.authenticate_request_options(options);
                        proxyReq.headers['authorization'] = options.headers['authorization'];
                    }

                    console.log(options);
                    console.log(req.headers);

                    var target = FTP_BASE;

                    console.log(req.headers);

                    proxy.web(proxyReq, proxyRes, {
                        target: target,
                        secure: false
                    }, function (err) {
                        winston.log('error', err);
                        proxyRes.writeHead(502);
                        proxyRes.end("There was an error. Please try again");
                    });
                }
            );
        }
        else {
            var target = "http://localhost:" + app.get('port');
            winston.log('info', 'target:' + target);
            proxy.web(proxyReq, proxyRes, {
                target: target,
                secure: false
            }, function (err) {
                winston.log('error', err);
                proxyRes.writeHead(502);
                proxyRes.end("There was an error. Please try again");
            });
        }
    }
    ).listen(PORT, function () {
        winston.log('info', 'listening on port:' + PORT);
    });



proxy.on('proxyRes', function (res, req) {
    // var lvl = 'info';

    // console.log(res.headers);

    // var host = req.headers.host;
    // var data = [];
    // res.headers['proxy-uuid'] = req.headers['proxy-uuid'];

    // res.on('data', function (chunk) {
    //     data.push(chunk);
    // });
});