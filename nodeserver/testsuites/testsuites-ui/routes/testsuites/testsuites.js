app.factory('Testcase', ['$http','$q','ErrorService','BaseModel',
    function ($http,$q,ErrorService,BaseModel) {

        var model = function Testcase(data) {
            if (data) {
                this.setData(data);
            }
        };

        var baseurl = '';

        model.prototype = Object.assign(
            BaseModel.prototype, //default model functions
            {
                saveRun: function()
                {
                    let self = this;
                    $http({
                        "method": "POST",
                        "url": "/testsuites/" + self.data.testsuite_id +
                            "/testcases",
                        "data": self.data
                    }).then(function(res) {
                        let checkresults = res.data.checkresults;
                        self._relations = self._relations || {};
                        self._relations['checkresults'] = {data: checkresults};
                        self._relations['logs'] = {data: res.data.logs};



                        let hasfailures = (checkresults.filter(function(checkresult) {
                            return checkresult.result !== 'success';
                        })).length > 0;

                        if (hasfailures) {
                            self._relations['last_result'] = {data:'failure'}

                        }
                        else {
                            self._relations['last_result'] = {data:'success'};
                        }

                        self._relations['current_envvars'] = {data: res.data.testrun.envvars};



                        console.log('saveRun',res);
                    })
                },
                //new function go here
                addSetEnvvar: function()
                {
                    console.log(this);
                    this.data.setEnvvars.push({name: 'new'});
                },
                addCheck: function()
                {
                    this.data.checks.push({name: 'new'});
                },
                removeSetEnvvar: function(i)
                {
                    this.data.setEnvvars.splice(i,1)
                },
                removeCheck: function(i)
                {
                    this.data.checks.splice(i,1)
                }
            }
        );

        return model;


    }]);


app.factory('Testsuite', ['$http','$q','ErrorService','Testcase',
    function ($http,$q,ErrorService,Testcase) {
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
                    let testcasesdata = Object.assign({},data.data.testcases);
                    let testcases = [];
                    for (var i in testcasesdata)
                    {
                        let testcase = new Testcase(
                            {_status:'done',
                                data:testcasesdata[i]});
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
            get: function(name) {
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
            isLoading: function(name) {
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



app.factory('TestsuiteService', ['$http','$q','ErrorService','Testsuite',
    function ($http,$q,ErrorService,Testsuite) {
        var factory = {};

        factory.search = function()
        {
            var obj = {_status:'loading',data:[]};


            $http({
                "method": "GET",
                "url": "/testsuites"
            }).then(function(res) {
                let data = [];
                for (let i in res.data) {
                    data.push(new Testsuite({id: res.data[i].id,data: res.data[i]}));
                }
                Object.assign(obj,{_status:'done',data:data})
            },ErrorService.handleHttpError);

            return obj;
        };

        factory.getById = function(id)
        {
            var obj = new Testsuite({_status:'loading',id:id, data:null});

            $http({
                "method": "GET",
                "url": "/testsuites/" + id
            }).then(function(res) {
                obj.setData({data:res.data,_status:'done'});



                // let data = new Testsuite({id: res.data.id,data: res.data});
                // Object.assign(obj,{_status:'done',data:data})
            },ErrorService.handleHttpError);

            return obj;
        };

        return factory;
    }]);

app.controller('testsuitesCtl', ['$rootScope', '$cookies', '$scope', '$location',
    '$http', '$routeParams', '$sce','TestsuiteService',
    function ($rootScope, $cookies, $scope, $location, $http, $routeParams, $sce, TestsuiteService) {

        // $scope.testsuite =  TestsuiteService.getById($routeParams.id);

        $scope.testsuites = TestsuiteService.search();

    }]);

//testsuitesIdCtl

app.controller('testsuitesIdCtl', ['$rootScope', '$cookies', '$scope', '$location',
    '$http', '$routeParams', '$sce','TestsuiteService',
    function ($rootScope, $cookies, $scope, $location, $http, $routeParams, $sce, TestsuiteService) {

        $scope.testsuite =  TestsuiteService.getById($routeParams.id);

        // $scope.testsuites = TestsuiteService.search();

    }]);