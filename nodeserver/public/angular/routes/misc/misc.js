let GITHUB_API = '/v1/proxy/github';

(function currencyExchange() {
    app.factory('CurrencyService', ['$http', function ($http) {

        //https://api.fixer.io/latest?base=USD
        //get currency exchanges off of the us dollar.

        // let baseUrl = GITHUB_API;


        let service = {};

        let currencyData = {};


        // service.getCurrencyDataByCode = function(code)
        // {
        //     let self = this;
        //     if (currencyData.data === undefined) {
        //         self.getCurrencyData();
        //     }
        //     if (currencyData && currencyData.data) {
        //         return currencyData.data[code];
        //     }
        //     return null;
        // };

        let rates;
        service.getRates = function(isPromise)
        {
            // let url = 'https://api.fixer.io/latest?base=USD';
            let url = '/v1/proxy/fixer/latest?base=USD';
            let items = {
                // _status: 'loading',
                data: null
            };
            let promise = new Promise(function(resolve,reject) {
                $http(
                    {
                        method: 'GET',
                        url: url,
                        headers: {
                            'content-type': 'application/json',
                            'cache-control': 'no-cache'
                        },
                    }
                ).then(function (response) {
                    // items._status = 'loaded';
                    items.data = response.data;
                    return resolve(items);
                });
            });

            if (isPromise) {
                return promise;
            }
            else {
                return items;
            }

        };

        service.getCurrencyData = function(isPromise = false)
        {
            let items = {
                _status: 'loading',
                data: null
            };
            let promise = new Promise(function(resolve,reject) {
                if (currencyData._status == 'loading' || currencyData._status == 'loaded') {
                    return resolve(currencyData);
                }
                $http(
                    {
                        method: 'GET',
                        url: '/angular/json/currency.json',
                        headers: {
                            'content-type': 'application/json',
                            'cache-control': 'no-cache'
                        },
                    }
                ).then(function (response) {
                    // items._status = 'loaded';
                    currencyData.data = response.data
                    items.data = response.data;
                    return resolve(currencyData);
                });
            });

            if (isPromise) {
                return promise;
            }
            else {
                return items;
            }
        };

        return service;
    }]);


    app.controller('currencyCtl', ['$rootScope', '$cookies', '$scope', '$location',
        '$http', '$routeParams', 'CurrencyService',
        function ($rootScope, $cookies, $scope, $location, $http, $routeParams,
                  CurrencyService,
                  ) {

            console.log('currencyCtl');

            $scope.showIdx = {};

            $scope.toggleShow = function(idx)
            {
                let isShown = $scope.getShow(idx);
                console.log('showIdx',$scope.showIdx,isShown,!isShown);

                $scope.showIdx[idx] = !isShown;
            };

            $scope.getShow = function(idx)
            {
                return $scope.showIdx[idx] == true;
            };


            $scope.getPanelClass = function() {
                // return 'panel-primary';

                return 'panel-success';
            };


            $scope.statusPanelColor = function(state)
            {
                if (state === 'pending') {
                    return 'panel-warning';
                }
                else if (state === 'error') {
                    return 'panel-danger';
                }
                else if (state === 'success') {
                    return 'panel-success';
                }
                return 'panel-primary';
            };

            $scope.currencyData = CurrencyService.getCurrencyData();

            $scope.rates = CurrencyService.getRates();

            $scope.getCurrencyDataByCode = function(code)
            {
                return CurrencyService.getCurrencyDataByCode(code);
                return code + 'test name';
            }

        }]);


})

(function addGithubReview() {
    //http://www.webdeveasy.com/angularjs-data-model/
    //https://api.github.com/repos/russjohnson09/coderuss/commits/4c20768f288af579519e887674ddcea5300a7d1d
    app.factory('Gitcommit', ['$http', function ($http) {
        function Gitcommit(data) {
            if (data) {
                this.setData(data);
            }
        };

        /**
         *     "head": {
        "label": "russjohnson09:0123_github_review",
        "ref": "0123_github_review",
            "base": {
        "label": "russjohnson09:master",
        "ref": "master",
        "sha": "f7b9cd77ff8691a57720160d672c23201e84ed47",
        {{BASE_URL}}/repos/russjohnson09/coderuss/pulls/{{pull.number}}
         * @type {string}
         */
        const GITHUB_API = '/v1/proxy/github';

        var context = '';
        Gitcommit.prototype = {
            setContext: function (val) {
                context = val;
            },
            getContext: function () {
                return context;
            },
            setData: function (data) {
                angular.extend(this, data);
            },
            getStats: function () {
                console.log('getStats', this, this.stats);
                if (typeof this.stats == 'undefined') {
                    this.stats = {};
                    this.populateCommit();
                }

                return this.stats;
            },
            populateStatus: function()
            {
                let self = this;
                self.statuses = {
                    _status: 'loading',
                    data: null
                };
                let url = GITHUB_API
                    + '/repos/russjohnson09/coderuss/commits/'+ self.sha+'/status';
                $http(
                    {
                        method: 'GET',
                        url: url,
                        // data: JSON.stringify(data),
                        headers: {
                            'content-type': 'application/json',
                            'cache-control': 'no-cache'
                        },
                    }
                ).then(function (response) {
                    let data = [];
                    if (response.data) {
                        self.statuses.data = response.data;
                    }
                });

            },
            getStatus: function() {
                let self = this;
                if (self.statuses === undefined) {
                    this.populateStatus();
                }
                return this.statuses;
                ///repos/russjohnson09/coderuss/commits/7e25704aba6189550820278c9bd453183551fb98/status
            },
            updateCommitStatusPending: function () {
                var self = this;
                var url = GITHUB_API
                    + '/repos/russjohnson09/coderuss/statuses/' + self.sha;

                var data = {
                    "state": "pending",
                    "target_url": window.location.origin + self.sha,
                    "description": "pending",
                    "context": self.getContext()
                };

                console.log('updateCommitStatusPending', data);

                $http(
                    {
                        method: 'POST',
                        url: url,
                        data: JSON.stringify(data),
                        headers: {
                            'content-type': 'application/json',
                            'cache-control': 'no-cache'
                        },
                    }
                ).then(function (response) {
                    console.log('updateCommitStatusPending', response);
                    if (response.data && response.data) {
                        self.setData(response.data);
                    }
                });
            },
            updateCommitStatusSuccess: function () {
                var self = this;
                var url = GITHUB_API
                    + '/repos/russjohnson09/coderuss/statuses/' + self.sha;

                var data = {
                    "state": "success",
                    "target_url": window.location.origin + self.sha,
                    "description": "success description",
                    "context": self.getContext()
                };

                console.log('updateCommitStatusPending', data);

                $http(
                    {
                        method: 'POST',
                        url: url,
                        data: JSON.stringify(data),
                        headers: {
                            'content-type': 'application/json',
                            'cache-control': 'no-cache'
                        },
                    }
                ).then(function (response) {
                    console.log('updateCommitStatusPending', response);
                    if (response.data && response.data) {
                        self.setData(response.data);
                    }
                });
            },
            populateCommit: function () {
                var self = this;
                console.log('populateCommit');
                var url = GITHUB_API
                    + '/repos/russjohnson09/coderuss/commits/' + self.sha;
                //X-GitHub-Request-Id
                //xsrfHeaderName
                console.log('populateCommit', url);

                $http(
                    {
                        method: 'GET',
                        url: url,
//                        xsrfHeaderName: 'X-GitHub-Request-Id ',
                        headers: {
                            'content-type': 'application/json',
                            'cache-control': 'no-cache'
                        },
//                        params: {
////                            _proxy: 1,
////                            query: $scope.movie.query
//                        }
                    }
                ).then(function (response) {
                    console.log('populateCommit', response);
                    if (response.data && response.data) {
                        self.setData(response.data);
                    }
                });
//                /repos/russjohnson09/coderuss/commits/{{sha}}
//                $http.get()
//                    .then(function(data) {
//                        console.log(data);
//                });
            },
            loadCommitData: function (sha) {
                var scope = this;
                $http.get('ourserver/books/' + bookId).success(function (bookData) {
                    scope.setData(bookData);
                });
            },
            load: function (id) {
                var scope = this;
                $http.get('ourserver/books/' + bookId).success(function (bookData) {
                    scope.setData(bookData);
                });
            },
        };

        return Gitcommit;
    }]);


    app.factory('PullService', ['$http', function ($http) {

        let baseUrl = GITHUB_API;
        let service = {};

        //        {{BASE_URL}}/repos/russjohnson09/coderuss/pulls/{{pull.number}}

        service.getPulls = function()
        {
            let items = {
                _status: 'loading',
                data: null
            };
            let url = baseUrl + '/repos/russjohnson09/coderuss/pulls';

            $http(
                {
                    method: 'GET',
                    url: url,
//                        xsrfHeaderName: 'X-GitHub-Request-Id ',
                    headers: {
                        'content-type': 'application/json',
                        'cache-control': 'no-cache'
                    },
//                        params: {
////                            _proxy: 1,
////                            query: $scope.movie.query
//                        }
                }
            ).then(function (response) {
                if (response.data && response.data) {
                    items.data = response.data; //TODO ure PULL FACTORY.
                }
            });

            return items;
        };

        return service;
    }]);


    app.factory('Pull', ['$http', function ($http) {
        function Pull(data) {
            if (data) {
                this.setData(data);
            }
        };

        /**
         *     "head": {
        "label": "russjohnson09:0123_github_review",
        "ref": "0123_github_review",
            "base": {
        "label": "russjohnson09:master",
        "ref": "master",
        "sha": "f7b9cd77ff8691a57720160d672c23201e84ed47",
        {{BASE_URL}}/repos/russjohnson09/coderuss/pulls/{{pull.number}}
         * @type {string}
         */
        const GITHUB_API = '/v1/proxy/github';

        var context = '';
        Pull.prototype = {
            getContext: function () {
                return context;
            },
            setData: function (data) {
                angular.extend(this, data);
            },
            load: function (id) {
                // let url = GITHUB_API + '/repos/russjohnson09/coderuss/pulls/'
                // $http.get('ourserver/books/' + bookId).success(function (bookData) {
                //     scope.setData(bookData);
                // });
            },
        };

        return Gitcommit;
    }]);


    app.controller('gitreviewCtl', ['$rootScope', '$cookies', '$scope', '$location',
        '$http', '$routeParams', 'Gitcommit','PullService',
        function ($rootScope, $cookies, $scope, $location, $http, $routeParams, Gitcommit,
                  PullService) {

            console.log('gitreviewCtl');

            console.log('cookies', $cookies.getAll());

            $scope.showIdx = {};

            $scope.toggleShow = function(idx)
            {
                let isShown = $scope.getShow(idx);
                console.log('showIdx',$scope.showIdx,isShown,!isShown);

                $scope.showIdx[idx] = !isShown;
            };

            $scope.getShow = function(idx)
            {
                return $scope.showIdx[idx] == true;
            };

            //        $scope.sha = $routeParams.sha;

            var gitcommit = $scope.gitcommit = new Gitcommit({sha: $routeParams.sha});

            $scope.statusPanelColor = function(state)
            {
                if (state === 'pending') {
                    return 'panel-warning';
                }
                else if (state === 'error') {
                    return 'panel-danger';
                }
                else if (state === 'success') {
                    return 'panel-success';
                }
                return 'panel-primary';
            };

            $scope.pulls = PullService.getPulls();

            var url = '/v1/ping';
            $http(
                {
                    method: 'GET',
                    url: url,
                    headers: {
                        'content-type': 'application/json',
                        'cache-control': 'no-cache'
                    },
                }
            ).then(function (response) {
                console.log(url, response);
                gitcommit.setContext(response.data.server.context);
            });
        }]);

})();


(function addAdminLogsCtl() {


    app.controller('adminlogsCtl', ['_user', '$rootScope', '$cookies', '$scope', '$location',
        '$http', '$routeParams', 'hotkeys','ErrorService',
        'NotificationService', 'Notification','TravelWarningService','socketAdminlogs',
        function (_user, $rootScope, $cookies, $scope, $location, $http, $routeParams,
                  hotkeys, ErrorService,
                  NotificationService,Notification,TravelWarningService,socket) {
            $scope._user = _user;


           $scope.testMessages = [
                'test'
            ]

            $scope.messages = [];
            socket.on('info', function (data) {
                let now = Date.now();
                let jsonData = {};
                try {
                    jsonData = JSON.parse(data);
                }
                catch(e) {
                    console.log('data is not in json format',data);
                }


                let msg = {
                    rawData: data,
                    time: Date.now(),
                    datetime: moment(now).tz(moment.tz.guess())
                        .format('MMMM Do YYYY, h:mm:ss a z')
                };

                Object.assign(msg,jsonData);
                // console.log(msg);
                if (msg.level === undefined) {
                    return;
                }
                // $scope.messages.push()
                $scope.messages.push(msg);
                // console.log(data, $scope.messages);
            });



        }])
})();


(function QueueCtl() {

    let defaultDateFormat = 'MMMM Do YYYY, h:mm:ss a z';

    // app.service('Queue', ['$http', '$q', '$timeout',
    //     function ($http, $q,
    //               $timeout) {
    //
    //     }
    // ])

    app.factory('QueueService', ['$http', '$q', '$timeout',
        function ($http, $q,
                  $timeout) {

            let service = {};
            let baseurl = '';
            let queueItemGetUrl = baseurl + '/v1/queueitem';
            let queueItemPostUrl = baseurl + '/v1/queueitem';





            function QueueItem(data) {
                if (data) {
                    this.setData(data);
                }
            }

            QueueItem.prototype = {
                setData: function (data) {
                    angular.extend(this, data);
                    this.due = new Date(this.due);
                },
                getJSON: function () {
                    return JSON.stringify(this.getJSONObject());
                },
                getDue: function()
                {
                    return moment(this.due).format(defaultDateFormat);
                },
                getJSONObject: function () {
                    return {
                        message: this.message,
                        due: this.due,
                        status: this.status,
                        //ADD more here
                    }
                },
                getPanelClass: function()
                {
                    // if (Model.PanelClassesByStatus[this.Status]) {
                    //     return Model.PanelClassesByStatus[this.Status];
                    // }
                    // 'DELETED': 'panel-danger',
                    // 'SUBMITTED': 'panel-primary',
                    // 'APPROVED': 'panel-success',
                    // 'INPROGRESS': 'panel-warning'
                    return 'panel-success';
                },
                getUpdateFields: function()
                {
                    return ['message','due','status']
                },
                moveStatus: function(status) {
                    this.status = status;
                    return this.update();
                },
                complete: function()
                {
                    this.moveStatus('complete');
                },
                archive: function()
                {
                    this.moveStatus('archive');
                },
                update: function()
                {
                    console.log('update queueitem');
                    let self = this;
                    return $q(function (resolve, reject) {
                        $http(
                            {
                                method: 'PUT',
                                url: '/v1/queueitem/'+ self._id,
                                headers: {
                                    'cache-control': 'no-cache',
                                    'content-type': 'application/json'
                                },
                                data: self.getJSONObject()
                            }).then(function (response) {
                            return resolve(response);
                        })
                    });
                },
                refresh: function()
                {

                }
            };


            service.createQueueItem = function (queueItemObj) {
                let obj = Object.assign({},queueItemObj);
                obj.due = moment(obj.due).format('x');
                obj.due = parseInt(obj.due);
                return $q(function (resolve, reject) {
                    $http(
                        {
                            method: 'POST',
                            url: '/v1/queueitem',
                            headers: {
                                'cache-control': 'no-cache',
                                'content-type': 'application/json'
                            },
                            data: JSON.stringify(obj)
                        }).then(function (response) {
                        return resolve(response);
                    })
                })
            };

            // https://www.reisewarnung.net/api GET
            service.getQueueItems = function()
            {
                let list = {
                    _status: 'loading',
                    _response: null,
                    data: [],
                };

                let url = queueItemGetUrl;
                $http(
                    {
                        method: 'GET',
                        url: url,
                        params: {
                            'status': 'in_progress'
                        },
                        headers: {
                            'cache-control': 'no-cache'
                        },
                    }
                ).then(function (response) {
                    list._response = response;
                    if (response.data) {

                        $timeout(function () {
                            for (let i in response.data.data) {
                                let objData = response.data.data[i];
                                let obj = new QueueItem(objData);
                                console.log(obj);
                                list.data.push(obj);
                            }
                            list._status = 'loaded';
                        }, 500);
                    }
                });
                return list;
            };

            return service;
        }]);




    app.controller('queueCtl', ['_user', '$rootScope', '$cookies', '$scope', '$location',
        '$http', '$routeParams', 'hotkeys','ErrorService',
        'NotificationService', 'Notification','QueueService',
        function (_user, $rootScope, $cookies, $scope, $location, $http, $routeParams,
                  hotkeys, ErrorService,
                  NotificationService,Notification,QueueService,socket) {

            let businessEndTime = '1700';

            //momentjs will use the pc's local time by default.
            let getDefaultDueDate = function()
            {
                let format = 'YYYY-MM-DD';
                let hourMinuteTime = moment.tz(moment.tz.guess()).format('HHmm');

                let momentTime = moment().startOf('day').add(17,'hours');

                //if outside of business hours use next day.
                if (hourMinuteTime > businessEndTime) {
                    momentTime.add(1,'days');
                }
                return momentTime.toDate();
            };


            $scope._user = _user;

            $scope.title = "Queue";

            $scope.newQueueItem = {};

            // $scope.defaultDueDate = getDefaultDueDate();

            $scope.newQueueItem.due = getDefaultDueDate();


            $scope.queueItems = QueueService.getQueueItems();


            $scope.test = function() {
                console.log('test');
            };


            $scope.createNewQueueItem = function()
            {
                QueueService.createQueueItem($scope.newQueueItem).then(function() {
                    $scope.queueItems = QueueService.getQueueItems();
                });
            };


            $scope.showIdx = {};

            $scope.toggleShow = function(idx)
            {
                let isShown = $scope.getShow(idx);
                console.log('showIdx',$scope.showIdx,isShown,!isShown);

                $scope.showIdx[idx] = !isShown;
            };

            $scope.getShow = function(idx)
            {
                return $scope.showIdx[idx] == true;
            };

            $scope.markAllComplete = function()
            {
                console.log('markAllComplete',$scope.queueItems.data);
                for (let i in $scope.queueItems.data)
                {
                    // console.log(queue);
                    $scope.queueItems.data[i].complete();
                }
            }


        }])



    app.factory('NotificationHookService', ['$http', '$q', '$timeout',
        function ($http, $q,
                  $timeout) {

            let service = {};
            let baseurl = '';
            let itemgetUrl = baseurl + '/v1/notificationhook';
            let queueItemPostUrl = baseurl + '/v1/queueitem';





            function NotificationHook(data) {
                if (data) {
                    this.setData(data);
                }
            }

            NotificationHook.prototype = {
                setData: function (data) {
                    angular.extend(this, data);
                    this.due = new Date(this.due);
                },
                getJSON: function () {
                    return JSON.stringify(this.getJSONObject());
                },
                getDue: function()
                {
                    return moment(this.due).format(defaultDateFormat);
                },
                getJSONObject: function () {
                    return {
                        message: this.message,
                        due: this.due,
                        status: this.status,
                        //ADD more here
                    }
                },
                getPanelClass: function()
                {
                    // if (Model.PanelClassesByStatus[this.Status]) {
                    //     return Model.PanelClassesByStatus[this.Status];
                    // }
                    // 'DELETED': 'panel-danger',
                    // 'SUBMITTED': 'panel-primary',
                    // 'APPROVED': 'panel-success',
                    // 'INPROGRESS': 'panel-warning'
                    return 'panel-success';
                },
                getUpdateFields: function()
                {
                    return ['message','due','status']
                },
                moveStatus: function(status) {
                    this.status = status;
                    return this.update();
                },
                complete: function()
                {
                    this.moveStatus('complete');
                },
                archive: function()
                {
                    this.moveStatus('archive');
                },
                update: function()
                {
                    console.log('update queueitem');
                    let self = this;
                    return $q(function (resolve, reject) {
                        $http(
                            {
                                method: 'PUT',
                                url: '/v1/queueitem/'+ self._id,
                                headers: {
                                    'cache-control': 'no-cache',
                                    'content-type': 'application/json'
                                },
                                data: self.getJSONObject()
                            }).then(function (response) {
                            return resolve(response);
                        })
                    });
                },
                refresh: function()
                {

                }
            };


            service.createQueueItem = function (queueItemObj) {
                let obj = Object.assign({},queueItemObj);
                obj.due = moment(obj.due).format('x');
                obj.due = parseInt(obj.due);
                return $q(function (resolve, reject) {
                    $http(
                        {
                            method: 'POST',
                            url: '/v1/queueitem',
                            headers: {
                                'cache-control': 'no-cache',
                                'content-type': 'application/json'
                            },
                            data: JSON.stringify(obj)
                        }).then(function (response) {
                        return resolve(response);
                    })
                })
            };

            // https://www.reisewarnung.net/api GET
            service.getNotificationHooks = function()
            {
                let list = {
                    _status: 'loading',
                    _response: null,
                    data: [],
                };

                let url = itemgetUrl;
                $http(
                    {
                        method: 'GET',
                        url: url,
                        headers: {
                            'cache-control': 'no-cache'
                        },
                    }
                ).then(function (response) {
                    list._response = response;
                    if (response.data) {

                        $timeout(function () {
                            for (let i in response.data) {
                                let objData = response.data[i];
                                let obj = new NotificationHook(objData);
                                console.log(obj);
                                list.data.push(obj);
                            }
                            list._status = 'loaded';
                        }, 500);
                    }
                });
                return list;
            };

            return service;
        }]);



    app.controller('notificationhookCtl', ['_user', '$rootScope', '$cookies', '$scope', '$location',
        '$http', '$routeParams', 'hotkeys','ErrorService',
        'NotificationHookService', 'Notification','QueueService',
        function (_user, $rootScope, $cookies, $scope, $location, $http, $routeParams,
                  hotkeys, ErrorService,
                  NotificationHookService,Notification,QueueService,socket) {

            let businessEndTime = '1700';



            $scope.notificationHooks = NotificationHookService.getNotificationHooks();

            $scope.showIdx = {};

            $scope.toggleShow = function(idx)
            {
                let isShown = $scope.getShow(idx);
                console.log('showIdx',$scope.showIdx,isShown,!isShown);

                $scope.showIdx[idx] = !isShown;
            };

            $scope.getShow = function(idx)
            {
                return $scope.showIdx[idx] == true;
            };


        }])

})();
