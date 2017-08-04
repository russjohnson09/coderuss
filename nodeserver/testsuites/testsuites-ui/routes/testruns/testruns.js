// http://10.63.60.178:3000/testsuites-ui/#!/testruns/7f5464a1c09ee08c4f3e
app.factory('Testrun', ['$http', '$q', 'ErrorService', 'Testcase', '$timeout', 'BaseModel',
    'Testsuite',
    function ($http, $q, ErrorService, Testcase, $timeout, BaseModel, Testsuite) {
        let model = function (data) {
            if (data) {
                this.setData(data);
            }
        };

        model.prototype = Object.assign({},
            BaseModel.prototype, //default model functions
            {
                refreshRelated: function (name) {
                    let self = this;
                    console.log('refreshRelated',name);

                    if (name == 'testsuite') {
                        console.log('refreshRelated',name);
                        $http({
                            "method": "GET",
                            "url": "/testsuites/" + self.data.testsuite_id
                        }).then(function (res) {
                            self._relations[name] = {
                                _status: 'done',
                                data: new Testsuite({data: res.data})
                            };
                        }, ErrorService.HandleHttpError);
                    }
                },
                get: function (name) {
                    let self = this;
                    if (self._relations == undefined) {
                        this._relations = {};
                    }

                    if (self._relations[name] == undefined) {
                        self._relations[name] = {_status: 'loading', data: null};
                    }
                    if (name == 'testsuite') {
                        console.log(name,self.data,self._relations[name],self.data && self.data.testsuite_id && self._relations[name]._status == 'loading'
                            && !self._relations[name]._loader_called);
                        if (self.data && self.data.testsuite_id && self._relations[name]._status == 'loading'
                            && !self._relations[name]._loader_called)
                        {
                            console.log('testsuite loader_called',self._relations[name]._loader_called);
                            self._relations[name]._loader_called = true;
                            self.refreshRelated('testsuite');
                        }
                    }
                    return self._relations[name].data;
                },
                setData: function (data) {
                    if (this.data == undefined) {
                        this.data = {};

                    }
                    //format in the same way as if it were a separate request
                    if (data && data.data && data.data.testcases) {
                        let testcasesdata = Object.assign({}, data.data.testcases);
                        let testcases = [];

                        // let requestLogsByTestcaseId = {};
                        // if (data.data.logs) {
                        //     for (let i in res.data.logs) {
                        //         let log = res.data.logs[i];
                        //         let testcase_id = log['testcase_id'];
                        //         requestLogsByTestcaseId[testcase_id] = requestLogsByTestcaseId[testcase_id] || [];
                        //         requestLogsByTestcaseId[testcase_id].push(new RequestLog({data: log});
                        //     }
                        // }

                        for (var i in testcasesdata) {
                            let testcase_id = testcasesdata[i].id;
                            let tc = testcasesdata[i];
                            tc.testrun_id = data.data.id;
                            let testcase = new Testcase(
                                {
                                    "id": testcase_id,
                                    _status: 'done',
                                    data: tc
                                });
                            testcases.push(testcase);
                            testcase._relations = testcase._relations || {};

                            // console.log('get request_logs',testcase,testcase.get('request_logs'));

                            // testcase._relations['request_logs'] = requestLogsByTestcaseId[testcase_id] || [];

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
            });

        return model;
    }]);


app.factory('TestrunService', ['$http', '$q', 'ErrorService', 'Testrun',
    function ($http, $q, ErrorService, Testrun) {
        var factory = {};

        factory.getById = function (id) {
            var obj = new Testrun({_status: 'loading', id: id, data: null});

            $http({
                "method": "GET",
                "url": "/testruns/" + id
            }).then(function (res) {
                obj.setData({data: res.data, _status: 'done'});
            }, ErrorService.handleHttpError);

            return obj;
        };

        return factory;
    }]);


app.controller('testrunsIdCtl', ['$rootScope', '$cookies', '$scope', '$location',
    '$http', '$routeParams', '$sce', 'TestrunService',
    'ShowHideHelper',
    function ($rootScope, $cookies, $scope, $location, $http, $routeParams, $sce, TestrunService,
              ShowHideHelper) {

        $scope.testrun = TestrunService.getById($routeParams.id);

        ShowHideHelper.addToggleShowToScope($scope);


    }]);