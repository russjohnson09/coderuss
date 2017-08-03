let noop = function(){};

app.factory('RequestLog', ['$http', '$q', function ($http, $q) {
    var model = function RequestLog(data) {
        if (data) {
            this.setData(data);
        }
    };

    var descriptionsPost = [];

    var baseurl = '';

    model.prototype = {
        toggleShow: function () {
            this.show = !this.show;
        },
        setData: function (data) {
            angular.extend(this, data);
        },
        //Some apis will really on other response codes
        getResponseCode: function () {
            if (this.data.response && this.data.response.body &&
                this.data.response.body.ResponseCode) {
                return this.data.response.body.ResponseCode;
            }
            return 200;
        },
        getRequestMd: function () {
            var result = "";

            result += "#Request\n";
            result += "##Endpoint\n";
            result += "```" + this.data.request.path + " " + this.data.request.method
                + " " + this.getResponseCode() + "```\n\n";

            var url = this.getUrlWithQueryString();
            result += "[" + url + "]" + "(" + url + ")" + "\n";

            result += "##Request Body\n";
            result += "```json\n";
            result += JSON.stringify(this.data.request.body, null, '    ');
            result += "\n```\n";

            result += "##Response Body\n";
            result += "```json\n";
            result += JSON.stringify(this.data.response.body, null, '    ');
            result += "\n```\n";

            return result;
        },
        getById: function (id) {
            var requestlog = new model({
                _status: 'loading',
                show: true,
            });
            $http({
                'method': 'GET',
                url: '/v1/requestlogs/' + id,
                headers: {
                    'content-type': 'application/json',
                    'cache-control': 'no-cache'
                },
            }).then(function (res) {
                requestlog.setData(res.data);
                requestlog.setData({_status: 'done'});
//                        return new RequestLog(res.data);
            });
            return requestlog;
        },
        getLink: function () {

        },
        save: function () {
            $http({
                'method': 'POST',
                url: '/v1/requestlogs',
                headers: {
                    'content-type': 'application/json',
                    'cache-control': 'no-cache'
                },
                data: JSON.stringify(this)
            })
        },
        getUrlWithQueryString: function () {
            var url = this.data.request.url;
            if (this.data.request.qs) {
                var i = 0;
                for (var key in this.data.request.qs) {
                    console.log(key, this.data.request.qs, this.data.request.qs[key])
                    if (i == 0) {
                        url += "?";
                    }
                    else {
                        url += '&';
                    }
                    url += (key + '=' + this.data.request.qs[key]);
                    i++;
                }
            }
            return url;
        },
        getDescription: function () {
            if (this.data.request.path) {
                var descriptions = [];
                if (this.data.request.method == 'POST') {
                    descriptions = descriptionsPost;
                }

                for (var i in descriptions) {
                    if (this.data.request.path.match(descriptions[i].re)) {
                        return descriptions[i].description;
                    }
                }
            }
            else {
                return '';
            }

        },
        getResponseStatus: function () {
            var responseCode = this.getResponseCode();

            if (this.data.response.statusCode < 400 && (!responseCode || (responseCode < 400))) {
                return 'success';
            }
            else if (this.data.response.statusCode < 500 && (!responseCode || responseCode < 500)) {
                return 'warning';
            }
            else {
                return 'danger';
            }
        },
        getShortRequestPath: function () {
            if (this.data.request.path.length > 50) {
                return this.data.request.path.substr(this.data.request.path.length - 50);
            }
            else {
                return this.data.request.path;
            }
        },
        getIsSuccess: function () {
            return this.data.response.statusCode < 400;
        },
        getDuration: function () {
            if (this.data.response.completed && this.data.request.started) {
                return this.data.response.completed - this.data.request.started;
            }
            else if (this.data.response.ended && this.data.request.started) {
                return this.data.response.ended - this.data.request.started;
            }
        },
    };

    return model;
}]);


app.factory('Testcase', ['$http', '$q', 'ErrorService', 'BaseModel',
    'RequestLog',
    function ($http, $q, ErrorService, BaseModel, RequestLog) {

        var model = function Testcase(data) {
            if (data) {
                this.setData(data);
            }
        };

        var baseurl = '';

        model.prototype = Object.assign(
            BaseModel.prototype, //default model functions
            {
                setData: function (data) {
                    if (this.data == undefined) {
                        this.data = {};

                    }

                    console.log('setTestcase',data,data.data,data.data.opts,data.data.opts.json)

                    if (data && data.data && data.data.opts && data.data.opts.json)
                    {
                        data.data.opts.body = JSON.stringify(data.data.opts.json,null,'    ');
                        delete data.data.opts.json;
                    }

                    angular.extend(this, data);

                    if (this.data.type === undefined) {
                        //set the default type of testcase to api
                        //can also be browser
                        this.data.type = 'api';
                    }

                },
                delete: function () {
                    let self = this;
                    $http({
                        "method": "DELETE",
                        "url": "/testsuites/" + self.data.testsuite_id +
                        "/testcases/" + self.data.id,
                    }).then(function (res) {

                    });
                    console.log('delete', this.id);
                },
                saveRun: function (index,cb)
                {
                    cb = cb || noop;
                    let self = this;
                    console.log(this,index);
                    self._relations['last_result'] = {data: null};

                    if (index !== undefined && index !== null) {
                        self.data.order = index;
                    }
                    $http({
                        "method": "POST",
                        "url": "/testsuites/" + self.data.testsuite_id +
                        "/testcases",
                        "data": self.data
                    }).then(function (res) {
                        self.id = self.data.id = res.data.id;
                        let checkresults = res.data.checkresults;

                        self._relations = self._relations || {};
                        self._relations['checkresults'] = {data: checkresults};
                        self._relations['error'] = {data: null};



                        if (self.data.type === 'api') {
                            let request_logs = [];
                            for (var i in res.data.logs) {
                                request_logs.push(new RequestLog({data: res.data.logs[i]}))
                            }
                            self._relations['request_logs'] = {data: request_logs};
                        }

                        let hasfailures;
                        if (checkresults) {
                            let hasfailures = (checkresults.filter(function (checkresult) {
                                    return checkresult.result !== 'success';
                                })).length > 0;
                        }
                        else {
                            hasfailures = true;
                        }

                        console.log('haserr',res.data,res.data.err);
                        if (res.data && res.data.err) {
                            self._relations['error'] = {data: res.data.err};
                        }

                        if (hasfailures) {
                            self._relations['last_result'] = {data: 'failure'}

                        }
                        else {
                            self._relations['last_result'] = {data: 'success'};
                        }

                        try {
                            self._relations['current_envvars'] = {data: res.data.testrun.envvars};
                        }
                        catch (e){}

                        console.log('saveRun', res);
                        cb();
                    })
                },
                //new function go here
                addSetEnvvar: function () {
                    this.data.setEnvvars = this.data.setEnvvars || [];
                    this.data.setEnvvars.push({name: 'new'});
                },
                addCheck: function () {
                    this.data.checks = this.data.checks || [];
                    this.data.checks.push({name: 'new'});
                },
                removeSetEnvvar: function (i) {
                    this.data.setEnvvars.splice(i, 1)
                },
                removeCheck: function (i) {
                    this.data.checks.splice(i, 1)
                },
                copyCheck: function (i) {
                    // let check = Object.assign({},this.data.checks[i]);
                    this.data.checks.push(JSON.parse(JSON.stringify(this.data.checks[i])));
                }
            }
        );

        return model;


    }]);


app.factory('Testsuite', ['$http', '$q', 'ErrorService', 'Testcase','$timeout',
    function ($http, $q, ErrorService, Testcase, $timeout) {
        var model = function Testsuite(data) {
            if (data) {
                this.setData(data);
            }
        };

        var baseurl = '';

        model.prototype = {
            setData: function (data) {
                if (this.data == undefined) {
                    this.data = {};

                }
                //format in the same way as if it were a separate request
                if (data && data.data && data.data.testcases) {
                    let testcasesdata = Object.assign({}, data.data.testcases);
                    let testcases = [];
                    for (var i in testcasesdata) {
                        let testcase = new Testcase(
                            {
                                _status: 'done',
                                data: testcasesdata[i]
                            });
                        testcases.push(testcase);
                    }
                    this._relations = this._relations || {};
                    this._relations['testcases'] = {
                        _status: 'done',
                        data: testcases
                    };

                    delete data.data.testcases;
                }
                angular.extend(this, data);
            },
            removeEnvvar: function(i)
            {
                this.data.envvars.splice(i,1);
                this.update();
            },
            addEnvvar: function()
            {
                this.data.envvars = this.data.envvars || [];
                this.data.envvars.push({name: '',val:''});
            },
            saveRunTestcases: function()
            {
                let self = this;
                $http({
                    "method": "POST",
                    "url": "/testsuites/" + self.id + "/removelivetestrun"
                }).then(function (res) {
                    doTestCase();
                }, ErrorService.handleHttpError);

                let i = 0;
                let testcases = self.get('testcases');

                let doTestCase = function()
                {
                    let tc = testcases[i];

                    tc.saveRun(i, function() {
                       i++;
                       if (i < testcases.length) {
                           $timeout(doTestCase,0);
                       }
                    });
                };
            },
            update: function()
            {
                let self = this;
                $http({
                    "method": "PUT",
                    "url": "/testsuites/" + self.id,
                    "data": self.data
                }).then(function (res) {
                    self.refresh();
                }, ErrorService.handleHttpError);
            },
            delete: function()
            {
                console.log('delete',this);
                let self = this;
                $http({
                    "method": "DELETE",
                    "url": "/testsuites/" + self.id
                }).then(function (res) {
                    // self.refresh();
                }, ErrorService.handleHttpError);
            },
            arrangeTestcases : function(index,inc)
            {
                let self = this;

                let ts = self.get('testcases')[index];
                console.log(ts,index,inc);
                // return;
                ts.data.order = ts.data.order + inc;

                $http({
                    "method": "POST",
                    "url": "/testsuites/" + self.id + "/testcases/" + ts.data.id +
                        "/reorder",
                    "data": ts.data,
                }).then(function (res) {
                    self.refresh();
                }, ErrorService.handleHttpError);
            },
            refresh: function()
            {
                let self = this;
                $http({
                    "method": "GET",
                    "url": "/testsuites/" + self.id
                }).then(function (res) {
                    self.setData({data: res.data, _status: 'done'}
                    );
                })
            },
            resetLiveTestrun: function () {
                let self = this;
                $http({
                    "method": "POST",
                    "url": "/testsuites/" + self.id + "/removelivetestrun"
                }).then(function (res) {
                    console.log(res.data);
                }, ErrorService.handleHttpError);
            },
            run: function (cb) {
                let self = this;

                self._relations['last_run'] = {
                    data: null
                };

                $http({
                    "method": "POST",
                    "url": "/testsuites/" + self.id + "/run"
                }).then(function (res) {
                        self._relations['last_run'] = {
                            data: res.data
                        };
                        // self._relations['last_result'] = {
                        //     data: 'success'
                        // };
                        cb(res.data);
                },
                    function(res) {
                        self._relations['last_run'] = {
                            data: res.data
                        };
                        // self._relations['last_result'] = {
                        //     data: 'failure'
                        // };
                        cb(res.data);
                    }
                    // ErrorService.handleHttpError
                );
            },
            addTestcaseWithName: function (name) {
                let self = this;
                console.log(name);
                self._relations['testcases'].data.push(
                    new Testcase(
                        {
                            data: {
                                name: name,
                                testsuite_id: self.id
                            }
                        }
                    )
                );
            },
            copyTestcase: function (testcase) {
                let testcasedata = JSON.parse(JSON.stringify(testcase.data));
                delete testcasedata.id;
                this._relations['testcases'].data.push(new Testcase(
                    {data: testcasedata}
                ));

            },
            removeTestcase: function (i) {
                let testcase = this._relations['testcases'].data.splice(i, 1)[0];

                console.log('removeTestcase', testcase);

                testcase.delete();
            },
            get: function (name) {
                var self = this;
                if (self._relations == undefined) {
                    this._relations = {};
                }
                if (self._relations[name] == undefined) {
                    self._relations[name] = {_status: 'loading', data: null};
                    //     if (name == 'testcases') {
                    //         var url = '/testsuites/' + self.id + '/testcases';
                    //         $http(
                    //             {
                    //                 method: 'GET',
                    //                 url: url
                    //             }).then(
                    //             function (res) {
                    //                 testcases = [];
                    //                 for (var i in res.data) {
                    //                     testcases.push(new ApiTestcase({_status:'completed',
                    //                         data:res.data[i]}));
                    //                 }
                    //                 self._relations[name]._status = 'done';
                    //                 self._relations[name].data = testcases;
                    //             },
                    //             ErrorService.handleHttpError);
                    //     }
                    //     else if (name == 'runs') {
                    //         var url = '/apitests/testsuites/' + self.data.id + '/runs';
                    //         $http(
                    //             {
                    //                 method: 'GET',
                    //                 url: url
                    //             }).then(
                    //             function (res) {
                    //                 let objs = [];
                    //                 for (var i in res.data) {
                    //                     objs.push(new Run({_status:'completed',
                    //                         data:res.data[i]}));
                    //                 }
                    //                 self._relations[name]._status = 'done';
                    //                 self._relations[name].data = objs;
                    //             },
                    //             ErrorService.handleHttpError);
                    //     }
                    //
                }
                return this._relations[name].data;
            },
            isLoading: function (name) {
                if (this._relations == undefined) {
                    this._relations = {};
                }
                if (this._relations[name] == undefined) {
                    this.get(name);
                }
                return this._relations[name]['_status'] === 'loading';
            }
        };

        return model;
    }]);


app.factory('TestsuiteService', ['$http', '$q', 'ErrorService', 'Testsuite',
    function ($http, $q, ErrorService, Testsuite) {
        var factory = {};

        factory.search = function () {
            var obj = {_status: 'loading', data: []};


            $http({
                "method": "GET",
                "url": "/testsuites"
            }).then(function (res) {
                let data = [];
                for (let i in res.data) {
                    data.push(new Testsuite({id: res.data[i].id, data: res.data[i]}));
                }
                Object.assign(obj, {_status: 'done', data: data})
            }, ErrorService.handleHttpError);

            return obj;
        };

        factory.copyTestsuite = function(testsuite)
        {
            return $http({
                "method": "POST",
                "url": "/testsuites/" + testsuite.data.id + "/copy",
            });

            return $http({
                "method": "POST",
                "url": "/testsuites/" + id,
                "data": {
                    id: id,
                    name: testsuite.data.name + ' Copy'
                }
            })
        };

        factory.getById = function (id) {
            var obj = new Testsuite({_status: 'loading', id: id, data: null});

            $http({
                "method": "GET",
                "url": "/testsuites/" + id
            }).then(function (res) {
                obj.setData({data: res.data, _status: 'done'});


                // let data = new Testsuite({id: res.data.id,data: res.data});
                // Object.assign(obj,{_status:'done',data:data})
            }, ErrorService.handleHttpError);

            return obj;
        };

        factory.addTestsuite = function(data)
        {
            return $http({
                "method": "POST",
                "url": "/testsuites/" + data.id,
                "data": data,
            }).then(function (res) {

            }, ErrorService.handleHttpError);
        };

        return factory;
    }]);

app.controller('testsuitesCtl', ['$rootScope', '$cookies', '$scope', '$location',
    '$http', '$routeParams', '$sce', 'TestsuiteService','ErrorService','$q',
    function ($rootScope, $cookies, $scope, $location, $http, $routeParams, $sce, TestsuiteService,ErrorService,
    $q) {

        $scope.devMode = localStorage.getItem('devMode');

        console.log('devMode',$scope.devMode);

        // $scope.testsuite =  TestsuiteService.getById($routeParams.id);

        $scope.createTestsuite = function(id,name) {
            TestsuiteService.addTestsuite({id:id,name:name}).then(function() {
                $location.path('/testsuites/' + id);
            });
        };

        $scope.testsuites = TestsuiteService.search();

        $scope.runTestsuite = function (testsuite) {
            testsuite.run(function(data) {
                console.log(data);
            });
        };

        $scope.deleteTestsuite = function (testsuite)
        {
            testsuite.delete();
        };

        $scope.copyTestsuite = function(testsuite)
        {
            TestsuiteService.copyTestsuite(testsuite);
        };

        $scope.backupTestsuites = function()
        {
            return $http({
                "method": "POST",
                "url": "/testsuitescpy",
                "data": {
                    "target": "repo"
                },
            }).then(function (res) {

            }, ErrorService.handleHttpError);
        };

        $scope.restoreTestsuites = function()
        {
            console.log('restore');
            return $http({
                "method": "POST",
                "url": "/testsuitescpy",
                "data": {
                    "target": "main"
                },
            }).then(function (res) {

            }, ErrorService.handleHttpError);
        };

        $scope.backupAndRestore = function()
        {
            console.log('backupAndRestore');
            return new $q(function(resolve,reject) {
                $http({
                    "method": "POST",
                    "url": "/testsuitescpy",
                    "data": {
                        "target": "repo"
                    },
                }).then(function (res) {
                    $http({
                        "method": "POST",
                        "url": "/testsuitescpy",
                        "data": {
                            "target": "main"
                        },
                    }).then(function (res) {
                        resolve();
                    }, ErrorService.handleHttpError);

                }, ErrorService.handleHttpError);
            });

        };


    }]);

//testsuitesIdCtl

app.controller('testsuitesIdCtl', ['$rootScope', '$cookies', '$scope', '$location',
    '$http', '$routeParams', '$sce', 'TestsuiteService',
    function ($rootScope, $cookies, $scope, $location, $http, $routeParams, $sce, TestsuiteService) {

        $scope.testsuite = TestsuiteService.getById($routeParams.id);


        $scope._toggleShow = {};

        $scope.toggleShow = function(name)
        {
            $scope._toggleShow[name] = !$scope._toggleShow[name]
        };

        $scope.getShow = function(name)
        {
            return $scope._toggleShow[name];
        };

        $scope.runTestsuite = function(testsuite)
        {
            console.log('runTestsuite',testsuite);
            testsuite.saveRunTestcases();
        };

        // $scope.testsuites = TestsuiteService.search();

    }]);