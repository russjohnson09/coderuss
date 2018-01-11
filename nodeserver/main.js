require('dotenv').config();

const low = require('lowdb');
const fs = require('fs');
const path = require('path');
var winston = require('winston');
const querystring = require('querystring');
const passport = require('passport');
const request = require('request');
process.env.NODE_ENV = process.env.NODE_ENV || 'DEV';
const NODE_ENV = process.env.NODE_ENV;
const CONTEXT = 'coderuss_' + NODE_ENV;
const LOGSENE_LOG_TYPE = CONTEXT;
const TRAVIS_MASTER_BRANCH = "https://api.travis-ci.org/repos/russjohnson09/coderuss/branches/master";
const THEMOVIEDB_BASE_URL = process.env.THEMOVIEDB_BASE_URL;
const THEMOVIEDB_API_KEY = process.env.THEMOVIEDB_API_KEY;
const CODERUSS_BASE_URL = process.env.CODERUSS_BASE_URL;
const CODERUSS_EXIT_ON_ERROR = process.env.CODERUSS_EXIT_ON_ERROR || false;

const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const async = require('async');
const URL = require('url'); //url package
const expect = require('chai').expect;
var ObjectID = require('mongodb').ObjectID;

var sinon = require('sinon');
var cron = require('node-cron');
var clock;
var tvshownotificationTask;
var moment = require('moment-timezone');

let MiscService = {};





var loopback = require('loopback');


winston.transports.Logsene = require('winston-logsene');

const cp = require('child_process');
const spawn = cp.spawn;

var root = path.normalize('..');
var bodyParser = require('body-parser');
var express = require('express');

const www_authenticate = require('www-authenticate');


var extend = require('util')._extend;

const USERS_LOG_LEVEL = process.env.USERS_LOG_LEVEL || 'error';

const ZORK_LOG_LEVEL = process.env.ZORK_LOG_LEVEL || 'error';

const CONSOLE_LOG_LEVEL = process.env.CONSOLE_LOG_LEVEL || 'warn';
const ACCESS_LOG_LEVEL = process.env.ACCESS_LOG_LEVEL || 'info';
const TODO_LOG_LEVEL = process.env.TODO_LOG_LEVEL || 'error';
const PROXY_LOG_LEVEL = process.env.PROXY_LOG_LEVEL || 'error';
const ALEX_CONSOLE_LOG_LEVEL = process.env.ALEX_CONSOLE_LOG_LEVEL || 'debug';

const NEXMO_API_KEY = process.env.NEXMO_API_KEY || '123';
const NEXMO_API_SECRET = process.env.NEXMO_API_SECRET || '123';
const NEXMO_BASE_URL = process.env.NEXMO_BASE_URL || 'http://localhost:3100';
const VOICE_API_BASE_URL = process.env.VOICE_API_BASE_URL || 'http://localhost:3000/api/v1/voice';
const PAPERTRAIL_LEVEL = process.env.PAPERTRAIL_LEVEL || 'warn';

const FTP_BASE = process.env.FTP_BASE || 'http://localhost';
const FTP_PASSWORD = process.env.FTP_PASSWORD || 'guest';
const FTP_USER = process.env.FTP_USER || 'guest';
const FTP_AUTHENTICATOR = www_authenticate.authenticator(FTP_USER, FTP_PASSWORD);



const MONGO_URI = process.env.MONGO_URI;

const PROTOCOL = process.env.PROTOCOL || 'http';
const HOST = process.env.HOST || 'localhost';
const CRON_TIMER_SECONDS = process.env.CRON_TIMER_SECONDS || 300;
const MONGO_CONNECTION = MONGO_URI;

const alexa = require(__dirname + '/v1/alexa');

var exceptionHandlers;
// if (process.env.NODE_ENV == 'DEV') {
//     exceptionHandlers == null;
// }
// else {
    exceptionHandlers = [
        new winston.transports.File({
            filename: path.join(__dirname, 'exceptions.log'),
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        }),
        // new winston.transports.Console({
        //     colorize: true,
        //     json: true
        // })
    ];

// }



function createAlexaApp(app) {
    alexa(app);
}

function initLoopBack() {
    var loopbackApp = require(__dirname + '/v2/loopback/server/server');
    loopbackApp.start();

    return loopbackApp;
}

module.exports = function(opts, callback) {

    var loopbackApp = initLoopBack();

    var module = {};

    const PORT = process.env.PORT || 3000;

    const PROXIED_PORT = process.env.PROXIED_PORT || 0;

    var app = express();

    app.use(function(req,res,next) {
        //req.fresh  last-modified no-cache logic
        //req.subdomains
        //req.xhr
        //req.query {}

        //req.get('content-type')
        //req.params
        console.log('start');

        //res.headersSent

        console.log('headerssent',req.headersSent);

        let timeoutSecs = 1;

        setTimeout(function() {
            let route = JSON.stringify(req.route);

            console.log('headerssent',req.headersSent);
            mainLogger.warn('timeout of ' + timeoutSecs + ' reached',req.originalUrl,route);

            // console.log('timeout of ' + timeoutSecs + ' reached');
        },timeoutSecs * 1000);
        next();
    });

    if (process.env.LOGSENE_TOKEN) {
        app.set('logsene_token', process.env.LOGSENE_TOKEN);
    }


    app.set('commit', '');

    app.set('CONTEXT',CONTEXT);


    request.get({
        url: TRAVIS_MASTER_BRANCH
    }, function(error, response, body) {
        if (response.statusCode < 400) {
            var commit = JSON.parse(body).commit.sha;
            app.set('commit', commit);
        }
        winston.info(app.get('commit'), {
            'type': 'commit'
        });
    });

    var transports = getMainLoggerTransports();
    var mainLogger = new winston.Logger({
        transports: transports,
        exceptionHandlers: exceptionHandlers,
        exitOnError: CODERUSS_EXIT_ON_ERROR
    });

    mainLogger.info('test');


    var morgan = require('morgan');

    mainLogger.info('setting up morgan logging to winston');
    mainLogger.stream = {
        write: function(message, encoding) {
            mainLogger.info(message);
        }
    };

    app.set('winston', mainLogger);

    app.set('serverstarted', Date.now());

    createAlexaApp(app);

    app.use("/tryit",
        express.static(
            path.join(__dirname, "/swagger-ui-master/dist")
        )
    );


    var server = require('http').Server(app);
    io = require('socket.io')(server);
    var server = server.listen(PROXIED_PORT, function() {
        winston.info('main application listening on port: ' + server.address().port);
        app.set('port', server.address().port);
        setupProxy();
    });

    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());

    const cookieParser  = require('cookie-parser');

    app.use(cookieParser());

    var expressSession = require('express-session');

    var sessionMiddleware = expressSession({
        secret: process.env.EXPRESS_SESSION_SECRET,
        store: new(require("connect-mongo")(expressSession))({
            url: MONGO_URI
        })
    });
    app.use(sessionMiddleware);


    app.use(passport.initialize());
    app.use(passport.session());


    // app.use(function(req, res, next) {
    //     res.setHeader("x-context", app.get('CONTEXT'));
    //     // req.session.context = app.get('CONTEXT');
    //
    //     //unsafe cookie allowed for context
    //     res.cookie('context',app.get('CONTEXT'), { maxAge: 900000, httpOnly: false });
    //
    //     return next();
    // });


    winston.info(root, {
        'root': root
    });

    winston.info(__dirname + '/../.apt/usr/games/frotz');

    const frotzcmd = getFrotzCmd();
    winston.info(frotzcmd, {
        'frotz': frotzcmd
    });
    var args = [__dirname + "/v1/zork/Zork/DATA/ZORK1.DAT", '-i', '-p', '-q']

    var child = spawn(frotzcmd, args);

    child.stdout.on('data', function(data) {
        winston.debug(data);
    });

    child.stderr.on('data', function(data) {
        winston.error('stderr: ' + data.toString());
        // process.exit(1);
    });


    app.use(morgan('combined', {
        stream: mainLogger.stream
    }));


    var proxyLogger = mainLogger;

    mainLogger.info("console_log_level:" + CONSOLE_LOG_LEVEL);


    const MongoClient = require('mongodb').MongoClient;



    var main_application;
    var database;
    MongoClient.connect(MONGO_CONNECTION, function(err, db) {
        require('./migrations/migrations')({
            winston: mainLogger,
            database: db
        }, function() {
            database = mongo_db = db;
            todosnsp = io.of('/v1/todos');

            let OauthToken = database.collection('oauth_token');
            let User = database.collection('user');

            addOauth(OauthToken,User);

            addLoginRouter();

            //the order that these routes is applied in goes top down.
            //I need to make sure more specific routes are before the
            // /v1/users general route.
            // A better solution is probably just to have /v1admin route
            // or some better role/routing control.
            app.use('/v1/users/me',  require(__dirname + '/v1/addresses/addresses')({
                CODERUSS_BASE_URL: CODERUSS_BASE_URL,
                winston: winston,
                db: db,
                User: db.collection('user'),
            }));


            let UserService = require(__dirname + '/v1/users/main')({
                winston: mainLogger,
                database: database,
                passport: passport,
                // TransactionService: TransactionService,
            });

            let TransactionService = require(__dirname + '/v1/admin/transactions/transactions')({
                UserService: UserService,
                BASE_URL: CODERUSS_BASE_URL + '/v1/admin/transaction',
                CODERUSS_BASE_URL: CODERUSS_BASE_URL,
                winston: winston,
                User: db.collection('user'),
                db: db
            });

            MiscService =  require(__dirname + '/v1/misc/misc')({
                winston: mainLogger,
                database: database,
                passport: passport,
                adminlogsNsp: io.of('/v1/adminlogs'),
                CODERUSS_BASE_URL: 'http://localhost:3000',
                sessionMiddleware: sessionMiddleware,
                // User: db.collection('user'),
                tcpPort: 3000,
                UserService: UserService
            });

            UserService.addTransaction =  TransactionService.addTransaction;

            app.use('/v1/users',UserService.router);


            app.use('/v1',MiscService.router);


            app.use('/v1/fitbit', require(__dirname + '/v1/fitbit/fitbit')({
                FITBIT_CLIENT_ID: process.env.FITBIT_CLIENT_ID,
                FITBIT_CLIENT_SECRET: process.env.FITBIT_CLIENT_SECRET,
                BASE_URL: CODERUSS_BASE_URL + '/v1/fitbit',
                CODERUSS_BASE_URL: CODERUSS_BASE_URL,
                winston: winston,
                User: db.collection('user')
            }));

            app.use('/v1/admin/transaction', function (req, res, next) {
                winston.info('user',{_id: req.user._id + ''});
                next();
            },  TransactionService.router);

            app.use('/v1/googlefit', require(__dirname + '/v1/googlefit/googlefit')({
                CLIENT_ID: process.env.GOOGLE_FIT_CLIENT_ID,
                CLIENT_SECRET: process.env.GOOGLE_FIT_CLIENT_SECRET,
                BASE_URL: CODERUSS_BASE_URL + '/v1/fitbit',
                CODERUSS_BASE_URL: CODERUSS_BASE_URL,
                winston: winston,
                User: db.collection('user')
            }));

            addLogseneRouter();
            addFaxRouter();
            addPostcardRouter(TransactionService);
            addProxyRouter();
            addShewasprettyRouter();
            addTvShowsRouter();



            addSelftestRouter();

            addVoiceRouter();
            addTodosRouter();
            addHabitsRouter();
            addGithubRouter();
            addZorkRouter();
            addDeployRouter();


            var Init = db.collection('init');

            Init.insert({
                    server_start: Date.now()
                },
                function(err, result) {
                    if (err) mainLogger.error(err);
                    mainLogger.info(JSON.stringify(result.ops));
                });
        })
    });

    app.use(express.static(path.join(__dirname, 'public/')));
    
    app.use('/my-app',express.static(path.join(__dirname,'..', 'my-app','dist')));

    var uuid = require('node-uuid');




    function setupProxy() {
        var ping = require('./v1/ping.js')({
            app: app,
            winston: mainLogger
        });
        var fileapi = require('./v1/files/main.js')({
            winston: mainLogger
        });
        var ftp = require('./v1/ftp/main.js')({
            winston: mainLogger
        });

        app.use('/api/v1/files', fileapi.router);

        app.use('/v1/ping', ping.router);

        app.use('/ping', ping.router);

        var request = require('request');
        var cron = require('node-cron');

        if (process.env.PING_URL) {
            cron.schedule('*/' + 10 + ' * * * * *', function() {
                var url = process.env.PING_URL;
                request.get({
                    headers: {
                        'X-PING': 'PING'
                    },
                    url: url,
                    followRedirect: false
                }, function(error, response, body) {});
                request.post({
                    headers: {
                        'X-PING': 'PING'
                    },
                    url: url,
                    followRedirect: false
                }, function(error, response, body) {});
            });
        }




        //proxy 
        var https = require('https');
        var http = require('http');
        var httpProxy = require('http-proxy');
        var proxy = httpProxy.createProxyServer();

        request_body_array = [];


        var privateKey = fs.readFileSync(__dirname + '/certs/localhost.key', 'utf8');
        var certificate = fs.readFileSync(__dirname + '/certs/localhost.crt', 'utf8');
        var credentials = {
            key: privateKey,
            cert: certificate
        };



        var doProxyReq = function(req, res) {
                proxyLogger.debug('proxyrequest', req.headers);
                var proxyReq = req;
                var proxyRes = res;

                var proxy_uuid = uuid.v1();

                var url = require('url');
                var urlPath = url.parse(proxyReq.url, true);
                var path = urlPath.pathname;
                var moviedbproxypath = '/proxy/themoviedb';
                var themoviedbidx = path.indexOf(moviedbproxypath);
                if (path.indexOf('/private/Downloads') == 0) {


                    winston.info('start request');
                    var headers = {
                        cookie: proxyReq.headers['cookie'] ? proxyReq.headers['cookie'] : null
                    };
                    winston.info(headers, 'headers');
                    request({
                        method: 'GET',
                        headers: headers,
                        uri: 'http://0.0.0.0:' + app.get('port') + '/ping/isadmin'
                    }, function(error, response, body) {
                        if (error) {
                            winston.error(error)
                            proxyRes.writeHead(500);
                            return proxyRes.end("There was an error. Please try again");
                        }
                        winston.info(body);

                        if (response.statusCode !== 200) {
                            proxyRes.writeHead(response.statusCode);
                            return proxyRes.end(response.body)
                        }

                        var options = {
                            url: FTP_BASE + path,
                            method: 'GET',
                            path: path,
                            rejectUnauthorized: false,
                            headers: proxyReq.headers
                        };
                        request(options,
                            function(err, res, body) {
                                winston.debug(res.statusCode);
                                winston.debug(res.headers);
                                winston.debug(body);
                                if (err) {
                                    winston.error(err);
                                    return;
                                }
                                if (res.statusCode === 401) {
                                    FTP_AUTHENTICATOR.get_challenge(res);
                                    FTP_AUTHENTICATOR.authenticate_request_options(options);
                                    req.headers['authorization'] = options.headers['authorization'];
                                }

                                winston.debug(options);
                                winston.debug(req.headers);

                                var target = FTP_BASE;

                                winston.debug(req.headers);

                                proxy.web(proxyReq, proxyRes, {
                                    target: target,
                                    secure: false,
                                    // ws: true
                                }, function(err) {
                                    winston.log('error', err);
                                    proxyRes.writeHead(502);
                                    proxyRes.end("There was an error. Please try again");
                                });

                            }
                        );
                    });

                }
                else if (themoviedbidx !== -1) {
                    // console.log('proxyReq',proxyReq);
                    var proxyPath = path.substring(moviedbproxypath.length);

                    console.log('proxyReq','fullpath',themoviedbidx, proxyPath,proxyReq.data);

                    var qs = urlPath.query || {};
                    qs['api_key'] = THEMOVIEDB_API_KEY;

                    var target = THEMOVIEDB_BASE_URL + proxyPath + '?' + querystring.stringify(qs);

                    console.log('proxyReq',target);

                    proxyReq.url = target;

                    proxy.web(proxyReq, proxyRes, {
                        target: target,
                        // ignorePath: true,
                        changeOrigin: true
                        // secure: false,
                        // ws: true
                    }, function(err) {
                        winston.log('error', err);
                        proxyRes.writeHead(502);
                        proxyRes.end("There was an error. Please try again");
                    });

                    return;
                }
                else if (path.indexOf('/v2/') !== -1) {
                    proxy.web(proxyReq, proxyRes, {
                        target: {
                            host: 'localhost',
                            port: loopbackApp.get('port')
                        },
                        secure: false
                    }, function(err) {
                        winston.log('error', err);
                        proxyRes.writeHead(502);
                        proxyRes.end("There was an error. Please try again");
                    });
                }
                else {
                    proxy.web(proxyReq, proxyRes, {
                        target: 'http://localhost:' + app.get('port'),
                        // secure: false
                    }, function(err) {
                        winston.log('error', err);
                        proxyRes.writeHead(502);
                        proxyRes.end("There was an error. Please try again");
                    });
                    proxy.on('proxyRes', function(proxyRes, req, res) {
                        if (proxyRes.statusCode >= 400) {
                            // mainLogger.warn(req.url + ' ' + proxyRes.statusCode);
                        }
                    });

                }
            }

        var httpServer = http.createServer(
            function(req,res) {
                console.log(req.headers);
                if (req.headers['x-set-timeout']) {
                    var timeout = parseInt(req.headers['x-set-timeout']) || 0;
                    setTimeout(function() {
                        doProxyReq(req,res);
                    },timeout);
                }
                else {
                    doProxyReq(req,res);
                }
            }
        ).listen(PORT, function() {
            callback(httpServer.address().port);
        });


        var wsProxy = new httpProxy.createProxyServer({
            target: {
                host: 'localhost',
                port: app.get('port')
            }
        });

        httpServer.on('clientError', (err, socket) => {
            console.log('server clientError', err);
            socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
        });

        httpServer.on('upgrade', function(req, socket, head) {
            winston.info('upgrade event');
            winston.info('head', head);
            winston.info('haeders', req.headers);
            wsProxy.ws(req, socket, head, function(err) {
                winston.log('error', err);
            });
        });

    }


    function addLogseneRouter() {
        var logsene = require('./v1/logsene/logsene')({
            winston: mainLogger,
            app: app
        });
        app.use('/v1/logsene', logsene.router);
    }

    let pingTask;
    function addPingTask()
    {
        if (pingTask) {
            pingTask.destroy();
        }
        //15th hour run 3am.
        // var scheduledTime = '0 3 * * *';

        //run every second.
        var scheduledTime = '* * * * * *';

        pingTask = cron.schedule(scheduledTime,function() {
            mainLogger.info('server time',Date.now())
        });
    }

    function createTvnotificationTask()
    {
        if (tvshownotificationTask) {
            tvshownotificationTask.destroy();
        }
        //15th hour run 3am.
        // var scheduledTime = '0 3 * * *';

        //run every hour.
        var scheduledTime = '0 * * * *';

        (function() {
            var task_id = uuid.v1();
            tvshownotificationTask = cron.schedule(scheduledTime,function() {
                mainLogger.info('tvshowNotificationTaskFunc',task_id,Date.now());
                tvshowNotificationTaskFunc();
            });
        })();

    }

    function addTvshowNotification(data)
    {

        var Notification = database.collection('notification');
        data.type = 'tvshow_airdate';

        todosModule.broadcastToUserId(data.user_id,
            'notification', JSON.stringify(data));


        Notification.update({
            user_id: data.user_id,
            meta: {
                tvshow_id: data.meta.tvshow_id,
                airstamp: data.meta.airstamp,
            }
        },
            {$set: data},
            {upsert:true}, function(error,result) {
        });

    }

    function tvshowNotificationTaskFunc()
    {
        var Tvshow = database.collection('tvshow');
        var Notification = database.collection('notification');


        var created = Date.now();
        var now = moment(created);
        var startOfDayYesterday = moment(now).startOf('day').add(-1,'days');
        var twoDays =  moment(now).add(2,'day');

        var defaultFormat = 'YYYY-MM-DD HH:mm:ss';
        mainLogger.info('tvshowNotification','Run',now.format(defaultFormat),
            startOfDayYesterday.format(defaultFormat),twoDays.format(defaultFormat)
        );

        Tvshow.find({}).toArray((function(err, results) {
            if (err) {
                mainLogger.log('error', err);
                return;
            }
            for (var i in results) {
                (function () {
                    var message = '';
                    var tvshow =  results[i];
                    var tvshow_id = tvshow._id;

                    var user_id = ObjectID(results[i].user_id);

                    request({
                        'method': 'GET',
                        'url': 'http://0.0.0.0:' + app.get('port') + '/v1/proxy/tvmaze/shows/' + results[i].tvmaze_id,
                        'headers': {
                            'Accept': 'application/json'
                        },
                    }, function (err, res, body) {
                        if (err) {
                            mainLogger.log('error', err);
                            return;
                        }

                        mainLogger.info(body);

                        if (body) {
                            try {
                                body = JSON.parse(body);
                                mainLogger.debug(body._links);

                                if (body._links && body._links.nextepisode) {
                                    message = 'A new episode of ' + body.name + ' comes out on ';
                                    mainLogger.info(body._links.nextepisode.href);

                                    var episodeLink = body._links.nextepisode.href.split('/');
                                    var episodeId = episodeLink[episodeLink.length - 1];

                                    mainLogger.debug(episodeId);
                                    request({
                                        'method': 'GET',
                                        'url': 'http://0.0.0.0:' + app.get('port') + '/v1/proxy/tvmaze/episodes/' + episodeId,
                                        'headers': {
                                            'Accept': 'application/json'
                                        },
                                    }, function (err, res, body) {
                                        if (err) {
                                            mainLogger.log('error', err);
                                            return;
                                        }
                                        mainLogger.debug(body);

                                        body = JSON.parse(body);

                                        if (body.airstamp) {
                                            var airstamp = moment(body.airstamp);

                                            mainLogger.info('tvnotification compare',
                                                startOfDayYesterday.format(defaultFormat),
                                                airstamp.format(defaultFormat),
                                                twoDays.format(defaultFormat));

                                            if (
                                                // true ||
                                                (startOfDayYesterday <= airstamp && airstamp < twoDays)) {
                                                mainLogger.debug('ready to view');
                                                message += airstamp.format('MMMM Do') + '!';

                                                var systemFields = {
                                                    created: created,
                                                    user_id: user_id,
                                                    meta: {
                                                        tvshow_id: tvshow_id,
                                                        airstamp: parseInt(airstamp.format('x'))
                                                    }
                                                };

                                                var obj = {message: message};

                                                Object.assign(obj, systemFields);

                                                addTvshowNotification(obj);

                                            }
                                        }
                                    })
                                }
                            }
                            catch (e) {
                            }
                        }
                    })
                })()
            }
        }));
    }

    function runTvNotificationTest(cb)
    {
        cb = cb || function(){};
        var seconds = 60 * 60 * 24; //24 hour cycle.

        if (clock) {
            clock.restore();
        }

        clock = sinon.useFakeTimers(parseInt(moment('2017-07-25').format('x'))); //July 25th 2017

        createTvnotificationTask();

        while(true) {
            clock.tick(1000);
            if ((seconds % 3600) == 0) {
                console.log(seconds,moment().format('HH:mm:ss'));
            }

            // console.log(seconds);
            if (seconds < 1) {
                // clearInterval(interval);
                clock.restore();
                return cb();
            }
            seconds--;
        }
    }




    function addSelftestRouter() {
        var router = express.Router();

        let sinonClock;

        if (process.env.NODE_ENV === 'TEST' || process.env.NODE_ENV === 'DEV') {
            require('./apitests/apitests')({app:app,logger:mainLogger});

            router.post('/selftest/main/run', function (req, res) {

                runDefaultTest(function(testResults) {
                    res.json({tests:testResults}).end();
                });
            });

            // router.post('/tasks/refresh', function(req,res) {
            // });

            router.post('/selftest/main/runfail', function (req, res) {

                runFailTest(function(testResults) {
                    res.json({tests:testResults}).end();
                });
            });

            var testInterval;

            router.post('/faketimer/clear', function(req,res) {
                if (sinonClock)
                {
                    sinonClock.restore();
                }
                // addPingTask();
                createTvnotificationTask();
                res.json({now:Date.now()});

            });

            router.post('/faketimer', function(req,res) {
                if (sinonClock)
                {
                    sinonClock.restore();
                }
                sinonClock = sinon.useFakeTimers(req.body.timestamp);

                // addPingTask();
                createTvnotificationTask();

                res.json({});
            });

            /**
             * Increments time without missing
             * {seconds: 100}
             */
            router.post('/faketimer/increment', function(req,res) {
                if (!sinonClock) {
                    res.end();
                    return;
                }
                var seconds = req.body.seconds;

                while(seconds > 0) {
                    sinonClock.tick(1000);
                    // if (( parseInt(moment().format('mm')) == 0)) {
                    //     mainLogger.info(seconds,moment().format('HH:mm:ss'));
                    // }
                    seconds--;
                }

                res.json({});
            });


            router.post('/testsuites/run/tvnotifications', function(req,res) {
                runTvNotificationTest(function() {
                    res.json({});
                });
            });

            /**
             * Recreate cron jobs after a faketimer has been created.
             */
            router.post('/faketimer/cron', function(req,res) {
                createTvnotificationTask();
            });


        }
        app.use('/v1', router);



        /**
         * @param callback callback(testresults) always called
         */
        var runFailTest = function(callback)
        {
            var headers = {
                'content-type': 'application/json'
            };

            var body = JSON.stringify({
                'test': 1,
            });
            var test1 = {
                name: 'Test 1',
                description: 'Do post against ping',
                request: {
                    headers:headers,
                    body: body,
                    method: 'POST',
                    'url': 'http://localhost:3000/v1/ping'
                },
                // response: {
                tests: [
                    {
                        type: 'statusCode',
                        expectedValue: 201,
                        message: 'status Code must be 201'
                    },
                    {
                        message: 'server.started should be a timestamp',
                        type: 'body',
                        path: 'server.started',
                        expectedType: 'number',
                        saveParam: 'server.started'
                    }
                ]
                // }
            };


            var body = JSON.stringify({
                'test': '{{server.started}}',
            });

            var test2 = {
                name: 'Test 2',
                description: 'Confirm server.started is equal on second request.',
                request: {
                    headers:headers,
                    body: body,
                    method: 'POST',
                    url: 'http://localhost:3000/v1/ping'
                },
                tests: [
                    {
                        type: 'statusCode',
                        expectedType: 'number',
                        message: 'statusCode is a number'
                    },
                    {
                        type: 'statusCode',
                        expectedValue: 404,
                        message: 'statusCode must be 404'
                    }
                ]
            };

            var seriesFunctions = [];

            var testResults = [{testObject:test1},{testObject:test2}];

            var params = {};
            testResults.forEach(function(testResult) {
                var test = testResult.testObject;
                seriesFunctions.push(function(cb)
                {
                    test.params = params;
                    console.log('runTestStep',params,test.params,test);
                    runTestStep(test,function(tr) {
                        // console.log(testResult);
                        // testResults.push(testResult);
                        Object.assign(testResult,tr);
                        params = testResult.savedParams;
                        console.log('runTestStepPost',params);

                        cb(testResult.status == 'failed');
                    })
                })
            });


            async.series(seriesFunctions,function(){
                console.log('async complete',testResults)
                callback(testResults);
            })
        };

        /**
         * @param callback callback(testresults) always called
         */
        var runDefaultTest = function(runDefaultTestCallback)
        {
            var headers = {
                'content-type': 'application/json'
            };

            var body = JSON.stringify({
                'test': 1,
            });
            var test1 = {
                name: 'Test 1',
                description: 'Do post against ping',
                request: {
                    headers:headers,
                    body: body,
                    method: 'POST',
                    'url': 'http://localhost:3000/v1/ping'
                },
                // response: {
                tests: [
                    {
                        type: 'statusCode',
                        expectedValue: 201,
                        message: 'status Code must be 201'
                    },
                    {
                        message: 'server.started should be a timestamp',
                        type: 'body',
                        path: 'server.started',
                        expectedType: 'number',
                        saveParam: 'server.started'
                    }
                ]
                // }
            };


            var body = JSON.stringify({
                'test': '{{server.started}}',
            });

            var test2 = {
                name: 'Test 2',
                description: 'Confirm server.started is equal on second request.',
                request: {
                    headers:headers,
                    body: body,
                    method: 'POST',
                    url: 'http://localhost:3000/v1/ping'
                },
                tests: [
                    {
                        type: 'statusCode',
                        expectedValue: 201,
                        expectedType: 'number',
                        message: 'Status code must be 201'
                    },
                    {
                        type: 'body',
                        path: 'server.started',
                        expectedParamValue: 'server.started',
                        message: 'server.started is the same as previous request'
                    },
                    {
                        type: 'body',
                        path: 'server.deploytime',
                        expectedType: 'undefined',
                        saveParam: 'server.deploytime',
                        message: 'server.deploytime is not defined'

                    }
                ]
            };

            var seriesFunctions = [];

            var testResults = [{testObject:test1},{testObject:test2}];

            var params = {};
            testResults.forEach(function(testResult) {
                var test = testResult.testObject;
                seriesFunctions.push(function(cb)
                {
                    test.params = params;
                    console.log('runTestStep',params,test.params,test);
                    runTestStep(test,function(tr) {
                        // console.log(testResult);
                        // testResults.push(testResult);
                        Object.assign(testResult,tr);
                        params = testResult.savedParams;
                        console.log('runTestStepPost',params);

                        cb(testResult.status == 'failed');
                    })
                })
            });


            async.series(seriesFunctions,function(){
                console.log('async complete',testResults)
                runDefaultTestCallback(testResults);
            })
        };



        /**
         * @param testObject json object of test
         * @param callback callback(testresult) always called
         */
        var runTestStep = function(testObject, callback) {
            // console.log(process.cwd().replace(/\\/g,'/'));

            if (testObject.request.body) {
                for (var key in testObject.params) {
                    var regexStr = '{{'+key+'}}';
                    console.log('replace',key,regexStr,testObject.params[key]);
                    var regex = new RegExp(regexStr);
                    testObject.request.body = testObject.request.body
                        .replace(regex,testObject.params[key]);
                }
            }



            var opts = {};

            Object.assign(opts,testObject.request);
            console.log(opts,testObject);


            parsedRequest(opts,function(parsedData) {

                parsedData.savedParams = parsedData.savedParams || {};

                parsedData.description = testObject.description || '';
                if (testObject.tests) {
                    for (idx in testObject.tests) {
                        var test = testObject.tests[idx];

                        if (parsedData.status === 'failed') {
                            return callback(parsedData);
                        }

                        var message = test.message || getDefaultMessage(test);
                        if (test.type == 'statusCode') {
                            var val = parsedData.response.statusCode;
                        }
                        else if (test.type == 'body') {
                            var val = getValue(test,parsedData.response.body);
                        }

                        if (test.saveParam) {
                            parsedData.savedParams[test.saveParam] = val;
                        }

                        if (test.expectedType) {
                            doExpect(parsedData,message,function(message) {
                                expect(val,message)
                                    .to.be.a(test.expectedType)
                            });
                        }
                        if (test.expectedValue) {
                            doExpect(parsedData,message,function(message) {
                                console.log('doExpect',test,test.message,message);
                                expect(val,message)
                                    .to.be.equal(test.expectedValue)
                            });
                        }
                        if (test.expectedParamValue) {
                            doExpect(parsedData,message,function(message) {
                                console.log('doExpect',test,test.message,message);
                                expect(val,message)
                                    .to.be.equal(testObject.params[test.expectedParamValue]);
                            });
                        }
                    }
                }


                callback(parsedData);
            });
        };

        var getValue = function(test,body)
        {
            var value;
            test.path.split('.').forEach(function(key) {
                if (value !== undefined) {
                    if (typeof value == 'object') {
                        value = value[key];
                    }
                    else {
                        return undefined;
                    }
                }
                else {
                    value = body[key];
                }
            });

            return value;
        }

        var getDefaultMessage = function(test) {
            return '';
        }


        var doExpect = function(parsedData,message,expectFunc) {
            var expectTest = {};
            parsedData.expectTests = parsedData.expectTests || [];
            parsedData.expectTests.push(expectTest);

            expectTest.message = message;

            try {
                expectFunc(message);
                expectTest.status = 'success';
                parsedData.status = 'success';
            }
            catch (e) {
                expectTest.status = 'failed';
                parsedData.status = 'failed';

                // expectTest.message = e.message;

                expectTest.error = e;

                expectTest.errorMessage = e.toString();

            }

        };


        var parsedRequest = function (opts, parsedCallback) {
            var parsedData = {};
            parsedData.rawRequestBody = opts.body;

            parsedData.headers = opts.headers;
            if (opts.body) {
                parsedData.body = JSON.parse(opts.body);
            }
            parsedData.url = opts.url;
            parsedData.method = opts.method;
            parsedData.failedTests = [];

            parsedData.path = (function(urlString) {
                var urlParsed = URL.parse(urlString,true);
                console.log('url',urlParsed.path,urlParsed);
                // var fullpath = url.pathname + url.search;

                return urlParsed.pathname + urlParsed.search;
            })(opts.url);

            request(opts, function (err, response, body) {
                parsedData.response = {};
                parsedData.response.body = null;
                parsedData.response.rawResponseBody = body;
                parsedData.response.headers = response.headers;
                parsedData.response.statusCode = response.statusCode;

                try {
                    parsedData.response.body = JSON.parse(parsedData.response.rawResponseBody);
                }
                catch(e) {

                }

                parsedCallback(parsedData);
            });
        };

    }

    function addTvShowsRouter() {
        createTvnotificationTask();


        var db = database;
        var Tvshow = db.collection('tvshow');
        var Notification = db.collection('notification');

        var router = express.Router();

        router.use(function(req, res, next) {
            if (req.user) {
                req.user_id = req.user._id;
                next();
            }
            else {
                return res.status(401).json({'message': 'Not authorized.'});
            }
        });


        router.get('/notifications', function(req,res) {
            var query = {
                "user_id": req.user_id,
                "_deleted": {$ne: 1}
            };
            Notification.find(query).sort({
                "created": -1,
            }).toArray((function(err, results) {
                if (err) {
                    mainLogger.log('error', err);
                    return res.status(500).json({'message': err.message});
                }

                res.setHeader('content-type', 'application/json; charset=utf-8');
                res.json(results);
            }));
        });

        router.post('/notifications', function(req,res) {
            var systemFields = {
                created: Date.now(),
                user_id: req.user_id,
                // tvmaze_id: req.body.tvmaze_id
            };

            var obj = req.body;

            Object.assign(obj,systemFields);

            Notification.insertOne(obj, function(error, result) {
                if (error) {
                    winston.error(error);
                    return res.status(500).json({
                        error: error
                    })
                }
                obj._id = result.insertedId;
                res.json(obj);
            });
        });

        router.delete('/notifications/:id', function(req,res) {
            Notification.update({
                _id: ObjectID(req.params.id),
                user_id: req.user_id
            },{$set: {
                _deleted: 1
            }}, {
                w: 1
            }, function(error, result) {
                res.end();
            });
        });

        router.get('/tvshows', function(req,res) {
            var query = {
                "user_id": req.user_id
            };
            Tvshow.find(query).sort({
                "created": -1,
            }).toArray((function(err, results) {
                if (err) {
                    mainLogger.log('error', err);
                    return res.status(500).json({'message': err.message});
                }

                res.setHeader('content-type', 'application/json; charset=utf-8');
                res.json(results);
            }));
        });

        var getTvShowHandler = function(req,res,next) {
            var filter = {
                user_id: req.user_id,
                tvmaze_id: req.body.tvmaze_id
            };
            Tvshow.findOne(filter, function(err,habit) {
                if (err) {
                    mainLogger.log('error', err);
                    return res.status(500).json({
                        error: error
                    })
                }
                if (habit) {
                    return res.json(habit).end();
                }
                else {
                    next();
                }
            });
        };

        router.post('/tvshows', getTvShowHandler, function(req,res) {
            var obj = {
                created: Date.now(),
                user_id: req.user_id,
                tvmaze_id: req.body.tvmaze_id
            };

            Tvshow.insertOne(obj, function(error, result) {
                if (error) {
                    winston.error(error);
                    return res.status(500).json({
                        error: error
                    })
                }
                obj._id = result.insertedId;
                res.json(obj);
            });
        });

        router.get('/tvshows/:id', function(req,res) {
            var query = {
                "user_id": req.user_id,
                "_id": ObjectID(req.params.id),
            };
            Tvshow.findOne(query,function(err, result) {
                if (err) {
                    mainLogger.log('error', err);
                    return res.status(500).json({'message': err.message});
                }

                res.json(result);
            });
        });



        router.delete('/tvshows/:id', function(req,res) {
            Tvshow.remove({
                _id: ObjectID(req.params.id),
                user_id: req.user_id
            }, {
                w: 1
            }, function(error, result) {
                res.end();
            });
        });


        app.use('/v3/users/me', router);

    }


    function addShewasprettyRouter() {
        var router = express.Router();

        var base_url = "http://myasiantv.online/video/drama/she-was-pretty";

        var getEpisodeUrl = function(episode) {
            return base_url + '/episode-' + episode;
        };

        router.get('/', function(req,res) {

            var responseData = [];

            var episodeTotal = 16;
            var count = 0;

            for (var i = 0; i < episodeTotal; i++) {
                var episodeNumber = i + 1;
                (function() {
                    var episodeUrl = getEpisodeUrl(episodeNumber);

                    var episode = {
                        episodeNumber: episodeNumber,
                        episodeUrl: episodeUrl,
                        episodeTotal: episodeTotal
                    };

                    responseData.push(episode);

                    (function(episode) {
                        request({
                            url: episode.episodeUrl,
                            method: 'GET'
                        }, function(e,r,b) {
                            count++;
                            dom = new JSDOM(b);
                            var videoUrl = dom.window.document.querySelector("iframe").src.split('=')[1];

                            episode.videoUrl = videoUrl;

                            console.log('shewasprettycount',count,episode);


                            if (count === episodeTotal) {
                                return res.json(responseData).end();
                            }
                        });
                    })(episode);

                })();

            }
        });

        app.use('/v1/shewaspretty', router);
    }

    function addProxyRouter() {
        var result = require('./v1/proxy/proxy')({
            winston: mainLogger,
            app: app,
            database: database,
        });
        app.use('/v1/proxy', result.router);
    }

    function addPostcardRouter(TransactionService) {
        var result = require('./v1/postcards/postcards')({
            TransactionService: TransactionService,
            winston: mainLogger,
            app: app,
            database: database,
        });
        app.use('/v1/postcards', result.router);
    }
    
    function addFaxRouter() {
        var fax = require('./v1/fax/fax')({
            winston: mainLogger,
            app: app
        });
        app.use('/v1/fax', fax.router);
    }


    function addVoiceRouter() {
        var voice = require('./v1/voice.js')({
            db: mongo_db,
            express: express,
            winston: mainLogger,
            app: app,
            nexmo: {
                api_key: NEXMO_API_KEY,
                api_secret: NEXMO_API_SECRET,
                base_url: NEXMO_BASE_URL
            },
            base_url: VOICE_API_BASE_URL,
            main_application: main_application
        });
        app.use('/api/v1/voice', voice.router);
    }

    function addOauth(OauthToken,User)
    {
        //authorization=token 2a3e269cb969fd914fc183328d879b06e1d00aed1126928123bd0e93936961acbf88f021ddbfc9ab686b9853d42893b944a684b2c202d121551abb5bb06c3008
        app.use(function(req, res, next) {
            if (req.isAuthenticated()) {
                return next();
            }

            if (req.headers && req.headers.authorization) {
                var access_token = req.headers.authorization.substr(6);
                OauthToken.findOne({
                    access_token: access_token,
                }, function(err, oauthToken) {
                    if (oauthToken && oauthToken.user_id) {
                        User.findOne({
                            _id: oauthToken.user_id
                        }, function(err, user) {
                            if (user) {
                                req.user = user;
                                return next();
                            }
                            else {
                                return next();
                            }
                        })
                    }
                    else {
                        return next();
                    }

                });
            }
            else {
                return next();
            }
        });
    }

    function addLoginRouter() {
        app.use('/v1', require(__dirname + '/v1/login/main.js')({
            winston: mainLogger,
            database: database,
            passport: passport,
        }).router);


        app.use("/public", express.static(__dirname + "/public"));
    }

    function addGithubRouter() {

        app.use('/v1', require('./v1/github/github.js')({
            app: app,
            winston: mainLogger,
            db: mongo_db,
            sessionMiddleware: sessionMiddleware
        }).router);
    }
    
    function addHabitsRouter() {
        app.use('/v1/habits', require('./v1/habits/habits.js')({
            winston: mainLogger,
            db: mongo_db,
            sessionMiddleware: sessionMiddleware
        }).router);
    }

    let todosModule;

    function addTodosRouter() {
        const todos = mongo_db.collection('todos');
        app.use("/v1/todos/public", express.static(__dirname + "/v1/todos/public"));

        todosModule =  require('./v1/todos/main.js')({
            winston: mainLogger,
            db: mongo_db,
            io: todosnsp,
            sessionMiddleware: sessionMiddleware
        });

        app.use('/v1/todos', todosModule.router);
    }



    function addDeployRouter() {

        app.use('/v1/deploys', require(__dirname + '/v1/deploys/deploys')({
            winston: mainLogger,
            db: mongo_db,
            sessionMiddleware: sessionMiddleware
        }).router);
    }


    function addZorkRouter() {

        app.use('/v1/zork', require(__dirname + '/v1/zork/main')({
            winston: mainLogger,
            db: mongo_db,
            frotzcmd: frotzcmd,
            io: io.of('/v1/zork'),
            sessionMiddleware: sessionMiddleware
        }).router);
    }

}

// https://www.gnu.org/software/gettext/manual/html_node/The-TERM-variable.html
//set TERM=xterm for heroku
function getFrotzCmd() {

    if (fs.existsSync(__dirname + '/../.apt/usr/games/frotz')) {
        var val = __dirname + '/../.apt/usr/games/frotz';
    }
    else if (fs.existsSync('/usr/games/frotz')) {
        var val = '/usr/games/frotz';
    }
    else {
        var val = 'frotz';
    }
    return val;
}

function getMainLoggerTransports() {
    var transports = [
        new winston.transports.File({
            level: ACCESS_LOG_LEVEL,
            filename: path.join(__dirname, 'access.log'),
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.Console({
            level: CONSOLE_LOG_LEVEL,
            colorize: true,
            // json: true
        }),
        (function() {
            let self = {};
            self.log = function(lvl,msg) {
                if (MiscService.emitAdminlog) {
                    MiscService.emitAdminlog(
                        JSON.stringify(
                            {type: 'adminlog',
                                'message': msg,
                                'level': lvl,
                            }));
                }
            };
            return self;
        })()
    ];

    if (exceptionHandlers) {
        exceptionHandlers.push(
            (function() {
                let self = {};
                self.logException = function (errMessage, info, next, err) {
                    console.log('exceptionHandlers','custom');

                    let fullMessage = err.stack || err.message;
                    return next();
                    if (MiscService.emitAdminlog) {
                        MiscService.emitAdminlog(
                            JSON.stringify(
                                {
                                    type: 'uncaughtException',
                                    'message': fullMessage,
                                    'level': 'error',
                                    'err': fullMessage
                                }));
                    }
                };
                return self;
            })()
        )
    }

    winston.info(LOGSENE_LOG_TYPE);
    if (process.env.LOGSENE_TOKEN) {
        transports.push(new(winston.transports.Logsene)({
            token: process.env.LOGSENE_TOKEN,
            ssl: 'true',
            type: LOGSENE_LOG_TYPE
        }));
        if (exceptionHandlers) {
            exceptionHandlers.push(new(winston.transports.Logsene)({
                token: process.env.LOGSENE_TOKEN,
                ssl: 'true',
                type: LOGSENE_LOG_TYPE
            }));
        }

        winston.info('creating logsene transport');
    }
    return transports;
}
