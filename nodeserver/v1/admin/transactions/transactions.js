console.log('loaded ' + __filename, Date.now());

/**
 *
 * https://github.com/jaredhanson/passport-fitbit
 *
 *
 * https://dev.fitbit.com/reference/web-api/basics/#hitting-the-rate-limit
 * Rate limit is currently 150 per user per hour.
 *
 *
 *
 * @param opts
 * @returns router
 */
module.exports = function (opts) {
    let request = require('request');
    let db = opts.db;
    // let User = opts.User;
    let User = db.collection('user');
    let UserService = opts.UserService;
    console.log(UserService.isAdmin);
    // process.exit();
    let Transaction = db.collection('transaction');
    let self = {};

    let winston = opts.winston || require('winston');
    winston.info('loaded winston');
    let router = opts.router || require('express').Router();

    let ObjectID = require('mongodb').ObjectID;


    router.use(UserService.isAdminRouter);

    //https://docs.mongodb.com/manual/tutorial/perform-two-phase-commits/
    self.addTransaction = function(user_id,amount,description,not_less_than)
    {
        if (description === undefined) {
            description = null;
        }
        if (not_less_than === undefined) {
            not_less_than = 0;
        }

        amount = parseInt(amount);

        let Collection = Transaction;
        // console.log(Collection);
        let obj = {
            created: Date.now(),
            user_id: user_id,
            amount: amount,
            description
        };
        winston.info('addTransaction',user_id,obj);

        return new Promise(function(resolve,reject) {

            User.findOne({
                _id: user_id
            }, function(err, user) {
                if (isNaN(amount)) {
                    return reject({error: 'amount is not a number'});
                }
                else if (typeof user.amount)
                winston.info(user);
                if (err) {
                    winston.error(err);
                    return reject(err);
                }
                if (!user) {
                    let err = {'error': 'user not found'};
                    winston.error(err);
                    return reject(err);
                }
                if (user.amount === undefined) {
                    winston.info('set user amount to 0');
                    user.amount = 0;
                }
                let user_amount = user.amount;
                user_amount += amount;
                if (user_amount < not_less_than) {
                    let err = {'error': 'user requires funds'};
                    winston.error(err);
                    return reject(err);
                }

                Collection.insertOne(obj, function (error, result) {
                    console.log('insert', obj);
                    if (error) {
                        winston.error(error);
                        return reject({error: error});
                    }
                    obj._id = result.insertedId;
                    let resObj = {
                        data: obj,
                        meta: {}
                    };

                    winston.info('increment user amount by ' + amount + ' on user_id ' + user_id);
                    User.updateOne({
                        _id: ObjectID(user_id)
                    }, {
                        $inc: {
                            amount: amount,
                        }
                    }, function(err, result) {
                        if (err) {
                            return reject(err);
                        }
                        resObj.meta.user_update = {result: result.result,
                            user_id:user_id,amount:amount};
                        winston.info(result.result);
                        return resolve(resObj);
                    });
                });
            });
        })
    };

    router.post('/', function(req, res) {
        //TODO req.body.amount validate.
        self.addTransaction(
            req.user._id,
            req.body.amount,
            req.body.description
        ).then(function (resObj) {
                res.json(resObj);
            },
            function (resObj) {
                console.log(resObj);
                res.status(400).json(resObj);
            }).catch(function (err) {
            // console.log(err);
            // return res.status(400).json(err);
            // winston.error(err);
            // return reject({error: error});

        });
    });

    router.get('/', function(req, res) {
        let queryParams = req.query || {};
        let Collection = Transaction;

        let query = {};
        Collection.find(query).sort({
            "created": -1,
        }).toArray((function(err, collectionResults) {
            if (err) {
                winston.error(err);
            }

            let objResponse = {
                data: collectionResults,
                meta: {
                    query: query
                }
            };
            res.json(objResponse);
        }));
    });

    //todo aggregates
    // router.get('/sum', function(req, res) {
    //     let queryParams = req.query || {};
    //     let Collection = Transaction;
    //
    //     let query = {};
    //     Collection.aggregate({ $group: { _id : null, sum : { $sum: "$amount" } } }
    //     ).toArray((function(err, collectionResults) {
    //         if (err) {
    //             winston.error(err);
    //         }
    //
    //         let objResponse = {
    //             data: collectionResults,
    //             meta: {
    //                 query: query
    //             }
    //         };
    //         res.json(objResponse);
    //     }));
    // });


    self.router = router;
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


        var mainLogger = new winston.Logger({
            transports: [
                new winston.transports.Console({ level: 'info' }),
            ],
            exceptionHandlers: [new winston.transports.Console({
                colorize: true,
                json: true
            })],
            exitOnError: process.env.NODE_ENV == 'DEV'
        });

        mainLogger.debug('mainLogger');
        mainLogger.info('mainLogger');
        mainLogger.error('mainLogger');

        const MongoClient = require('mongodb').MongoClient;

        MongoClient.connect(MONGO_URI, function (err, db) {
            if (err) {
                throw err;
            }
            app.listen(3000, function () {

                app.use(express.static(path.join(__dirname,'..','..','..', 'public/')));

                app.use('/v1', require(__dirname + '/../../../v1/login/main.js')({
                    winston: mainLogger,
                    database: db,
                    passport: passport,
                }).router);

                let UserService = require(__dirname + '/../../../v1/users/main')({
                    winston: mainLogger,
                    database: db,
                    passport: passport,
                });

                // console.log(UserService);
                // process.exit();
                console.log(UserService.isAdmin);

                app.use('/v1/admin/transaction', function (req, res, next) {
                        winston.info('user', {_id: req.user._id + ''});
                        next();
                    }, module.exports({
                        UserService: UserService,
                        CODERUSS_BASE_URL: 'http://localhost:3000',
                        winston: winston,
                        db: db,
                    }).router
                );

                app.use('/v1/users', UserService.router);

                let cp = require('child_process');
                let spawn = cp.spawn;

                let child = spawn("mocha", ['./**/*_spec.js','--bail'],
                    {cwd: __dirname, env: process.env});
                child.stdout.on('data', function (data) {
                    process.stdout.write(data);
                });

                child.stderr.on('data', function (data) {
                    process.stderr.write(data);
                });
                child.on('exit', function (exitcode) {
                    if (exitcode !== 0) {
                        // process.exit(exitcode);
                    }
                });

            });

        });


    })();


} else {
    console.log('required as a module');
}