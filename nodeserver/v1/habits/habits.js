module.exports = function(opts) {
    var http = require('http');
    var url = require('url');
    var express = require('express');
    var winston = opts.winston || require('winston');
    var fs = require('fs');
    var inspect = require('util').inspect;
    var current_files = {};
    var doDelete = true;
    var ObjectID = require('mongodb').ObjectID;
    var uuid = require('node-uuid');
    var router = express.Router();

    var module = {};

    var bcrypt = require('bcrypt');

    const User = opts.db.collection('user');


    router.use(function(req, res, next) {
        req.user_id = null;
        winston.debug('authentication status');
        winston.debug(req.isAuthenticated());
        winston.debug(req.user);
        if (req.user) {
            req.user_id = req.user._id;
        }
        next();
    });

    var sessionMiddleware = opts.sessionMiddleware;

    var indexedSockets = {};
    var sockets = [];
    var connectCounter = 0;


    // router.use(passport.authenticate('local'));

    var expiry = opts.expiry || 86400000; //24 hours

    var multer = require('multer');

    const db = opts.db;

    const Habit = opts.db.collection('habit');
    const HabitDate = opts.db.collection('habit_date');


    var cron = require('node-cron');


    module.router = router;

    var storage = multer.memoryStorage();


    router.get('/', function(req, res) {
        var query = {
            "user_id": req.user_id
        };
        console.log(query);
        Habit.find(query).sort({
            "created": -1,
        }).toArray((function(err, results) {
            if (err) {
                winston.error(err);
            }
            winston.info(results); // output all records
            res.setHeader('content-type', 'application/json; charset=utf-8');

            res.send(JSON.stringify(results));
            return;
        }));
        return;
    });


    router.post('/', function(req, res) {
        winston.info('request params=' + JSON.stringify(req.params));
        winston.info('request body=' + JSON.stringify(req.body));
        var obj = {
            name: req.body.name,
            text: req.body.text ? req.body.text : null,
            created: Date.now(),
            due: Date.now() + 1000 * 60 * 60 * 5,
            reminder: Date.now() + 1000 * 60 * 30,
            user_id: req.user_id,
            dates: req.body.dates || {}
        };
        console.log(obj)
        Habit.insertOne(obj, function(error, result) {
            if (error) {
                winston.error(error);
                return res.status(500).json({
                    error: error
                })
            }
            obj._id = result.insertedId;
            res.setHeader('content-type', 'application/json; charset=utf-8');
            res.status(201).send(JSON.stringify(obj)).end();
            return;
        });

    });

    function getHabit(req,res,next) {
        var habit_id = ObjectID(req.params.id);
        Habit.findOne({_id:habit_id,user_id:req.user_id},function(err,habit) {
            if (!habit) {
                return res.status(404).end();
            }
            else {
                req.habit = habit;
                next();
            }
        })
    }

    router.get('/:id/dates/:date', getHabit, function(req,res) {
        var obj = {
            habit_id: req.habit._id,
            date: req.params.date,
        };

        HabitDate.findOne(obj, function(err, habitdate) {
            if (err)
            {
                winston.err(err);
            }
            if (habitdate) {
                return res.json(habitdate).end();
            }
            else {
                obj.status = 'incomplete';
                HabitDate.insertOne(obj, function(error, result) {
                    obj._id = result.insertedId;
                    res.json(obj).end();
                });
            }
        });


    });

    router.post('/:id/dates/:date',getHabit, function(req, res) {
        var obj = {
            habit_id: req.habit._id,
            date: req.params.date
        };

        HabitDate.findOne(obj, function(err, habitdate) {
            if (err)
            {
                winston.err(err);
            }
            if (habitdate) {
                Object.assign(habitdate,{status:req.body.status});
                HabitDate.updateOne({_id:habitdate._id},
                    {$set:{status:habitdate.status}},
                function(error, result) {
                    return res.json(habitdate).end();
                });

            }
            else {
                obj.status = req.body.status;
                HabitDate.insertOne(obj, function(error, result) {
                    obj._id = result.insertedId;
                    res.json(obj).end();
                });
            }
        });
    });
    
    var validateDates = function(dates)
    {
        var result = {};
        for (var key in dates)
        {
            result[key] = dates[key];
            result[key].completed = parseInt(dates[key].completed)
        }
        return result;
    }
    
    var validateHabitUpdate = function(body)
    {
        var dates = validateDates(body.dates);
        var result = {
            created: body.created,
            user_id: body.user_id ? body.user_id : null,
            dates: body.dates ? body.dates : {},
            reminder: body.reminder,
            due: body.reminder,
            text: body.text
        };
        
        return result;
    }

    router.put('/:id', function(req, res) {
        winston.debug('request params=' + JSON.stringify(req.params));
        winston.debug('request body=' + JSON.stringify(req.body));
        var habitUpdate = validateHabitUpdate(req.body);
        Habit.updateOne({
            _id: ObjectID(req.params.id)
        }, {
            $set: habitUpdate
        }, function(err, result) {
            if (err) {
                winston.error(err);
            }
            Habit.findOne({
                _id: ObjectID(req.params.id)
            }, function(err, habit) {
                if (err)
                {
                    winston.err(err);
                }
                return res.status(201)
                .json(habit).end();
            });
        });
        return;
    });


    router.delete('/:id', function(req, res) {
        winston.debug('request params=' + JSON.stringify(req.params));
        winston.debug('request body=' + JSON.stringify(req.body));
        Habit.remove({
            _id: ObjectID(req.params.id),
            user_id: req.user_id
        }, {
            w: 1
        }, function(error, result) {
            if (error) {
                // winston.error(error);
            }
            winston.debug(result.result);
        });

        res.end();
    });



    if (process.env.NODE_ENV === 'DEV') {
        let cp = require('child_process');
        let spawn = cp.spawn;
        console.log('habits',process.env.NODE_ENV,'run test:main');
        // var child = spawn("npm",['run','test:main'],
        //     { cwd: __dirname, env: process.env });

        //mocha ./nodeserver/v1/**/*_spec.js
        let child = spawn("mocha", ['./**/*_spec.js'],
            {cwd: __dirname, env: process.env});

        //requires mocha installed globally.

        child.stdout.on('data', function(data) {
            process.stdout.write(data);
        });

        child.stderr.on('data', function(data) {
            process.stderr.write(data);
            // process.exit(1);
        });
        child.on('exit', function(exitcode) {
            if (exitcode !== 0) {
                process.exit(exitcode);
            }
        })
    }



    return module;
};
