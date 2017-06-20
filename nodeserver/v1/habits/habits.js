module.exports = function (opts) {
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
    
    
    router.use(function (req, res, next) {
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


    router.get('/', function (req, res) {
        var query = {
            "user_id": req.user_id
        };
        console.log(query);
        Habit.find(query).sort({
            "created": -1,
        }).toArray((function (err, results) {
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


    router.post('/', function (req, res) {
        winston.debug('request params=' + JSON.stringify(req.params));
        winston.debug('request body=' + JSON.stringify(req.body));
        var obj = {
            name: req.body.name,
            text: req.body.text ? req.body.text : null,
            created: Date.now(),
            due: Date.now() + 1000 * 60 * 60 * 5,
            reminder: Date.now() + 1000 * 60 * 30,
            user_id: req.user_id
        };
        console.log(obj)
        Habit.insertOne(obj, function (error, result) {
            if (error) {
                winston.error(error);
                return res.status(500).json({error:error})
            }
            obj._id = result.insertedId;
            res.setHeader('content-type', 'application/json; charset=utf-8');
            res.status(201).send(JSON.stringify(obj)).end();
            return;
        });
        
    });

    router.post('/:id/dates', function (req, res) {
        winston.debug('request params=' + JSON.stringify(req.params));
        winston.debug('request body=' + JSON.stringify(req.body));


        res.status(201).end();
        return;
    });


    router.post('/:id', function (req, res) {
        winston.debug('request params=' + JSON.stringify(req.params));
        winston.debug('request body=' + JSON.stringify(req.body));
        Habit.updateOne({ _id: ObjectID(req.params.id) },
            { $set: req.params });
        res.status(201).end();
        return;
    });

    router.delete('/:id', function (req, res) {
        winston.debug('request params=' + JSON.stringify(req.params));
        winston.debug('request body=' + JSON.stringify(req.body));
        Habit.remove({ _id: ObjectID(req.params.id),
            user_id: req.user_id }, { w: 1 }, function (error, result) {
            if (error) {
                // winston.error(error);
            }
            winston.debug(result.result);
        });

        res.status(201).end();


    });


    return module;
};