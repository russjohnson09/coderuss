let initilize = function(opts) {
    const crypto = require('crypto');
    const low = require('lowdb');
    const request = require('request');
    const apiTestsDb = low(__dirname+'/.apiTestsDb.json');
    const URL = require('url').Url;

    let self = {};
    let app = opts.app;
    self.app = app;
    self.logger = opts.logger;

    var apitestsCreateRoutes = function()
    {
        apiTestsDb.defaults({runs:[],testsuites:[],
            testcases:[],
            envvars:[],
            runs: [],
            checks:[]}).write();

        function setTestDefaults() {
            apiTestsDb.set('testsuites',[{
                id: 'testsuite_1',
                name: 'Testsuite 1',
            }]).write();

            apiTestsDb.set('testcases',[
                {
                    testsuite_id: 'testsuite_1',
                    id: 'testcase_1',
                    method: 'GET',
                    url: '{{HOST}}{{V1_PING}}',
                    headers: {
                        'content-type': 'application/json',
                        'accept': 'application/json',
                    },
                    body: null,
                }
            ]).write();

            apiTestsDb.set('checks',[{
                id: 'testcase_1_check_1',
                testcase_id: 'testcase_1',
                type: 'body',
                path: 'status',
                val: {
                    type: 'input',
                    val: 'success'
                }
            }]).write();

            apiTestsDb.set('envvars',[{'id': 'envar_1', //get status response from the body
                'name': 'request1_response_status',
                'type': 'testcase_response',
                'path': 'status',
                'testcase_id': 'testcase_1',
                'testsuite_id': 'testsuite_1'
            },
                {
                    'id': 'envar_2',
                    'name': 'HOST',
                    'type': 'input',
                    'val': 'https://coderuss.herokuapp.com',
                    'testsuite_id': 'testsuite_1'
                },
                {
                    'id': 'envar_3',
                    'name': 'V1_PING',
                    'type': 'input',
                    'val': '/v1/ping',
                    'testsuite_id': 'testsuite_1'
                },
            ]).write();
        }

        setTestDefaults();

        var getGuid = function()
        {
            return crypto.randomBytes(10).toString('hex');
        };

        var doTestCaseRequest = function(opts,cb)
        {
            console.log(process.version);
            // console.log(opts);
            process.exit();
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

            console.log(requestObject);
            // process.exit();

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
            catch(e) {
                console.log(e);
                process.exit();
                return cb(e,null,null);
            }

            console.log(opts);
            process.exit();


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

            console.log(opts);
            request(opts, function (err, response, body) {
                console.log(body);
                process.exit();
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
                cb(err, response, body,requestResponseObject);
            };
        };

        function findReplace(obj,envvars)
        {
            console.log(obj,envvars);

            if (typeof obj === 'obj') {
                for (let i in obj) {
                    obj[i] = findReplace(obj[i],envvars);
                }
            }
            else if (typeof obj === 'string') {
                while (true) {
                    let results = obj.match(/{{(.*?)}}/);
                    if (results) {
                        let envvar = envvars.find(function(el) {
                            return el.name == results[1];
                        });
                        let val;
                        if (envvar === undefined) {
                            val = '';
                        }
                        else {
                            val = envvar.val;
                        }
                        // console.log(obj,val);
                        obj = obj.replace(/{{(.*?)}}/,val)
                    }
                    else {
                        break;
                    }
                }

                return obj;
            }
        }

        function runApiTestsuite(testsuite,cb)
        {
            var testcases = apiTestsDb.get('testcases').filter({testsuite_id:testsuite.id}).value();
            var envvars = apiTestsDb.get('envvars').filter({testsuite_id:testsuite.id}).value();

            console.log('testcases',testcases);

            var run = {
                id: getGuid(),
                started: Date.now(),
                ended: null,
                result: 'pending',
                testcases: [],
            };

            var runtestcases = [];

            (function doTestCase(idx,cb) {
                console.log(idx,testcases.length);
                if(!(idx < testcases.length)) {
                    if (run.result !== 'failure') {
                        run.result = 'success';
                    }
                    run.testcases = runtestcases;
                    run.ended = Date.now();
                    return cb(run);
                }
                var testcase = testcases[idx];

                console.log('testcase',testcase);

                var runtestcase = {
                    testcase_id: testcase.id,
                    request_log: null,
                    result: 'pending',
                    started: Date.now(),
                    ended: null,
                    check_results: [],
                };

                var url = findReplace(testcase.url,envvars);
                var body = findReplace(testcase.body,envvars);


                var requestopts = {
                    'method': testcase.method,
                    'url': url,
                    'headers': testcase.headers,
                    'body': body
                };

                doTestCaseRequest(requestopts,function(error,req,res,requestlog) {
                    idx++;
                    runtestcase.ended = Date.now();
                    runtestcase.request_log = requestlog;

                    runtestcase.check_results = validateTestCase(testcase,requestlog,runtestcase);

                    runtestcases.push(runtestcase);
                    setTimeout(function() {
                        doTestCase(idx,cb);
                    },0);
                });

            })(0,function() {
                cb(run)
            });
        }

        function validateTestCase(testcase,requestlog,runtestcase)
        {
            let checks = apiTestsDb.get('checks').filter({testcase_id:testcase.id}).value();
            let check_results = [];

            for (let i in checks) {
                let check = checks[i];

                let check_result = validateCheck(check,requestlog);

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

        function validateCheck(check,requestlog)
        {
            let result = {
                check_id: check.id
            };

            if (check.type == 'body') {

                try {
                    let body = requestlog.response.body;
                    let path = check.path.split();
                    let val;
                    console.log(body,path);
                    for (let i in path) {
                        val = body[path[i]];
                    }
                    let val2;

                    if (check.val.type == 'input') {
                        val2 = check.val.val;
                    }

                    if (val !== val2) {
                        result.result = 'failure';
                        result.message = val + ' !== ' + val2;
                    }
                }
                catch (e)
                {
                    result.error = e;
                    result.message = e.message;
                    result.result = 'failure';
                }
            }

            if (result.result !== 'failure') {
                result.result = 'success';
            }
            return result;
        }

        app.get('/apitests/testsuites', function (req, res) {
            return res.json(apiTestsDb.get('testsuites').value()).end();
        });


        app.post('/apitests/testsuites/:id/run', function (req, res) {
            runTestSuiteById(req.params.id,function(data) {
                return res.json(data).end();
            })

        });

        var runTestSuiteById = function(id,cb)
        {
            console.log(apiTestsDb.get('testsuites').value());
            console.log(apiTestsDb.get('runs').value());

            var testsuite = apiTestsDb.get('testsuites').find({id: id}).value();

            runApiTestsuite(testsuite, function (data) {
                apiTestsDb.get('runs').push(data).write();
                return cb(data);
            });
        };

        runTestSuiteById('testsuite_1',function(data) {
            console.log(JSON.stringify(data,null,'   '));
        });
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

    initilize({logger:logger,app:app});



    var server = require('http').Server(app);
    // io = require('socket.io')(server);
    var server = server.listen(3000, function() {
        winston.info('main application listening on port: ' + server.address().port);
        app.set('port', server.address().port);
    });

}