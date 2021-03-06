let initilize = function (opts) {
    const crypto = require('crypto');
    const low = require('lowdb');
    const request = require('request');
    var webdriverio = require('webdriverio');
    var express = require('express');


    let logger = opts.logger;
    let app = opts.app;
    let noop = function(){};
    let getGuid = function () {
        return crypto.randomBytes(10).toString('hex');
    };

    logger.info(linenumber(),'started testsuites.js');

    const db = low(__dirname + '/.testsuites.json');
    db.defaults({
        testruns: [],
        testcaseruns: [],
        logs: [],
        testsuites: [],
        testcases: [],
        checkresults: []
    }).write();

    let repodb = opts.repodb || low(__dirname + '/testsuites.json');

    repodb.defaults({
        testsuites: [],
        testcases: [],
    }).write();


    const URL = require('url');
    const expect = require('chai').expect;

    const vm = require('vm');

    // const sandbox = {
    //     animal: 'cat',
    //     count: 2
    // };

    // const script = new vm.Script('count = function(){ return 1;}');
    // const context = new vm.createContext({});
    // const func = script.runInContext(context);
    //
    // process.exit();



    let self = {};
    self.db = db;

    self.app = app;
    self.logger = opts.logger;

    let current_testsuite = {};

    self.createClient = function(opts,cb)
    {
        client = webdriverio.remote(opts);

        client.init().then(function(val) {
            let sessionId;
            if (opts.sessionId) {
                sessionId = opts.sessionId;
                client.requestHandler.sessionID=sessionId;
            }
            else {
                sessionId = val.sessionId;
            }
            clientlogs[val.sessionId] = {client: client,client_request_logs: [],request_logs:[]};
            cb({id:val.sessionId});
        });

    };

    function getValFromPath(obj,path)
    {
        path = path.split('.');
        let val = obj;
        if (val == undefined) {
            return undefined;
        }
        for (let i in path) {
            if (val[path[i]] == undefined) {
                return undefined;
            }
            else {
                val = val[path[i]];

            }
        }
        return val;
    }

    //https://stackoverflow.com/questions/30853265/dynamic-chaining-in-javascript-promises
    self.doAction = function(client,actions)
    {
        let result = client;
        for (let i in actions) {
            let action = actions[i];
            let args;
            if (action.action == 'execute') {
                let script = new vm.Script('x =' + action.args[0]);
                let func = script.runInContext(new vm.createContext({}));
                args = [func];
            }
            else {
                args = action.args;
            }
            result = (function(action,result) {
                return result[action.action](...args).then(function(val) {

                    if (action.setEnv) {
                        let envVal = '';

                        envVal = getValFromPath(val,action.setEnv.path);

                        clientlogs[val.sessionId].envvars[action.setEnv.name] = envVal;
                    }
                    if (action.checks) {
                        // doChecks()
                    }
                    return val;
                });
            })(action,result)

        }
        return result;
    };

    var apitestsCreateRoutes = function () {

        app.all('/apitests/*', function (req, res, next) {
            timeout = 200;
            if (req.headers['x-timeout']) {
                timeout = req.headers['x-timeout'];
            }
            setTimeout(next, timeout)
        });

        app.post('/clienttests/client', function(req,res) {
            self.createClient(req.body, function(client) {
                res.json(client);
            });
        });

        function initClientLog(actions)
        {
            let result = {};

            result.description = '';

            result.started = Date.now();

            result.description = JSON.stringify(actions);
            return result;

            for (let i in actions) {
                let action = actions[i];

                result.

                    result.description +=  "(" + action.action + "," + action.args.join(',');

            }

        }

        self.doRequest = function (opts, cb) {
            var {URL} = require('url');
            var requestResponseObject = {
                created: Date.now(),
                request: {},
                response: {}
            };
            var requestObject = requestResponseObject.request;
            var responseObject = requestResponseObject.response;
            requestObject.rawRequestBody = opts.body || null;
            requestObject.headers = opts.headers;
            requestObject.qs = opts.qs || null;

            if (opts.body) {
                try {
                    requestObject.body = JSON.parse(opts.body);
                }
                catch (e) {
                    logger.error(e,'doReqeust','error');
                }
            }
            requestObject.url = opts.url;
            requestObject.method = opts.method;

            try {
                requestObject.path = (function (urlString) {
                    var urlParsed = new URL(urlString);
                    return urlParsed.pathname + urlParsed.search;
                })(opts.url);
            }
            catch (e) {
                return cb(e, null, null);
            }

            requestObject.rawRequestBody = opts.body;
            requestObject.headers = opts.headers;
            if (opts.body) {
                requestObject.body = JSON.parse(opts.body);
            }
            requestObject.url = opts.url;
            requestObject.method = opts.method;

            requestObject.path = (function (urlString) {
                var urlParsed = new URL(urlString);
                return urlParsed.pathname + urlParsed.search;
            })(opts.url);

            if (opts.timeout) {
                opts.timeout = parseInt(opts.timeout);
            }

            requestObject.started = Date.now();
            logger.info(linenumber(),JSON.stringify(opts,null,'    '));
            request(opts, function (err, response, body) {
                responseObject.ended = Date.now();
                if (err) {
                    responseObject.error = err;
                    return done(err, response, body);
                }
                else if (response && response.error) {
                    responseObject.error = response.error;
                    return done(err, response, body);
                }
                responseObject.body = null;
                responseObject.rawResponseBody = body;
                responseObject.headers = response.headers;
                responseObject.statusCode = response.statusCode;
                try {
                    responseObject.body = JSON.parse(responseObject.rawResponseBody);
                }
                catch (e) {
                }
                done(err, response, body);
            });

            var done = function (err, response, body) {
                cb(err, response, body, requestResponseObject);
            };
        };

        function findReplace(obj, envvars) {
            let regex = new RegExp("\\[\\[(.*?)\\]\\]");

            if (typeof obj === 'obj') {
                for (let i in obj) {
                    obj[i] = findReplace(obj[i], envvars);
                }
            }
            else if (typeof obj === 'string') {
                while (true) {
                    let results = obj.match(regex);
                    if (results) {
                        let val = envvars[results[1]];
                        obj = obj.replace(regex, val)
                    }
                    else {
                        break;
                    }
                }

                return obj;
            }
        }

        function setClientEnvvars(envvars,setenvvars,body)
        {
            for (var i in setenvvars) {
                let setenv = setenvvars[i];
                envvars[setenv.name] = getValFromPath(body,setenv.path);
            }
        }



        app.use("/testsuites-ui", express.static(__dirname + "/testsuites-ui"));



        (function testsuitesCRUD() {

            /*
             * update testsuite
             * don't delete anything
             */
            app.put('/testsuites/:id', function(req,res) {
                let obj = db.get('testsuites')
                    .find({id:req.params.id})
                    .assign(req.body)
                    .write();

                res.json(obj).end();
            });

            /*
             * list testsuites
             */
            app.get('/testsuites', function(req,res) {
                let obj = db.get('testsuites')
                    // .filter({})
                    .value();

                logger.info(linenumber(),obj);

                res.json(obj);
            });

            /*
             * find a testsuite and all releated info.
             * testcases with their checks and setEnvvars required to run a testsuite.
             */
            app.get('/testsuites/:id', function(req,res) {
                let obj = db.get('testsuites')
                    .find({ id: req.params.id })
                    .value();

                if (!obj) {
                    return res.end();
                }

                obj.testcases = db.get('testcases')
                    .filter({ testsuite_id: req.params.id })
                    .sortBy('order')
                    .value();

                res.json(obj);
            });


            /*
             * find a testsuite and all releated info.
             * testcases with their checks and setEnvvars required to run a testsuite.
             */
            app.post('/testsuites/:id/copy', function(req,res) {
                let obj = db.get('testsuites')
                    .find({ id: req.params.id })
                    .value();

                if (!obj) {
                    return res.end();
                }

                let newId = getGuid();

                let newName = obj.name + ' Copy';

                let newTestsuite = Object.assign({},obj,{id:newId,name:newName});

                db.get('testsuites')
                    .push(newTestsuite)
                    .write();

                let testcases = db.get('testcases')
                    .filter({ testsuite_id: req.params.id })
                    .sortBy('order')
                    .value();

                newTestsuite.testcases = [];

                logger.info(linenumber(),testcases);

                for (let i in testcases)
                {
                    let testcase = JSON.parse(JSON.stringify(testcases[i]));

                    logger.info(linenumber(),testcase);

                    testcase.id = getGuid();

                    testcase.testsuite_id = newTestsuite.id;

                    logger.info(linenumber(),testcase);

                    newTestsuite.testcases.push(testcase);

                    db.get('testcases')
                        .push(testcase)
                        .write();
                }



                res.json(newTestsuite).end();
            });

            /**
             * Delete testsuite and related records;
             * @param id
             */
            function deleteTestsuite(id)
            {
                db.get('testsuites')
                    .remove({ id: id })
                    .write();
            }

            /*
             * delete a testsuite
             */
            app.delete('/testsuites/:id', function(req,res) {

                deleteTestsuite(req.params.id);
                res.end();
            });

        })();

        /*
         * testcases get
         */
        app.get('/testsuites/:id/testcases', function(req,res) {
            obj = db.get('testcases')
                .filter({ testsuite_id: req.params.id })
                .sortBy('order')
                .value();

            res.json(obj);
        });

        function removeAllTestcasesWithoutTestsuite()
        {
            logger.info(linenumber(),'removeAllTestcasesWithoutTestsuite');
            let testcases = db.get('testcases')
                .value();

            db.get('testcases').remove().write();

            for (let i in testcases)
            {
                // logger.info(linenumber(),'removeAllTestcasesWithoutTestsuite');

                let tc = testcases[i];

                if (tc.testsuite_id)
                {
                    db.get('testcases').push(tc).write();
                }
            }

        }


        (function testcasesCRUD() {
            app.delete('/testsuites/:tsid/testcases/:id', function(req,res) {
                let id = req.params.id;
                // if (id == 'undefined') {
                //     removeAllTestcasesWithoutTestsuite();
                // }

                logger.info(linenumber(),id);

                db.get('testcases')
                    .remove({id: id })
                    .write();

                let testcase = db.get('testcases')
                    .find({id: id})
                    .value();

                if (testcase) {
                    return res.status(422).json(testcase);
                }

                res.end()
            });

            app.get('/testsuites/:tsid/testcases/:id/testruns/:trid/requestlogs', function(req,res) {

                let testcase_id = req.params.id;
                let testrun_id = req.params.trid;

                let logs = db.get('logs').filter({testrun_id:testrun_id,
                    testcase_id:testcase_id})
                    .value();
                return res.json(logs).end();
            });

            app.get('/testsuites/:tsid/testcases/:id/testruns/:trid/checkresults', function(req,res) {

                let testcase_id = req.params.id;
                let testrun_id = req.params.trid;

                let objs = db.get('checkresults')
                    .filter({testrun_id:testrun_id, testcase_id:testcase_id})
                    .value();
                return res.json(objs).end();
            });

        })();
        /*
         * testcase delete
         */

        function runTestCases(testrun,testcases,cb)
        {
            cb = cb || noop;
            let i = 0;
            let doIt = function()
            {
                if (i < testcases.length) {
                    let tc = testcases[i];
                    runTestCase(testrun,tc, function(result) {
                        let testcaserun = {};
                        result = JSON.parse(JSON.stringify(result));
                        if (result.testrun) {
                            Object.assign(testcaserun,result,{
                                id: result.id + result.testrun.id,
                                testrun_id: result.testrun.id,
                                testcase_id: result.id,
                            });

                            db.get('testcaseruns')
                                .push(
                                    JSON.parse(JSON.stringify(testcaserun))
                                )
                                .write();
                        }
                        i++;
                        doIt();

                    });

                }
                else {
                    let result = 'success';
                    db.get('testruns').find({id: testrun.id}).assign({status: 'done'}).write();
                    let tr = getTestRunFull(testrun.id);
                    let failedcrs = tr.checkresults.filter(function(cr) {
                        return cr.result !== 'success';
                    });

                    logger.info(linenumber(),failedcrs);

                    if (failedcrs.length > 0) {
                        result = 'failure';
                    }
                    db.get('testruns').find({id: testrun.id}).assign({result: result}).write();

                    cb(tr);
                }


            };
            doIt();
        }


        app.post('/testsuitescpy', function(req,res) {
            // let testsuite_id = req.body.testsuite_id;
            let target = req.body.target;

            let targetDb;
            let sourceDb;

            if (target == 'repo') {
                targetDb = repodb;
                sourceDb = db;
            }
            else if (target == 'main') {
                sourceDb = repodb;
                targetDb = db;
            }

            let testsuites = sourceDb.get('testsuites').value();
            targetDb.get('testsuites').remove().write();
            targetDb.get('testcases').remove().write();
            targetDb.get('testruns').remove().write();


            for (var i in testsuites)
            {
                let ts = testsuites[i];
                delete ts.testcases;

                targetDb.get('testsuites').push(ts).write();

                let testcases = sourceDb.get('testcases').filter({"testsuite_id": ts.id }).value();

                for (var i in testcases)
                {
                    let tc = testcases[i];

                    delete tc.checkresults;
                    delete tc.logs;
                    delete tc.testrun;


                    targetDb.get('testcases').push(tc).write();

                }

            }


            return res.json({});
        });

        function getTestsuiteEnvvarsObj(id)
        {
            let ts = db.get('testsuites')
                .find({id:id})
                .value();
            let result = {};

            logger.info(linenumber(),id,!!(ts.id));

            logger.info(linenumber(),ts,ts.envvars);

            if (ts.envvars) {
                for (var i in ts.envvars) {
                    result[ts.envvars[i].name] = ts.envvars[i].value;
                }
            }

            return result;
        }


        app.post('/testsuites/:id/run', function(req,res) {
            let obj = db.get('testsuites')
                .find({id:req.params.id})
                .value();

            let t = {
                id: getGuid(),
                status: 'pending',
                testsuite_id: obj.id,
                envvars: getTestsuiteEnvvarsObj(req.params.id)
            };

            db.get('testruns')
                .push(
                    JSON.parse(JSON.stringify(t))
                )
                .write();

            let testcases = db.get('testcases')
                .filter({testsuite_id:req.params.id})
                .sort('order')
                .value();


            runTestCases(t,testcases,function(tr) {
                if (tr.result != 'success') {
                    res.status(422);
                }
                return res.json(tr);
            });

            // return res.json(t);

        });


        app.post('/testsuites/:id/removelivetestrun', function(req,res)
        {
            let tr = getLiveTestrun(req.params.id);
            if (tr) {
                db.get('testruns').remove({id:tr.id}).write();
                db.get('logs').remove({testrun_id:tr.id}).write();
                db.get('testcaseruns').remove({testrun_id:tr.id}).write();

                // db.get('testcases').remove({testsuite_id:req.params.id}).write();
                db.get('checkresults').remove({testsuite_id:req.params.id}).write();

            }
            res.end();
        });


        app.post('/testsuites', function(req,res) {
            obj = req.body;

            if (!obj.id)
            {
                obj.id = getGuid();
            }

            db.get('testsuites')
                .push(
                    JSON.parse(JSON.stringify(obj))
                )
                .write();
            let t = {
                id: obj.id + '-live',
                status: 'pending',
                envvars: getTestsuiteEnvvarsObj(obj.id),
                testsuite_id: obj.id
            };

            res.json(obj);
        });

        /*
         * find and replace testsuite
         * current recent testrun
         */
        app.post('/testsuites/:id', function(req,res) {
            db.get('testsuites')
                .remove({ id: req.params.id })
                .write();

            var obj = {id: req.params.id};
            Object.assign(obj,req.body);
            db.get('testsuites')
                .push(
                    JSON.parse(JSON.stringify(obj))
                )
                .write();
            let t = {
                id: obj.id + '-live',
                status: 'pending',
                envvars: getTestsuiteEnvvarsObj(req.params.id),
                testsuite_id: obj.id
            };
            db.get('testruns').remove({id:t.id}).write();
            db.get('logs').remove({testrun_id:t.id}).write();
            db.get('testcaseruns').remove({testrun_id:t.id}).write();
            db.get('testcases').remove({testsuite_id:req.params.id}).write();
            db.get('checkresults').remove({testsuite_id:req.params.id}).write();


            db.get('testruns')
                .push(
                    JSON.parse(JSON.stringify(t))
                )
                .write();

            res.json(obj);


        });

        function getTestRunFull(id) {
            let logs = db.get('logs').filter({testrun_id:id}).value();
            let testcaseruns = db.get('testcaseruns')
                .filter({testrun_id:id}).value();

            let obj = db.get('testruns')
                .find({ id: id })
                .value();

            let testcases = db.get('testcases')
                .filter({testsuite_id:obj.testsuite_id}).value();


            let checkresults = db.get('checkresults')
                .filter({testrun_id:id}).value();

            obj.checkresults = checkresults;
            obj.logs = logs;
            obj.testcaseruns = testcaseruns;
            obj.testcases = testcases;
            return obj;
        }

        app.get('/testsuites/:tsid/testruns/:id', function(req,res) {

            res.json(getTestRunFull(req.params.id));
        });

        app.get('/testruns/:id', function(req,res) {

            res.json(getTestRunFull(req.params.id));
        });


        function addRun() {

        }

        function getValForCheck(val,requestlog,testrun)
        {
            let result;
            if (val.type == 'response_body') {
                logger.info(linenumber(),'getValForCheck',requestlog.response.body,val.path);
                result = getValFromPath(requestlog.response.body,val.path);
            }
            else if (val.type == 'status_code') {
                result = requestlog.response.statusCode;
            }
            else if (val.type == 'input') {
                result = val.val;
            }
            else if (val.type == 'envvar') {
                result = testrun.envvars[val.name];
            }
            if (val.modifier == 'length') {
                if (result !== undefined) {
                    result = result.length;
                }
            }
            return result;
        }

        /**
         * Run a testcase
         * @param testrun
         * @param testcase
         * @param cb
         */
        function runTestCase(testrun,testcase,cb) {
            testcase.logs = [];

            let setEnvvars = Object.assign({},testcase.setEnvvars);
            let opts = Object.assign({},testcase.opts);

            if (opts.headers) {
                opts.headers = findReplace(opts.headers,testrun.envvars);
                try {
                    opts.headers = JSON.parse(opts.headers);
                }
                catch (e){}
            }
            opts.headers = opts.headers || {};
            opts.headers['cookie'] = testrun.cookie;
            opts.headers['user-agent'] = opts.headers['user-agent'] || 'testsuite-agent';

            let checks = Object.assign({},testcase.checks);

            let currentenvvars = testrun.envvars;

            opts.url = findReplace(opts.url,testrun.envvars);
            if (opts.json) {
                opts.body = JSON.stringify(opts.json);
                delete opts.json;
            }

            logger.info(linenumber(),opts.body);


            opts.body = findReplace(opts.body,testrun.envvars);

            logger.info(linenumber(),opts.body);


            self.doRequest(opts,function(err,r,body,requestlog) {
                if (requestlog == undefined) {
                    testcase.status = 'failed';
                    if (err) {
                        testcase.err = {
                            message: err.message
                        }
                    }
                    return cb(testcase);
                }
                requestlog.testrun_id = testrun.id;
                requestlog.testcase_id = testcase.id;

                db.get('logs').remove({testrun_id:requestlog.testrun_id,
                    testcase_id:requestlog.testcase_id}).write();

                db.get('logs').push(
                    JSON.parse(JSON.stringify(requestlog
                    ))).write();

                testcase.logs.push(requestlog);


                if (setEnvvars) {
                    logger.info('setEnvvars', setEnvvars);
                    let envvars = {};
                    for (let i in setEnvvars) {
                        let setenv = setEnvvars[i];
                        logger.info(linenumber(), 'setenv', setenv);

                        if (setenv.type == 'response_body') {
                            envvars[setenv.name] =
                                getValFromPath(requestlog.response.body
                                    , setenv.path);
                        }
                        else if (setenv.type == 'response_headers') {
                            envvars[setenv.name] =
                                getValFromPath(requestlog.response.headers
                                    , setenv.path);
                        }
                    }

                    logger.info(linenumber(), 'setEnvvars', envvars, testrun.id);

                    let trAssign = {envvars: currentenvvars};
                    if (requestlog.response.headers && requestlog.response.headers['set-cookie']) {
                        trAssign.cookie = requestlog.response.headers['set-cookie'];
                    }

                    Object.assign(currentenvvars,envvars);
                    db.get('testruns').find({id: testrun.id}).assign(trAssign).write();


                    logger.info(linenumber(), 'testruns',
                        JSON.stringify(db.get('testruns').find({id: testrun.id}).value().envvars));

                }


                let checkresults = [];
                db.get('checkresults').remove({testcase_id:testcase.id}).write();
                if (checks) {

                    for (let i in checks) {
                        let check = checks[i];
                        logger.info(linenumber(),'check',check);

                        let checkresult = {
                            'check': JSON.parse(JSON.stringify(check)),
                            'id': getIdFromName(check.name),
                            'testsuite_id': testrun.testsuite_id,
                            'testrun_id': testrun.id,
                            'testcase_id': testcase.id
                        };
                        // currentenvvars
                        let val1;
                        let val2;

                        checkresult.type = check.type;
                        if (check.type == 'equals') {
                            val1 = getValForCheck(check.val1,requestlog,testrun);
                            val2 = getValForCheck(check.val2,requestlog,testrun);

                            logger.info(linenumber(),val1,val2);

                            checkresult.val1 = val1;
                            checkresult.val2 = val2;

                            if (val1 != val2) {
                                checkresult.result = 'failure';
                                checkresult.error = {
                                    message: 'Expected ' + val1 + ' to equal ' + val2
                                }
                            }
                            else {
                                checkresult.result = 'success';
                            }
                        }
                        else if (check.type == 'typeof') {
                            val1 = getValForCheck(check.val1,requestlog,testrun);
                            checkresult.result = 'failure';

                            if (check.typeof == 'int') {
                                if (parseInt(val1) === val1) {
                                    checkresult.result = 'success';
                                }
                            }
                            else {
                                if (typeof val1 === check.typeof) {
                                    checkresult.result = 'success';
                                }
                            }

                        }
                        else if (check.type == 'gt') {
                            val1 = getValForCheck(check.val1,requestlog,testrun);
                            val2 = getValForCheck(check.val2,requestlog,testrun);

                            logger.info(linenumber(),val1,val2);

                            checkresult.val1 = val1;
                            checkresult.val2 = val2;

                            if (!(val1 > val2)) {
                                checkresult.result = 'failure';
                                checkresult.error = {
                                    message: 'Expected ' + val1 + ' > ' + val2
                                }
                            }
                            else {
                                checkresult.result = 'success';
                            }
                        }

                        else {
                            checkresult.result = 'failure';
                            checkresult.error = {
                                message: 'Invalid check.type'
                            }
                        }

                        checkresults.push(checkresult);
                        db.get('checkresults').push(
                            JSON.parse(JSON.stringify(checkresult))
                        ).write();

                    }

                    testcase.checkresults = checkresults;

                }

                testcase.testrun = testrun;

                cb(testcase);
            });


        }

        function setChecks() {

        }

        function getLiveTestrun(tsid)
        {
            return db.get('testruns').find({id:tsid+'-live'}).value();
        }

        function getCreateLiveTestrun(tsid)
        {
            let tr = getLiveTestrun(tsid);
            if (tr) {
                return tr;
            }

            let ts = db.get('testsuites').find({id:tsid}).value();

            let t = {
                id: tsid + '-live',
                status: 'pending',
                envvars: getTestsuiteEnvvarsObj(tsid),
                testsuite_id: tsid
            };

            db.get('testruns')
                .push(
                    JSON.parse(JSON.stringify(t))
                )
                .write();

            return t;

        }

        function getIdFromName(name)
        {
            let result = name.toLowerCase();
            result = result.split(' ');
            result = result.join('-');
            return result;
        }

        app.post('/testsuitehelpers/getidfromname', function(req,res) {
            res.json({id:getIdFromName(req.body.name),
                name:req.body.name});
        });

        app.post('/testsuitehelpers/get/:name', function(req,res) {
            let obj = {name:req.params.name,val:null};
            if (req.params.name == 'guid') {
                return res.json({name:req.params.name,val:getGuid()}).end();
            }
            res.json(obj).end();
        });


        app.post('/testsuites/:tsid/testcases/:id/reorder', function(req,res) {
            let testcases =  db.get('testcases')
                .filter({ testsuite_id: req.params.tsid })
                .sortBy('order')
                .value();

            let order = req.body.order;
            let id = req.body.id;
            let testcase =  db.get('testcases')
                .find({ testsuite_id: req.params.tsid, id: req.params.id })
                .value();
            let oldOrder = testcase.order;

            let result = {oldOrder:oldOrder,order:order,changed: 0,
                loops: []};

            if (oldOrder == order) {
                return res.json(result).end();
            }
            if (order > oldOrder) {
                for (let i in testcases)
                {
                    let tc = testcases[i];

                    result.loops.push(
                        {tc_id:tc.id,
                        tc_order:tc.order,oldOrder:oldOrder,
                    new_order:order}
                    );

                    if (tc.order > oldOrder && tc.order <= order) {
                        result.changed ++;
                        db.get('testcases').find({id:tc.id}).assign({order: tc.order - 1})
                            .write();
                    }
                }
            }
            else {
                for (let i in testcases)
                {
                    let tc = testcases[i];

                    result.loops.push(
                        {tc_id:tc.id,
                            tc_order:tc.order,oldOrder:oldOrder,
                            new_order:order}
                    );

                    if (tc.order < oldOrder && tc.order >= order) {
                        result.changed ++;
                        db.get('testcases').find({id:tc.id}).assign({order: tc.order + 1})
                            .write();
                    }
                }
            }

            db.get('testcases')
                .find({ testsuite_id: req.params.tsid, id: req.params.id })
                .assign({order:order})
                .write();

            return res.json(result).end();


        });

        /**
         * Remove replace testcase. Return result of live testrun.
         * Use name + tsid
         * Add testcaserun
         */
        app.post('/testsuites/:tsid/testcases', function(req,res) {

            var testcases =  db.get('testcases')
                .filter({ testsuite_id: req.params.tsid })
                .sortBy('order')
                .value();

            let id;
            if (req.body.id) {
                id = req.body.id;
            }
            else {
                id = getGuid();
            }


            let testcase = db.get('testcases')
                .find({ id: id })
                .value();

            let obj = {id: id};

            Object.assign(obj,req.body);

            obj.testsuite_id = req.params.tsid;

            if (!testcase) {
                db.get('testcases')
                    .push(
                        JSON.parse(JSON.stringify(obj))
                    )
                    .write();
            }
            else {
                db.get('testcases')
                    .find({id: id})
                    .assign(
                        JSON.parse(JSON.stringify(obj))
                    )
                    .write();
            }

            let tr = getCreateLiveTestrun(req.params.tsid);

            tr.envvars = Object.assign({},getTestsuiteEnvvarsObj(req.params.tsid),tr.envvars);

            logger.info(tr.envvars);

            runTestCase(tr,obj, function(result) {
                let testcaserun = {};
                result = JSON.parse(JSON.stringify(result));
                if (result.testrun) {
                    Object.assign(testcaserun,result,{
                        id: result.id + result.testrun.id,
                        testrun_id: result.testrun.id,
                        testcase_id: result.id,
                    });

                    db.get('testcaseruns')
                        .remove({id:testcaserun.id})
                        .write();

                    db.get('testcaseruns')
                        .push(
                            JSON.parse(JSON.stringify(testcaserun))
                        )
                        .write();
                }


                res.json(result);
            });

        });


        app.post('/clienttests/client/:id/request', function(req,res) {

            let sessionId = req.params.id;

            let doFunc = function() {
                let setEnvvars = req.body.setEnvvars;
                let opts = req.body.opts;

                opts.url = findReplace(opts.url,clientlogs[sessionId].envvars);

                self.doRequest(opts,function(err,r,body,requestlog) {
                    clientlogs[sessionId].request_logs.push(
                        JSON.parse(JSON.stringify(requestlog))
                    );
                    if (setEnvvars) {
                        setClientEnvvars(clientlogs[sessionId].envvars,setEnvvars,requestlog);
                    }

                    res.json(requestlog).end();
                })
            };

            if (!clientlogs[sessionId]) {
                clientlogs[sessionId] = {client:null,client_request_logs: [], request_logs: [], envvars: {}};
                clientlogs[sessionId].client = webdriverio.remote(sessionId).then(function() {
                    return doFunc();
                });
            }
            else {
                return doFunc();
            }


        });

        //https://gist.github.com/anvk/5602ec398e4fdc521e2bf9940fd90f84
        app.post('/clienttests/client/:id/do', function(req,res) {
            let sessionId = req.params.id;

            let actions;

            let resultData = {};


            let doFunc = function()
            {
                let clientlog = clientlogs[sessionId];

                if ((req.body instanceof Array)) {
                    actions = req.body;
                }
                else {
                    actions = [req.body];
                }

                log = initClientLog(actions);

                log.result = 'pending';

                self.doAction(clientlog.client,actions).then(function(result) {
                    log.result = 'success';
                    // log.ended = Date.now();
                    res.json({sessionId:sessionId, val:result});
                }, function(result) {
                    log.result = 'failure';
                    // log.ended = Date.now();
                    res.status(422).json({sessionId:sessionId, err:result});
                }).catch(function(e) {
                    log.result = 'failure';
                    // log.ended = Date.now();
                    res.status(422).json({sessionId:sessionId, err:e});
                }).then(function() {
                    if (log.result == 'failure') {
                        clientlog.result = 'failure'
                    }
                    else if (log.result == 'success' && clientlog.result !== 'failure') {
                        clientlog.result = 'success'
                    }
                    else {
                        clientlog.result = 'failure'

                    }
                    log.ended = Date.now();
                    clientlog.client_request_logs.push(
                        JSON.parse(JSON.stringify(log))
                    );
                });

            };


            if (!clientlogs[sessionId]) {
                clientlogs[sessionId] = {client:null,client_request_logs: [], request_logs: [], envvars: {}};
                clientlogs[sessionId].client = webdriverio.remote(sessionId).then(function() {
                    return doFunc();
                });
            }
            else {
                return doFunc();
            }


        });


        app.get('/clienttests/client/:id', function(req,res) {
            let clientlog = clientlogs[req.params.id];
            return res.json(clientlog);
        })
    };

    apitestsCreateRoutes(app);
    return self;
};

module.exports = initilize;


if (!module.parent) {
    let express = require('express');
    var bodyParser = require('body-parser');
    var app = express();

    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());

    var winston = require('winston');

    var logger = new winston.Logger({
        transports: [
            new winston.transports.Console({
                level: 'info',
                colorize: true,
                // formatter: formatLogArguments
            })
        ],
        exitOnError: true
    });

    initilize({logger: logger, app: app});

    var server = require('http').Server(app);
    // io = require('socket.io')(server);
    var server = server.listen(3000, function () {
        winston.info('main application listening on port: ' + server.address().port);
        app.set('port', server.address().port);
    });

}



var path = require('path')
var PROJECT_ROOT = path.join(__dirname, '..')


function linenumber()
{
    let e = new Error();
    let linemessage = e.stack.split("\n")[2];

    linemessage = linemessage.split("/");
    linemessage = linemessage[linemessage.length - 2] + '/' + linemessage[linemessage.length - 1];
    linemessage = linemessage.substr(0,linemessage.length - 1);

    return linemessage;
}

