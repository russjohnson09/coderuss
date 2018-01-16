console.log('loading misc.js', Date.now());
require('dotenv').config();

let fs = require('fs');
let mongodb = require('mongodb');
let uuid = require('node-uuid');
const crypto = require('crypto');
let http = require('http');
let url = require('url');
let express = require('express');
let bcrypt = require('bcrypt');

const mongoose = require("mongoose"); //http://mongoosejs.com/docs/index.html
const request = require('request');

const ObjectID = mongodb.ObjectID;

const webpush = require('web-push');

// web-push-codelab.glitch.me
// $ npm install -g web-push
// $ web-push generate-vapid-keys


const publicKey = process.env.WEBPUSH_PUBLIC_KEY;
const privateKey = process.env.WEBPUSH_PRIVATE_KEY;

const vapidKeys = {
    publicKey: publicKey,
    privateKey: privateKey,
};

// console.log(vapidKeys);

webpush.setVapidDetails(
    'mailto:russjohnson09@gmail.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

/**
 * @param opts
 * @returns router
 */
module.exports = function (opts) {
    let self = {};
    let router = express.Router();
    self.router = router;
    let tcpPort = opts.tcpPort;

    let db = opts.database;

    let User = db.collection('user');

    let UserService = opts.UserService;

    var net = require('net');

    let adminlogsNsp = opts.adminlogsNsp;

    var sessionMiddleware = opts.sessionMiddleware;

    let winston = opts.winston;

    (function pushNotifications() {
        winston.info('loading push notifications');
        let subscriptions = [];
        function saveSubscriptionToDatabase(body)
        {
            subscriptions.push(body);

            winston.info('subscription save',body);

            return new Promise(function(resolve) {
                resolve(1);
            })
        }

        router.post('/pushnotifications/save-subscription', function(req,res,next) {
            return saveSubscriptionToDatabase(req.body)
                .then(function(subscriptionId) {
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({ data: { success: true } }));
                })
                .catch(function(err) {
                    res.status(500);
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({
                        error: {
                            id: 'unable-to-save-subscription',
                            message: 'The subscription was received but we were unable to save it to our database.'
                        }
                    }));
                });
        });

        const deleteSubscriptionFromDatabase = function()
        {
            return new Promise(function(resolve) {
                resolve();
            })
        };

        const triggerPushMsg = function(subscription, dataToSend) {
            winston.info('triggering message on subscription ',JSON.stringify(subscription));
            return webpush.sendNotification(subscription, dataToSend)
                .catch((err) => {
                    if (err.statusCode === 410) {
                        return deleteSubscriptionFromDatabase(subscription._id);
                    } else {
                        winston.warn('Subscription is no longer valid: ', err);
                        winston.warn(err.message);
                    }
                });
        };

        const getSubscriptionsFromDatabase = function()
        {
            return new Promise(function(resolve) {
                resolve(subscriptions);
            });
        };

        router.use('/pushnotifications/test/:msg', function (req, res) {
            let dataToSend = req.params.msg;
            return getSubscriptionsFromDatabase()
                .then(function(subscriptions) {
                    let promiseChain = Promise.resolve();

                    //This is some good code for handling a list of promises. I will steal.
                    for (let i = 0; i < subscriptions.length; i++) {
                        const subscription = subscriptions[i];
                        // const subscription = 1;

                        promiseChain = promiseChain.then(() => {
                            return triggerPushMsg(subscription, dataToSend);
                        });
                    }

                    return promiseChain;
                }).then(() => {
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({ data: { success: true } }));
                })
                .catch(function(err) {
                    res.status(500);
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({
                        error: {
                            id: 'unable-to-send-messages',
                            message: `We were unable to send messages to all subscriptions : ` +
                            `'${err.message}'`
                        }
                    }));
                });
        });

        winston.info('loaded push notifications',Date.now());

    })();



    adminlogsNsp.use(function (socket, next) {
        sessionMiddleware(socket.request, {}, next);
    });

    adminlogsNsp.use(function (socket, next) {
        var req = socket.handshake;
        socket.user = 'anon';
        if (socket.request.session.passport) {
            if (socket.request.session.passport.user) {
                console.log('nsp start find user',socket.request.session.passport.user)

                User.findOne({
                    _id: ObjectID(socket.request.session.passport.user)
                }, function(err, user) {
                    console.log('found user',user);
                    winston.debug(user);
                    if (err) {
                        winston.error(err);
                    }
                    console.log('assigning user to socket');
                    socket.user = user;
                    console.log('assigned user')
                    next();
                });
            }
            else {
            }
        }
    });

    //non-admin cannot connect to adminlogsNsp
    adminlogsNsp.use(function (socket, next) {
        let user = socket.user;
        console.log('socket user',user);

        if (UserService.isAdmin(user.username)) {
            console.log('is admin');
            next();
        }
        else {
            console.log('not admin');
        }
    });

    adminlogsNsp.on('connection', function (socket) {
        emitAdminlog(JSON.stringify({user:socket.user,msg:"new user"}))
        console.log('new connection',socket.user);

        socket.on('connect', function () {
            console.log('new connection',socket.user);

            socket.emit('info', JSON.stringify({ data: 'connected' }));
            // winston.debug("socket connect ", {
            //     socket: {
            //         user: socket.user
            //     }
            // });
            winston.debug("connected count " + connectCounter);
            connectCounter++;
        });
        socket.on('disconnect', function () {
            console.log('disconnect');

            // winston.debug("socket disconnect ", {
            //     socket: {
            //         user: socket.user
            //     }
            // });
            // if (indexedSockets[socket.user]) {
            //     delete (indexedSockets[socket.user][socket.id]);
            // }
            // else {
            //     winston.error('socket connection not properly indexed')
            // }
            // connectCounter--;
        });

        // winston.debug('emit info', { data: 'connected' });
        socket.emit('info', JSON.stringify({ data: 'connected' }));
        // if (!indexedSockets[socket.user]) {
        //     indexedSockets[socket.user] = {};
        // }
        // indexedSockets[socket.user][socket.id] = socket;
    });

    let emitAdminlog = self.emitAdminlog = function(msg)
    {
        console.log('emit',msg);

        adminlogsNsp.emit('info', msg);

        // adminlogsNsp.emit(msg);
    };


    let pingInterval = 120 * 60;
    setInterval(function() {
        winston.info('ping');
    },pingInterval);

    var server = net.createServer(function(socket) {
        socket.write('Echo server\r\n');
        socket.pipe(socket);

        socket.on('data', function (data) {
            let dataStr = data.toString();
            logDataParser(dataStr);
            socket.write('Received data' + "\n");
            // console.log('received data ' + data.toString());
            // console.log(socket.name + "> " + data, socket);
        });

        // Remove the client from the list when it leaves
        socket.on('end', function () {
            // clients.splice(clients.indexOf(socket), 1);
            // console.log(socket.name + " left the chat.\n");
        });
    });


    //echo netcat_test | netcat localhost 1337
    // let testtcp = 1337;
    let testtcp = 0;
    server.listen(testtcp,function() {
        consol.log('tcp server listening',server)
    });

    let logDataParser = function(dataStr)
    {
        console.log('received data ' + dataStr);
    };


    //https://wiki.gentoo.org/wiki/Rsyslog

    //https://www.digitalocean.com/community/tutorials/how-to-use-netcat-to-establish-and-test-tcp-and-udp-connections-on-a-vps
    //netcat -z -v localhost 1337
    // server.listen(tcpPort, '127.0.0.1');

    /**
     * Generic hook for all events
     */
    router.use('/logs',
        function (req, res, next) {

            adminlogsNsp.emit('test');

            console.log(req.body);
            res.json({'status':'success'});
            // next();
        });


    let loggedIn = function(req,res,next) {
        winston.info('checking logged in',req.user);
        if (req.user) {
            return next();
        }
        else {
            res.status(401).json({'message':'unauthorized'});
        }
    };

    let QueueItem = db.collection('queueitem');

    /**
     * I was using completed 0 as the status but searching by
     * an int involves more work than a string.
     * @param req
     * @param res
     * @param next
     */
    function getUserQueueItems(req,res,next) {
        let query = {
            user_id: req.user._id
        };

        Object.assign(query,req.query);

        winston.info('search queueItems',JSON.stringify(query));
        let sort = {
            "created": -1,
        };

        QueueItem.find(query).sort(sort).toArray(function(err,objs) {
            req.queueitems = objs;
            return next();
        });
    }

    function getQueueItem(req,res,next)
    {
        var id = ObjectID(req.params.id);

        let query = {
            _id: id,
            user_id: req.user._id
        };

        winston.info('search queueitem',JSON.stringify(query));

        QueueItem.findOne(query, function(error, result) {
            if (error) {
                winston.error(error);
            }
            winston.info('found queueitem ',result);
            req.queueitem = result;
            return next();
        });
    }


    router.get('/queueitem',loggedIn,getUserQueueItems,function(req,res,next) {

        let QueueItem = db.collection('queueitem');

        return res.json({'message':'success','data':req.queueitems});
    });


    router.get('/queueitem/:id',loggedIn,getQueueItem,function(req,res,next) {
        return res.json(req.queueitem);
    });

    router.put('/queueitem/:id',loggedIn,getQueueItem,function(req,res,next) {

        let set = req.body;

        QueueItem.updateOne({_id:req.queueitem._id},
            {$set:set},
            function(error, result) {
                QueueItem.findOne({_id:req.queueitem._id}, function(error, result) {
                    if (error) {
                        winston.error(error);
                    }
                    return res.json(result);

                });
        });

    });


    router.post('/queueitem',loggedIn,function(req,res,next) {
        winston.info('request params=' + JSON.stringify(req.params));
        winston.info('request body=' + JSON.stringify(req.body));
        let obj = {
            'status': "in_progress"
        };
        Object.assign(obj,req.body);

        obj.created = Date.now();
        obj.user_id = req.user._id;

        let QueueItem = db.collection('queueitem');
        QueueItem.insertOne(obj, function(error, result) {
            if (error) {
                winston.error(error);
                return res.status(500).json({
                    error: error
                })
            }
            winston.info('queueitem created',obj);
            obj._id = result.insertedId;
            // res.setHeader('content-type', 'application/json; charset=utf-8');
            res.json(obj);
            return;
        });
    });

    return self;
};


if (require.main === module) {
    (function () {
        let express = require('express');
        let app = express();
        let winston = require('winston');
        let passport = require('passport');
        let path = require('path');

        require('dotenv').config();

        const MONGO_URI = process.env.MONGO_URI;


        var bodyParser = require('body-parser');
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(bodyParser.json());
        const cookieParser = require('cookie-parser');
        app.use(cookieParser());
        var expressSession = require('express-session');
        var sessionMiddleware = expressSession({
            secret: process.env.EXPRESS_SESSION_SECRET,
            store: new (require("connect-mongo")(expressSession))({
                url: MONGO_URI
            })
        });
        app.use(sessionMiddleware);
        app.use(passport.initialize());
        app.use(passport.session());

        var http = require('http');

        var server = http.Server(app);

        //https://wiki.gentoo.org/wiki/Rsyslog

        //https://www.w3schools.com/nodejs/nodejs_http.asp
        // http.createServer(function (req, res) {
        //     console.log('http server create');
        //     res.write('Hello World!'); //write a response to the client
        //     res.end(); //end the response
        // });
        // return;

        let io = require('socket.io')(server);

        let adminlogsNsp = io.of('/v1/adminlogs');

        let MiscService = {};

        var mainLogger = new winston.Logger({
            transports: [
                new winston.transports.Console({
                    level: 'info',
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
                // MiscService
            ],
            exceptionHandlers: [
                (function() {
                    let self = {};
                    self.logException = function (errMessage, info, next, err) {
                        console.log('exceptionHandlers','custom');
                        // let fullErrMessage = errMessage + "\n" + err;
                        // console.log(fullErrMessage);
                        // err = '' + err;
                        let e = err;
                        let stack = e.stack || e;
                        let stack2 = e.stack;

                        let fullMessage = err.stack || err.message;
                        if (MiscService.emitAdminlog) {
                            MiscService.emitAdminlog(
                                JSON.stringify(
                                    {
                                        type: 'uncaughtException',
                                        'message': errMessage,
                                        'level': 'error',
                                        'err': err
                                    }));
                        }
                    };
                    return self;
                })()
                // new winston.transports.Console({
                // colorize: true,
                // json: true
            ],
            exitOnError: false
        });

        mainLogger.debug('mainLogger');
        mainLogger.info('mainLogger');
        mainLogger.error('mainLogger');

        const MongoClient = require('mongodb').MongoClient;

        //echo netcat_test | netcat localhost 3555
        //echo netcat_test | netcat localhost 3000

        //netcat -z -v localhost 3000
        MongoClient.connect(MONGO_URI, function (err, db) {
            if (err) {
                throw err;
            }
            server.listen(3000, function () {
                mainLogger.info('loaded misc.js', Date.now());

                //https://github.com/expressjs/express/issues/3089
                var net = require('net');

                app.use(function(req,res,next) {
                    next();
                });

                app.use(express.static(path.join(__dirname, '..', '..', 'public/')));

                var ping = require(__dirname + '/../../v1/ping.js')({
                    app: app,
                    winston: mainLogger
                });

                app.use('/v1', require(__dirname + '/../../v1/login/main.js')({
                    winston: mainLogger,
                    database: db,
                    passport: passport,
                }).router);

                let UserService = require(__dirname + '/../../v1/users/main')({
                    winston: mainLogger,
                    database: db,
                    passport: passport,
                });
                app.use('/v1/users', UserService.router);

                MiscService = module.exports({
                    // io: nsp,
                    database: db,
                    adminlogsNsp: adminlogsNsp,
                    BASE_URL: 'http://localhost:3000/v1/googlefit',
                    CODERUSS_BASE_URL: 'http://localhost:3000',
                    winston: mainLogger,
                    sessionMiddleware: sessionMiddleware,
                    tcpPort: 3000,
                    UserService: UserService
                });

                app.use('/v1', function (req, res, next) {
                    // winston.info('user', {_id: req.user._id + ''});
                    next();
                },MiscService.router );

                let doTests = function() {
                    mainLogger.info('starting tests');
                    let cp = require('child_process');
                    let spawn = cp.spawn;

                    let child = spawn("mocha", ['./**/*_spec.js'],
                        {cwd: __dirname, env: process.env});
                    child.stdout.on('data', function (data) {
                        process.stdout.write(data);
                    });

                    child.stderr.on('data', function (data) {
                        process.stderr.write(data);
                    });
                    child.on('exit', function (exitcode) {
                        if (exitcode !== 0) {
                            process.exit(exitcode);
                        }
                    });
                };

                doTests();


            });

        });



        //UNCAUGHT EXCEPTION
        let x = JSON.parse(undefined);
        console.log(x,'x');
    })();


} else {
    console.log('required as a module');
}