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
    let AddressList = 'address_list';



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

    let addressaddresslistModel = {
            'collection': 'addressadresslist',
            'columns': [
                {
                    'name': 'address_id',
                    'validation': function(obj,val)
                    {
                        let Address = db.collection('address');

                        return new Promise(function(resolve,reject) {
                            Address.findOne({'_id':val}, function(obj) {
                                if (obj) {
                                    resolve();
                                }
                                else {
                                    reject();
                                }
                            })
                        });
                    }
                },
                {
                    'addresslist_id': 'addresslist_id',
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
    };

    let models = [
        {
            'collection': 'addresslist',
            'columns': [
                {
                    'name': 'name',
                },
                {
                    'name': 'address_id',
                }
            ],
            'validation_rules': [
                function (obj) {
                    let val = obj['address_id'];
                    if (val) {
                        if (typeof val === 'string') {
                            val = [val];
                        }
                        let Address = db.collection('address');
                        return new Promise(function (resolve, reject) {
                            let length = val.length;
                            let processed = 0;
                            for (let i in val) {
                                let address_id = val[i];
                                Address.findOne({'_id': address_id}, function (obj) {
                                    if (obj) {
                                        processed++;
                                        if (lenth === processed) {
                                            resolve();
                                        }
                                    }
                                    else {
                                        return reject();
                                    }
                                })

                            }
                        });
                    }
                }
            ]
        },

    ];

    for (let i in models) {
        let model = models[i];
        createUserRelationEndpoints(model);
    }

    function validateModel(obj,validationRules)
    {
        return new Promise(function(resolve,reject) {
            resolve();
        })
    }

    function createUserRelationEndpoints(model)
    {
        let collectionName = model.collection;
        let Collection = db.collection('collectionName');
        let pathName = model.endpoint;

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

            validateModel(obj,model.validationRules).then(function() {
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
            }, function(err) {
                return res.status(400).json({meta: {
                    message: 'validation failed',
                    error: err
                }});
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