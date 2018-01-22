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
