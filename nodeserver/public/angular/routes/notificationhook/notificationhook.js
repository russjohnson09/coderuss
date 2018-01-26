(function NotificationHook() {


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