let initilize = function (opts) {
    const crypto = require('crypto');
    const low = require('lowdb');
    const request = require('request');
    var webdriverio = require('webdriverio');

    const db = low(__dirname + '/testsuites.json');
    db.defaults({
        testruns: [],
        testcaseruns: [],
        logs: [],
        testsuites: [],
        testcases: [],
        // envvars: [],
        checks: []
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
    // console.log(func());
    // process.exit();




    let self = {};
    self.db = db;

    let app = opts.app;
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
            console.log(client);
            clientlogs[val.sessionId] = {client: client,client_request_logs: [],request_logs:[]};
            cb({id:val.sessionId});
        });

    };

    function getValFromPath(obj,path)
    {
        // console.log(obj,path);
        path = path.split('.');
        let val = obj;
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
                    console.log(action,result,clientlogs[val.sessionId]);

                    if (action.setEnv) {
                        let envVal = '';
                        console.log(envVal);

                        console.log('getValFromPath',val,action.setEnv.path);
                        envVal = getValFromPath(val,action.setEnv.path);

                        console.log(envVal);

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
                console.log(client);
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
                    console.log(e);

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

            requestObject.started = Date.now();
            request(opts, function (err, response, body) {
                console.log(body);
                responseObject.ended = Date.now();
                if (err) {
                    responseObject.error = err;
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
            console.log('findReplace',obj, envvars);

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
                .push(obj)
                .write();
            let t = {
                id: obj.id + '-live',
                status: 'pending',
                // logs: [],
                envvars: {}
            };
            db.get('testruns').remove({id:t.id}).write();
            db.get('logs').remove({testrun_id:t.id}).write();
            db.get('testcaseruns').remove({testrun_id:t.id}).write();

            db.get('testruns')
                .push(t)
                .write();

            res.json(obj);


        });

        app.get('/testsuites/:tsid/testruns/:id', function(req,res) {
            let logs = db.get('logs').filter({testrun_id:req.params.id}).value();
            let testcaseruns = db.get('testcaseruns')
                .filter({testrun_id:req.params.id}).value();

            let obj = db.get('testruns')
                .find({ id: req.params.id })
                .value();
            Object.assign(obj,{logs:logs
                // ,testcaseruns:testcaseruns
            });
            obj.testcaseruns = testcaseruns;
            res.json(obj);
        });

        /*
         * find a testsuite
         */
        app.get('/testsuites/:id', function(req,res) {
            let obj = db.get('testsuites')
                .find({ id: req.params.id })
                .value();
            res.json(obj);
        });


        function addRun() {

        }

        function runTestCase(testrun,testcase,cb) {
            testcase.logs = [];

            let setEnvvars = testcase.setEnvvars;
            let opts = testcase.opts;

            console.log('opts',opts,testrun);

            opts.url = findReplace(opts.url,testrun.envvars);

            console.log('opts',opts);

            self.doRequest(opts,function(err,r,body,requestlog) {
                requestlog.testrun_id = testrun.id;
                requestlog.testcase_id = testcase.id;

                db.get('logs').remove({testrun_id:requestlog.testrun_id,
                    testcase_id:requestlog.testcase_id}).write();

                db.get('logs').push(requestlog).write();

                testcase.logs.push(requestlog);


                if (setEnvvars) {
                    setClientEnvvars(testrun.envvars,setEnvvars,requestlog);
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

        function getIdFromName(name)
        {
            return name;
        }

        /**
         * Remove replace testcase. Return result of live testrun.
         * Use name + tsid
         * Add testcaserun
         */
        app.post('/testsuites/:tsid/testcases', function(req,res) {

            let id = req.params.tsid + '-' + getIdFromName(req.body.name);
            db.get('testcases')
                .remove({ id: req.params.id })
                .write();

            let tr = getLiveTestrun(req.params.tsid);

            var obj = {id: id};
            Object.assign(obj,req.body);
            db.get('testcases')
                .push(obj)
                .write();

            runTestCase(tr,obj, function(result) {
                let testcaserun = {};
                Object.assign(testcaserun,result,{
                    id: result.id + result.testrun.id,
                    testrun_id: result.testrun.id,
                    testcase_id: result.id,
                });

                db.get('testcaseruns')
                    .remove({id:testcaserun.id})
                    .write();

                db.get('testcaseruns')
                    .push(testcaserun)
                    .write();

                res.json(result);
            });

        });

        app.post('/testsuites/:id/testcases/:id/checks', function(req,res) {

        });


        app.post('/testsuites/:id/testcases/:id/setenvs', function(req,res) {

        });


        app.post('/clienttests/client/:id/request', function(req,res) {

            let sessionId = req.params.id;

            let doFunc = function() {
                let setEnvvars = req.body.setEnvvars;
                let opts = req.body.opts;

                console.log('opts',opts,clientlogs[sessionId]);

                opts.url = findReplace(opts.url,clientlogs[sessionId].envvars);

                console.log('opts',opts);

                self.doRequest(opts,function(err,r,body,requestlog) {
                    clientlogs[sessionId].request_logs.push(requestlog);
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
                    clientlog.client_request_logs.push(log);
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
            console.log(clientlog);
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
                level: 'debug',
                colorize: true,
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