let initilize = function (opts) {
    const crypto = require('crypto');
    const low = require('lowdb');
    const request = require('request');

    const FileSync = require('lowdb/adapters/FileSync')
    const adapter = new FileSync(__dirname + '/.apiTestsDb.json')
    const apiTestsDb = low(adapter)

    const URL = require('url');
    const expect = require('chai').expect;

    let self = {};
    self.apiTestsDb = apiTestsDb;

    let app = opts.app;
    self.app = app;
    self.logger = opts.logger;

    self.runTestSuiteById = function (id, cb) {
        // console.log(apiTestsDb.get('testsuites').value());
        // console.log(apiTestsDb.get('runs').value());

        var testsuite = apiTestsDb.get('testsuites').find({id: id}).value();

        if (!testsuite) {
            return cb(null);
        }

        self.runApiTestsuite(testsuite, function (data) {
            apiTestsDb.get('runs').push(data).write();
            return cb(data);
        });
    };

    // self.selfTest = function() {
    //     self.runTestSuiteById('tsping', function (data) {
    //         console.log(JSON.stringify(data, null, '   '));
    //     });
    //
    //     self.runTestSuiteById('testsuite_1', function (data) {
    //         console.log(JSON.stringify(data, null, '   '));
    //     });
    //
    //     self.runTestSuiteById('ts1', function (data) {
    //         console.log(JSON.stringify(data, null, '   '));
    //     });
    // };


    // self.pingTests = function(apiTestsDb) {
    //     apiTestsDb.set('testsuites', [{
    //         id: 'tsping',
    //         name: 'Ping test.',
    //         description: 'Test the coderuss ping endpoint.'
    //     }]).write();
    //
    //     apiTestsDb.set('testcases', [
    //         {
    //             testsuite_id: 'tsping',
    //             id: 'tsping_tc1',
    //             name: 'Ping get',
    //             description: 'Get ping.',
    //             method: 'GET',
    //             url: '{{HOST}}{{V1_PING}}',
    //             // headers: "content-type:application/json\naccept:application/json",
    //             headers: {
    //                 'content-type': 'application/json',
    //                 'accept': 'application/json',
    //             },
    //             body: null,
    //         },
    //         {
    //             testsuite_id: 'tsping',
    //             id: 'tsping_tc2',
    //             name: 'Ping 2 get',
    //             description: 'Get ping.',
    //             method: 'GET',
    //             url: '{{HOST}}{{V1_PING}}',
    //             // headers: "content-type:application/json\naccept:application/json",
    //             headers: {
    //                 'content-type': 'application/json',
    //                 'accept': 'application/json',
    //             },
    //             body: null,
    //         }
    //     ]).write();
    //
    //     apiTestsDb.set('checks', [{
    //         id: 'tsping_tc1_c1',
    //         testcase_id: 'tsping_tc1',
    //         type: 'body',
    //         path: 'status',
    //         val: {
    //             type: 'input',
    //             val: 'success'
    //         }
    //     },
    //     {
    //         id: 'tsping_tc1_c1',
    //         testcase_id: 'tsping_tc2',
    //         type: 'body',
    //         path: 'status',
    //         val: {
    //             type: 'input',
    //             val: '{{request1_response_status}}'
    //         }
    //     }
    //     ]).write();
    //
    //     apiTestsDb.set('envvars', [{
    //         'id': 'envar_1', //get status response from the body
    //         'name': 'request1_response_status',
    //         'type': 'testcase_response',
    //         'path': 'status',
    //         'testcase_id': 'tsping_tc1',
    //         'testsuite_id': 'tsping'
    //     },
    //         {
    //             'id': 'envar_2',
    //             'name': 'HOST',
    //             'type': 'input',
    //             'val': 'https://coderuss.herokuapp.com',
    //             'testsuite_id': 'tsping'
    //         },
    //         {
    //             'id': 'envar_3',
    //             'name': 'V1_PING',
    //             'type': 'input',
    //             'val': '/v1/ping',
    //             'testsuite_id': 'tsping'
    //         },
    //     ]).write();
    //
    // };


    // self.setTestDefaults = opts.setTestDefaults ||
    //     function (apiTestsDb) {
    //         self.pingTests(apiTestsDb)
    //     };

    var apitestsCreateRoutes = function () {
        apiTestsDb.defaults({
            runs: [], testsuites: [],
            testcases: [],
            envvars: [],
            checks: []
        }).write();

        // self.setTestDefaults(apiTestsDb);

        var getGuid = function () {
            return crypto.randomBytes(10).toString('hex');
        };

        var doTestCaseRequest = function (opts, cb) {
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

        function findReplace(obj, envvars,
                             // requestlogs,
                             runtestcases
                             // ,extra
        ) {
            console.log(obj, envvars);

            // extra = extra || '';

            // let regex = new RegExp(extra+"{{(.*?)}}"+extra);
            let regex = new RegExp("{{(.*?)}}");

            if (typeof obj === 'obj') {
                for (let i in obj) {
                    obj[i] = findReplace(obj[i], envvars);
                }
            }
            else if (typeof obj === 'string') {
                while (true) {
                    let results = obj.match(regex);
                    // let results = obj.match(/{{(.*?)}}/);
                    if (results) {
                        let envvar = envvars.find(function (el) {
                            return el.name == results[1];
                        });
                        let val;
                        if (envvar === undefined) {
                            val = '';
                        }
                        else if (envvar.type == 'testcase_response') {
                            let testcase = runtestcases.find(function (el) {
                                // console.log(el,envvar);
                                return el.testcase_id == envvar.testcase_id;
                            });
                            val = getValFromPath(testcase.request_log.response.body,envvar.path);
                            // console.log(testcase,val);
                            // process.exit();
                        }
                        else {
                            val = envvar.val;
                        }
                        if (envvar && envvar.datatype !== undefined) {
                            if (envvar.datatype == 'int') {
                                val = parseInt(val);
                                let regex2 = new RegExp('"'+"{{(.*?)}}"+'"');
                                let results2 = obj.match(regex2);
                                if (results2) {
                                    regex = regex2;
                                }
                            }
                        }
                        // console.log(obj,val);
                        obj = obj.replace(regex, val)
                    }
                    else {
                        break;
                    }
                }

                return obj;
            }
        }

        self.runApiTestsuite = function(testsuite, cb) {
            var testcases = apiTestsDb.get('testcases').filter({testsuite_id: testsuite.id}).value();
            var envvars = apiTestsDb.get('envvars').filter({testsuite_id: testsuite.id}).value();

            // console.log('testcases', testcases);

            var run = {
                id: getGuid(),
                started: Date.now(),
                testsuite_id: testsuite.id,
                ended: null,
                result: 'pending',
                testcases: [],
            };

            var runtestcases = [];

            var requestlogs = [];

            (function doTestCase(idx, cb) {
                // console.log(idx, testcases.length);
                if (!(idx < testcases.length)) {
                    if (run.result !== 'failure') {
                        run.result = 'success';
                    }
                    run.testcases = runtestcases;
                    run.ended = Date.now();
                    return cb(run);
                }
                var testcase = testcases[idx];

                // console.log('testcase', testcase);

                var runtestcase = {
                    testcase_id: testcase.id,
                    name: testcase.name,
                    description: testcase.description,
                    request_log: null,
                    result: 'pending',
                    started: Date.now(),
                    ended: null,
                    check_results: [],
                };

                let body;
                if (testcase.json) {
                    body = JSON.stringify(testcase.json);
                }
                else {
                    body = testcase.body;
                }

                var url = findReplace(testcase.url, envvars,runtestcases);
                body = findReplace(body, envvars,runtestcases,'"');


                var requestopts = {
                    'method': testcase.method,
                    'url': url,
                    'headers': testcase.headers,
                    'body': body
                };

                doTestCaseRequest(requestopts, function (error, req, res, requestlog) {
                    // console.log(requestopts,body);
                    // process.exit();
                    requestlogs.push(requestlog);
                    idx++;
                    runtestcase.ended = Date.now();
                    runtestcase.request_log = requestlog;

                    runtestcase.check_results = validateTestCase(testcase, requestlog, runtestcase, envvars, runtestcases);

                    runtestcases.push(runtestcase);
                    setTimeout(function () {
                        doTestCase(idx, cb);
                    }, 0);
                });

            })(0, function () {
                cb(run)
            });
        };

        function validateTestCase(testcase, requestlog, runtestcase, envvars, runtestcases) {
            let checks = apiTestsDb.get('checks').filter({testcase_id: testcase.id}).value();
            let check_results = [];

            for (let i in checks) {
                let check = checks[i];

                let check_result = validateCheck(check, requestlog, envvars, runtestcases);

                if (check_result.result !== 'success') {
                    check_result.result = 'failure';
                    runtestcase.result = 'failure';
                }

                check_results.push(check_result);

            }

            if (runtestcase.result !== 'failure') {
                runtestcase.result = 'success';
            }

            return check_results;
        }


        function getValFromPath(obj,path)
        {
            // console.log(obj,path);
            path = path.split('.');
            let val = obj;
            for (let i in path) {
                val = val[path[i]];
            }
            return val;
        }

        function validateCheck(check, requestlog, envvars, runtestcases) {
            let result = {
                check_id: check.id
            };

            if (check.type == 'body') {

                try {
                    let body = requestlog.response.body;
                    // let path = check.path.split();
                    let val = getValFromPath(body,check.path);
                    let val2;

                    if (check.val.type == 'input') {
                        val2 = check.val.val;
                    }
                    if (check.val.type == 'int') {
                        val2 = check.val.val.toString();
                    }
                    if (val2) {
                        val2 = findReplace(val2, envvars, runtestcases);
                    }

                    if (check.val.type == 'int') {
                        val2 = parseInt(val2);
                    }

                    expect(val).to.be.equal(val2);
                }
                catch (e) {
                    result.error = e;
                    result.message = e.message;
                    result.result = 'failure';
                }
            }
            else if (check.type == 'statusCode') {
                try {
                    expect(requestlog.response.statusCode).to.be.equal(check.val.val);
                    if (requestlog.response.statusCode != check.val.val) {
                        result.result = 'failure';
                        // result.message = val + ' !== ' + val2;
                    }
                }
                catch (e) {
                    result.error = e;
                    result.message = e.message;
                    result.result = 'failure';
                }
            }
            else {
                result.message = 'unknown check type';
                result.result = 'failure';
            }

            if (result.result !== 'failure') {
                result.result = 'success';
            }
            return result;
        }

        app.all('/apitests/*', function (req, res, next) {
            timeout = 200;
            if (req.headers['x-timeout']) {
                timeout = req.headers['x-timeout'];
            }
            setTimeout(next, timeout)
        });

        app.get('/apitests/testsuites', function (req, res) {
            return res.json(apiTestsDb.get('testsuites').value()).end();
        });

        app.get('/apitests/testsuites/:id', function (req, res) {
            return res.json(apiTestsDb.get('testsuites').find({id: req.params.id}).value()).end();
        });

        app.get('/apitests/testsuites/:id/testcases', function (req, res) {
            return res.json(apiTestsDb.get('testcases').filter({testsuite_id: req.params.id}).value()).end();
        });

        app.get('/apitests/testsuites/:id/testcases/:id', function (req, res) {

            return res.json(apiTestsDb.get('testcases').filter({testsuite_id: req.params.id}).value()).end();
        });

        app.get('/apitests/testsuites/:id/runs', function (req, res) {
            var runs = apiTestsDb.get('runs').filter(
                {testsuite_id: req.params.id}
            ).value();

            runs.sort(function(a,b) {
                //desc order reverese a and b
                return b.started - a.started;
            });
            return res.json(runs).end();
        });

        app.post('/apitests/testsuites/:id/run', function (req, res) {
            self.runTestSuiteById(req.params.id, function (data) {
                return res.json(data).end();
            })
        });

        // self.selfTest();
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

    app.use("/", express.static(__dirname + "/../public"));


    var server = require('http').Server(app);
    // io = require('socket.io')(server);
    var server = server.listen(3000, function () {
        winston.info('main application listening on port: ' + server.address().port);
        app.set('port', server.address().port);
    });

}