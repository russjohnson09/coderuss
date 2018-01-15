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


    app.factory('QueueService', ['$http', '$q', '$timeout',
        function ($http, $q,
                  $timeout) {

            let service = {};
            let baseurl = '';
            let queueItemGetUrl = baseurl + '/v1/queueitem';
            let queueItemPostUrl = baseurl + '/v1/queueitem';


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
                            'completed': 0
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
                                let obj = objData; //TODO Transaction factory
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
            $scope._user = _user;

            $scope.title = "Queue";


            $scope.queueItems = QueueService.getQueueItems();




        }])
})();
