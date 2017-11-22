console.log('loaded fitbit.js', Date.now());

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
    let User = opts.User;

    let winston = opts.winston || require('winston');
    winston.info('loaded winston');
    let router = opts.router || require('express').Router();


    router.use(function (req, res, next) {
        if (req.user) {
            req.user_id = req.user._id;
            return next();
        }
        else {
            return res.status(401).json({message: 'must be logged in'});
        }
    });

    let models = [
        {
            'collection': 'address',
            'endpoint': '/addresses',
            'columns': [
                {
                    'name': 'name',
                },
                {
                    'name': 'address',
                },
                {
                    'name': 'city',
                },
                {
                    'name': 'state',
                },
                {
                    'name': 'zip',
                },
                {
                    'name': 'created',
                }
            ]
        }
    ];

    for (let i in models) {
        let model = models[i];
        createUserRelationEndpoints(model);
    }

    function createUserRelationEndpoints(model)
    {
        let collectionName = model.collection;
        let Collection = db.collection('collectionName');
        let pathName = model.endpoint;

        console.log(pathName);

        router.post(pathName,function(req,res) {
            winston.info('request params=' + JSON.stringify(req.params));
            winston.info('request body=' + JSON.stringify(req.body));

            let obj = {
                created: Date.now(),
                user_id: req.user_id,
            };

            for (let i in model.columns) {
                let columnObj = model.columns[i];
                let key = columnObj.name;
                if (req.body[key]) {
                    obj[key] = req.body[key];
                }
            }

            Collection.insertOne(obj, function(error, result) {
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

        /**
         * Lists also need pagination.
         * data: [Collection1,Collection2]
         */
        router.get(pathName,function(req,res) {
            let query = {
                'user_id': req.user_id
            };
            Collection.find(query).sort({
                "created": -1,
            }).toArray((function(err, collectionResults) {
                if (err) {
                    winston.error(err);
                }

                let objResponse = {
                    data: collectionResults,
                    meta: {}
                };
                res.json(objResponse);
            }));
        });


        router.get(pathName + '/:id',function(req,res) {
            let query = {
                'user_id': req.user_id,
                '_id': req.params.id
            };
            winston.info(query);
            Collection.findOne(query,function(err, collectionEl) {
                if (err) {
                    winston.error(err);
                }

                let objResponse = collectionEl;
                res.json(objResponse);
            });
        });


    }


    return router;
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

                app.use(express.static(path.join(__dirname,'..','..', 'public/')));

                app.use('/v1', require(__dirname + '/../../v1/login/main.js')({
                    winston: mainLogger,
                    database: db,
                    passport: passport,
                }).router);

                app.use('/v1/users', require(__dirname + '/../../v1/users/main')({
                    winston: mainLogger,
                    database: db,
                    passport: passport,
                }).router);

                app.use('/v1/users/me', function (req, res, next) {
                    winston.info('user',{_id: req.user._id + ''});
                    next();
                },  module.exports({
                    CODERUSS_BASE_URL: 'http://localhost:3000',
                    winston: winston,
                    db: db,
                    User: db.collection('user'),
                    // models: [
                    //     {
                    //         'collection': 'address',
                    //         'columns': [
                    //             {
                    //                 'name': 'name',
                    //             },
                    //             {
                    //                 'name': 'address',
                    //             },
                    //             {
                    //                 'name': 'city',
                    //             },
                    //             {
                    //                 'name': 'state',
                    //             },
                    //             {
                    //                 'name': 'zip',
                    //             }
                    //         ]
                    //     }
                    // ]
                }));

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
                        // process.exit(exitcode);
                    }
                });

            });

        });


    })();


} else {
    console.log('required as a module');
}