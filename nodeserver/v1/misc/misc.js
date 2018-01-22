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

// https://web-push-codelab.glitch.me/
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
    let QueueItem = db.collection('queueitem');
    let NotificationHook = db.collection('notification-hook');

    let User = db.collection('user');

    let UserService = opts.UserService;
    let Subscription = db.collection('subscription');


    var net = require('net');

    let adminlogsNsp = opts.adminlogsNsp;

    var sessionMiddleware = opts.sessionMiddleware;

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

    let winston = opts.winston;


    let emitAdminlog = self.emitAdminlog = function(msg)
    {
        console.log('emit',msg);

        adminlogsNsp.emit('info', msg);

        // adminlogsNsp.emit(msg);
    };


    router.get('/misc/ping',UserService.isLoggedInRouter, function(req,res)
    {
        res.json({"message":"success",user:req.user});
    });

    router.post('/misc/ping',UserService.isLoggedInRouter, function(req,res)
    {
        res.json({"message":"success",user:req.user});
    });

    router.post('/notificationhook',UserService.isLoggedInRouter, function(req,res)
    {
        let data = {
            user_id: req.user._id
        };
        NotificationHook.insertOne(data, function(error, result) {
            if (error) {
                return reject(error);
            }
            winston.info('NotificationHook created',data);
            data._id = result.insertedId;
            res.json(data);
        });
    });

    router.get('/notificationhook',UserService.isLoggedInRouter, function(req,res)
    {
        let query = {
            user_id: req.user._id
        };
        let sort = {

        };
        NotificationHook.find(query).sort(sort).toArray(function(err,objs) {
            res.json(objs);
        });
    });

    function getNotificationHook(req,res,next)
    {
        let query = {
            _id : ObjectID(req.params.id)
        };

        NotificationHook.findOne(query,function(err,obj) {
            res.notificationHook = obj;
            next();
        });
    }

    //TODO better security on this endpoint.
    router.post('/notificationhook/:id/notify', getNotificationHook, function (req, res) {
        let notificationHook = res.notificationHook;
        if (!notificationHook) {
            return res.status(404).json({})
        }
        let dataToSend = req.body;
        let id = getGuid();

        return getSubscriptionsFromDatabase(notificationHook.user_id)
            .then(function (subscriptions) {
                let promiseChain = Promise.resolve();

                //This is some good code for handling a list of promises. I will steal.
                for (let i = 0; i < subscriptions.length; i++) {
                    const subscription = subscriptions[i];
                    // const subscription = 1;
                    promiseChain = promiseChain.then(() => {
                        return triggerPushMsg(subscription, dataToSend, id);
                    });
                }

                return promiseChain;
            }).then(() => {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({data: {success: true}}));
            })
            .catch(function (err) {
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


    var cron = require('node-cron');

    //At minute 0 past every hour from 8 through 16.
    let reminderSchedule = "0 8-16 * * *";
    // reminderSchedule = "* * * * * *";
    cron.schedule(reminderSchedule, function () {
        logWithTrace('info','cron scheduled');
        let dataToSend = "Service Reminders?";
        let id = getGuid();
        return getAllSubscriptionsFromDatabase()
            .then(function(subscriptions) {
                let promiseChain = Promise.resolve();
                for (let i = 0; i < subscriptions.length; i++) {
                    const subscription = subscriptions[i];
                    promiseChain = promiseChain.then(() => {
                        return triggerPushMsg(subscription, dataToSend,id);
                    });
                }
                return promiseChain;
            }).then(() => {
            })
            .catch(function(err) {
            });
    });

    function checkOverdue()
    {
        let dateNow = Date.now();

        winston.info('checkOverdue',dateNow);

        let overDueQuery = {
            'status': 'in_progress',
            'due': {$lt: dateNow}
        };
        QueueItem.find(overDueQuery).sort({}).toArray(function(err,objs) {
            sendOverDueNotifications(objs);
        });
    }

    function sendOverDueNotifications(objs)
    {


        let userIds = {};
        if (objs.length > 0) {
            winston.info(JSON.stringify(objs));
            for(let i in objs) {
                let queueItem = objs[i];
                winston.info(JSON.stringify(queueItem));
                userIds[queueItem.user_id] = queueItem;
            }
            winston.info('found queue items ' + JSON.stringify(userIds));

            for(let user_id in userIds)
            {
                winston.info('sending overdue');
                let dataToSend = "You have overdue items.";
                let id = getGuid();
                user_id = ObjectID(user_id);
                return getSubscriptionsFromDatabase(user_id)
                    .then(function(subscriptions) {
                        winston.info('found subscriptions '
                            + JSON.stringify(subscriptions));

                        let promiseChain = Promise.resolve();
                        for (let i = 0; i < subscriptions.length; i++) {
                            const subscription = subscriptions[i];
                            promiseChain = promiseChain.then(() => {
                                return triggerPushMsg(subscription, dataToSend,id);
                            });
                        }
                        return promiseChain;
                    }).then(() => {
                    })
                    .catch(function(err) {
                    });
            }
        }
    }

    let checkOverdueInterval = process.env.OVERDUE_CHECK_INTERVAL || (5 * (60 * 1000))
    setInterval(
        checkOverdue,
        checkOverdueInterval
    );



    winston.info('loading /pushnotifications/save-subscription POST');

    router.post('/pushnotifications/save-subscription',UserService.isLoggedInRouter, function(req,res) {
        if (req.user._id) {
            let data = req.body;
            data.user_id = req.user._id;
            return saveSubscriptionToDatabase(data)
                .then(function(subscription) {
                    return res.json(subscription);
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
        }
        else {
            res.status(401).json({'message':'failed to save message no user'});
        }

    });

    winston.info('loaded /pushnotifications/save-subscription POST');


    // (function pushNotifications() {
        winston.info('loading push notifications');
        let subscriptions = [];
        function saveSubscriptionToDatabase(data)
        {
            return new Promise(function(resolve,reject) {
                Subscription.insertOne(data, function(error, result) {
                    if (error) {
                        return reject(error);
                    }
                    winston.info('subscription created',data);
                    data._id = result.insertedId;
                    resolve(data);
                });
            })
        }



        const deleteSubscriptionFromDatabase = function(id)
        {
            return new Promise(function(resolve) {
                Subscription.deleteOne({_id:ObjectID(id)},function(err, collectionEl) {

                });
                resolve();
            })
        };

        let getGuid = self.getGuid = function () {
            return crypto.randomBytes(10).toString('hex');
        };

        //https://github.com/winstonjs/winston/issues/200
    // function gLineInfo(prefix='') {
    //     stack = new Error().stack
    // # console.log stack.split('\n')[2]
    //         [file, line] = stack.split('\n')[2].split ':'
    //         [func, file] = file.split ' ('
    //         [func, file] = ['??', func] unless file # sometimes the function isn't specified
    //         [func, file] = [func.split(' ').pop(), path.basename(file)]
    //         [junk, func] = func.split('.')
    //     func = junk unless func
    //     func = if func is '??' or func is '<anonymous>' then ' (' else " (<#{func}> "
    //     prefix + func + file + ':' + line + ')'
    // }


    //https://stackoverflow.com/questions/33158974/how-to-log-javascript-objects-and-arrays-in-winston-as-console-log-does
        function logWithTrace(lvl,msg)
        {
            let stack = new Error().stack;
            stack = stack.split('\n');
// remove one line, starting at the first position
            stack.splice(0,2);
// join the array back into a single string
            stack = stack.join('\n');

            winston.log(lvl,msg + "\n" + stack);
        }

        function prettyJSON(data)
        {
            return JSON.stringify(data,null,'   ')
        }


        const triggerPushMsg = function(subscription, dataToSend,id) {
            let subscriptionData = {
                "endpoint": subscription.endpoint,
                "expirationTime": subscription.expirationTime,
                "keys": subscription.keys,
            };
            let obj = {};
            if (typeof dataToSend != 'object') {
                let obj = {
                    message: dataToSend
                };

            }
            else {
                obj = dataToSend;
            }
            obj._id = obj._id || getGuid();

            let objStr = prettyJSON(obj);
            logWithTrace('info',
                [
                    'triggering message on subscription',
                    prettyJSON(subscriptionData),
                    objStr
                ].join("\n")
            );
            return webpush.sendNotification(subscriptionData, objStr)
                .catch((err) => {
                    if (err.statusCode === 410) {
                        return deleteSubscriptionFromDatabase(subscription._id);
                    } else {
                        let message = ['Subscription is no longer valid',
                        err.message,
                            prettyJSON(subscriptionData),
                            objStr,
                        ].join("\n");
                        logWithTrace('warn',message);
                        // logWithTrace('warn',err.message);
                        deleteSubscriptionFromDatabase(subscription._id);
                    }
                });
        };

        const getSubscriptionsFromDatabase = function(user_id)
        {
            return new Promise(function(resolve) {
                let query = {user_id:user_id};
                let sort = {};
                // Subscription.find()
                Subscription.find(query).sort(sort).toArray(function(err,objs) {
                    return resolve(objs);
                });
            });
        };

    const getAllSubscriptionsFromDatabase = function()
    {
        return new Promise(function(resolve) {
            let query = {};
            let sort = {};
            // Subscription.find()
            Subscription.find(query).sort(sort).toArray(function(err,objs) {
                return resolve(objs);
            });
        });
    };


    // warn: You must pass in a subscription with at least an endpoint.
    //     emit {"type":"adminlog","message":"You must pass in a subscription with at least an endpoint.","level":"warn"}
    // info: triggering message on subscription
    // {"_id":"5a5f4f39d6cefb15afd204aa","endpoint":"https://fcm.googleapis.com/fcm/send/emvIeRktGwc:APA91bFhluf4ZKKCf8QNUVrFuqgvQonM9LAqe6sbv6MTzJBaHCXpRv6M_mArKDktZs0NCUix-hZjcOzjH1Uel4NWfW_pJEvksXrWbjCW1mTGvoal6hru_Zx7AHC58WmoyP4bLDb_0IA8","expirationTime":null,"keys":{"p256dh":"BJpiH0aZ3LIo-z1OjMEEDjncw-ad6gVRp2gG4GXCaDg5r2auEAjXur7aubXA6NwvuJGfCsYjp9wgAsoBdJy9tkg=","auth":"inosuZ1zxIzrc_2I4ua2yA=="},"user_id":"5a54b3119aa581065cc7847d"}
        router.use('/pushnotifications/test/:msg',UserService.isLoggedInRouter, function (req, res) {
            let dataToSend = req.params.msg;
            let id = getGuid();
            return getSubscriptionsFromDatabase(req.user._id)
                .then(function(subscriptions) {
                    let promiseChain = Promise.resolve();

                    //This is some good code for handling a list of promises. I will steal.
                    for (let i = 0; i < subscriptions.length; i++) {
                        const subscription = subscriptions[i];
                        // const subscription = 1;
                        promiseChain = promiseChain.then(() => {
                            return triggerPushMsg(subscription, dataToSend,id);
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

    // })();

    let pingInterval = (60) * 1000;
    setInterval(function() {
        logWithTrace('info','ping');
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
        winston.info('tcp server listening',server)
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


    let loggedIn = UserService.isLoggedInRouter;

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

        // if (req.body.due !== undefined) {
        //     req.body.due = new Date(req.body.due);
        // }
        // else {
        //
        // }

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
        // obj.due = new Date(req.due);

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
        console.log('MONGO_URI',MONGO_URI);


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
        //req.logIn on login/main.js
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
                    //https://stackoverflow.com/questions/9551634/how-to-log-stack-traces-in-node-js
//                     let stack = new Error().stack;
//                     stack = stack.split('\n');
// // remove one line, starting at the first position
//                     stack.splice(0,1);
// // join the array back into a single string
//                     stack = stack.join('\n');
                    self.log = function(lvl,msg) {
                        if (MiscService.emitAdminlog) {
                            MiscService.emitAdminlog(
                                JSON.stringify(
                                    {type: 'adminlog',
                                        'message': msg, // + "\n" + stack,
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
                        let fullMessage = err.stack || err.message;
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
                        else {
                            console.log(
                                JSON.stringify(
                                    {
                                        type: 'uncaughtException',
                                        'message': fullMessage,
                                        'level': 'error',
                                        'err': fullMessage
                                    }));
                            process.exit(1);
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
                    winston.info('/v1 user', req.user);
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


    })();


} else {
    console.log('required as a module');
}