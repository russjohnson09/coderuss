app.factory('ApiTestsuite', ['$http','$q','ApiTestcase','ErrorService',
    function ($http,$q,ApiTestcase,ErrorService) {
    var model = function ApiTestsuite(data) {
        if (data) {
            this.setData(data);
        }
    };

    var baseurl = '';
    var viewurl = '#!/apitests/testsuites/';

    model.prototype = {
        setData: function (data) {
            if (this.data == undefined) {
                this.data = {};
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
                if (name == 'testcases') {
                    var url = '/apitests/testsuites/' + self.id + '/testcases';
                    $http(
                        {
                            method: 'GET',
                            url: url
                        }).then(
                        function (res) {
                            testcases = [];
                            for (var i in res.data) {
                                testcases.push(new ApiTestcase({_status:'completed',
                                    data:res.data[i]}));
                            }
                            self._relations[name]._status = 'done';
                            self._relations[name].data = testcases;
                        },
                        ErrorService.handleHttpError);
                }
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
        },
        run: function()
        {
            var self = this;
            $http(
                {
                    method: 'POST',
                    url: '/apitests/testsuites/' + self.id + '/run'
                }).then(function (response) {
                    console.log(response.data);
            })
        },
        refresh: function()
        {
            var self = this;
            self.data = {};
            self._status = 'loading';
            $http(
                {
                    method: 'GET',
                    url: '/apitests/testsuites/' + self.id
                }).then(function (response) {
                self.setData({data:{}});
                self.setData({_status: 'completed',data:response.data});
            })
        },
        getDescription : function()
        {
            var result = '';
            result += this.id;
            if (this.name) {
                return this.name
                result += this.name;
            }
            return result;
        },
        getViewLink: function()
        {
            var result = viewurl;
            result += this.id;
            return result;
        },
        getLastTestRun: function()
        {
            var self = this;
            self._lastTestRun = self._lastTestRun || {};

            return self._lastTestRun;
        },
        setLastTestRun: function(data)
        {
            var self = this;
            self._lastTestRun = self._lastTestRun || {};
//                data.link = '#!/applicationtestsuites/' + this.id + '/' + data.id;
            data.link = '#!tests/' + data.id;
            Object.assign(self._lastTestRun,data);
        },
        getLastTestRunLink: function()
        {
            var self = this;
            return '#!/applicationtestsuites/' + self.id + '/' + self.getLastTestRun().id
        },
        populateTestById: function(id)
        {
            var self = this;
            return $q(function (resolve, reject) {
                $http(
                    {
                        method: 'GET',
                        url: baseurl + '/tests/' + id
                    }).then(function (response) {
                    self.setLastTestRun(response.data);
                    return resolve(response.data);
                })
            })
        },
        populateTestRuns: function()
        {
            var self = this;

            if (self._testRuns === undefined) {
                self._testRuns = [];
            }

            return $q(function (resolve, reject) {
                $http(
                    {
                        method: 'GET',
                        url: baseurl + '/applicationtestsuites/' + self.id + '/testruns'
                    }).then(function (response) {
                    for (var i in response.data) {
                        var testrun = new Testrun(response.data[i]);
                        self._testRuns.push(testrun);
                    }
                    return resolve(self._testRuns);
                })
            })
        },
        getTestRuns: function()
        {
            var self = this;
            if (self._testRuns === undefined) {
                self._testRuns = [];
                self.populateTestRuns();
            }
            return self._testRuns;
        },
        runTests: function()
        {
            var self = this;
            ///applicationtestsuites/:id/run
            return $q(function (resolve, reject) {
                $http(
                    {
                        method: 'POST',
                        url: baseurl + '/applicationtestsuites/' + self.id + '/run'
                    }).then(function (response) {
                    response.data.link = '#!tests/' + response.data.id;
                    self.setLastTestRun(response.data);
                    self._testRuns = [];
                    self.populateTestRuns();
                    return resolve(response.data);
//                        var testsuites = [];
//                        response.data.forEach(function (testsuite) {
//                            testsuite = new model(testsuite);
//                            testsuites.push(testsuite);
//                        });
//                        return resolve(testsuites);
                })
            })
        }
    };

    return model;
}]);

app.factory('ApiCheck', ['$http','$q','ErrorService', function ($http,$q,ErrorService) {
    var model = function ApiCheck(data) {
        if (data) {
            this.setData(data);
        }
    };

    model.prototype = {
        setData: function (data) {
            if (this.data == undefined) {
                this.data = {};
            }
            angular.extend(this, data);
        },
        getId: function()
        {
            return this.data.id
        },
        get: function(name) {
            var self = this;
            if (self._relations == undefined) {
                this._relations = {};
            }
            if (self._relations[name] == undefined) {
                self._relations[name] = {_status: 'loading', data: null};
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
        },
    };

    return model;
}]);


app.factory('ApiTestcase', ['$http','$q','ErrorService','ApiCheck', function ($http,$q,ErrorService,ApiCheck) {
    var model = function ApiTestcase(data) {
        if (data) {
            this.setData(data);
        }
    };

    model.prototype = {
        setData: function (data) {
            if (this.data == undefined) {
                this.data = {};
            }
            angular.extend(this, data);
        },
        getId: function()
        {
            return this.data.id
        },
        get: function(name) {
            var self = this;
            if (self._relations == undefined) {
                this._relations = {};
            }
            if (self._relations[name] == undefined) {
                self._relations[name] = {_status: 'loading', data: null};
                if (name == 'checks') {
                    var url = '/apitests/testsuites/' + self.data.testsuite_id + '/testcases/' +
                        self.data.id + '/checks';
                    $http(
                        {
                            method: 'GET',
                            url: url
                        }).then(
                        function (res) {
                            let objs = [];
                            for (var i in res.data) {
                                objs.push(new ApiCheck({_status:'completed',
                                    data:res.data[i]}));
                            }
                            self._relations[name]._status = 'done';
                            self._relations[name].data = objs;
                        },
                        ErrorService.handleHttpError);
                }
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
        },
    };

    return model;
}]);


app.factory('ApiTestsuiteService', ['$http','$q','ApiTestsuite', function ($http,$q,ApiTestsuite) {
    var factory = {};


    factory.getById = function (id) {
        var testsuite = new ApiTestsuite({'id': id});

        testsuite.refresh();
        return testsuite;

    };
    factory.getAll = function () {
        return $q(function (resolve, reject) {
            $http(
                {
                    method: 'GET',
                    url: '/apitests/testsuites'
                }).then(function (response) {
                var testsuites = [];
                response.data.forEach(function (testsuite) {
                    testsuite = new ApiTestsuite(testsuite);
                    testsuites.push(testsuite);
                });
                return resolve(testsuites);
            })
        })

    };

    return factory;
}]);

//apitestsTestSuitesViewCtl

app.controller('apitestsTestSuitesViewCtl', ['$rootScope', '$cookies', '$scope', '$location',
    '$http', '$routeParams', '$sce','ApiTestsuiteService',
    function ($rootScope, $cookies, $scope, $location, $http, $routeParams, $sce, ApiTestsuiteService) {

        console.log('id',$routeParams.id);

        $scope.testsuites = [{id:'loading'}];

        $scope.testsuite =  ApiTestsuiteService.getById($routeParams.id);

//            $scope.testsuites = Testsuite.getAll();

        ApiTestsuiteService.getAll().then(function (data) {
            $scope.testsuites = data;
//                console.log('getAll',$scope.testsuites);

        });
    }]);

app.controller('apitestsTestSuitesCtl', ['$rootScope', '$cookies', '$scope', '$location',
    '$http', '$routeParams', '$sce','ApiTestsuiteService',
    function ($rootScope, $cookies, $scope, $location, $http, $routeParams, $sce, ApiTestsuiteService) {

        $scope.testsuites = [{id:'loading'}];

//            $scope.testsuites = Testsuite.getAll();

        ApiTestsuiteService.getAll().then(function (data) {
            $scope.testsuites = data;
//                console.log('getAll',$scope.testsuites);

        });
    }]);