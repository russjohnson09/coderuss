(function addProfileCtl() {

    app.factory('NotificationService', ['$http', '$q', '$timeout', 'ErrorService',
        'Notification',
        function ($http, $q, $timeout, ErrorService, Notification) {

            var service = {};

            service.getMyNotifications = function()
            {
                var result = {
                    _status: 'loading',
                    data: [],
                };

                $http({
                    'method': 'GET',
                    'url': '/v3/users/me/notifications',
                    'headers': {
//                            'x-set-timeout': 5000
                    }
                }).then(function(res) {
                    result._status = 'done';
                    var notifications = [];
                    for (var i in res.data) {
                        notifications.push(new Notification(res.data[i]));
                    }
                    result.data = notifications;
                });

                return result;
            };

            service.addTestNotification = function()
            {
                var notification = new Notification({
                    _status: 'loading',
                });
                $http({
                    'method': 'POST',
                    data: {
                        message: 'hello world',
                        created: 'ignored field'
                    },
                    headers: {
                        'X-SET-TIMEOUT': 5000
                    },
                    'url': '/v3/users/me/notifications'
                }).then(function(res) {
                    notification.setData({_status:'done'});
                    notification.setData(res.data);

                });

                return notification;
            };


            return service;

        }]);

    app.factory('Notification', ['$http', '$q', '$timeout', 'ErrorService',
        function ($http, $q, $timeout, ErrorService,) {
            function Model(data) {
                if (data) {
                    this.setData(data);
                }
            }

            Model.prototype = {
                setData: function (data) {
                    angular.extend(this, data);
                },
                remove: function () {
                    var self = this;
                    self._status = 'deleted';
                    $http({
                        method: 'DELETE',
                        url: '/v3/users/me/notifications/' + self._id
                    }).then(function (res) {
//                            self._status = '';
//                            new Noty({
//                                text: 'Removed Notification',
//                                type: 'success',
//                                timeout: 1000
//                            }).show();
                    }, ErrorService.handleHttpError);
                },
                isDeleted: function() {
                    return this._status == 'deleted';
                }
            };

            return Model;
        }]);

    app.directive('notification', function () {
        return {
            restrict: 'E',
            scope: {
                notification: '=notification',
                devMode: '=devMode'
            },
            templateUrl: 'directives/_notification.html'
        };
    });

    app.controller('profileCtl', ['_user', '$rootScope', '$cookies', '$scope', '$location',
        '$http', '$routeParams', 'hotkeys','ErrorService',
        'NotificationService', 'Notification',
        function (_user, $rootScope, $cookies, $scope, $location, $http, $routeParams,
                  hotkeys, ErrorService,
                  NotificationService,Notification) {
            $scope._user = _user;

            console.log(_user);

            hotkeys.bindTo($scope)
                .add({
                    combo: 'd e v',
                    description: 'Dev mode',
                    callback: function () {
                        $scope.devMode = !$scope.devMode;
                    }
                });

            $scope.testTvNotification = function()
            {
                $http({
                    'method': 'POST',
                    url: '/v1/testsuites/run/tvnotifications'
                }).then(function(res) {
                    console.log(res.data);
                },ErrorService.handleHttpError)
            };


            $scope.notificationsRequest = NotificationService.getMyNotifications();


            $scope.addTestNotification = function() {
                $scope.notificationsRequest.data.push(
                    NotificationService.addTestNotification());
            };


            $scope.addDollar = function() {

                $http.post('/v1/users/' + $scope._user._id + '/inc', {
                    inc: 1
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(function successCallback(res) {
                        new Noty({
                            text: JSON.stringify(res.data, null, '  '),
                            animation: {}
                        }).show();
                    },
                    function errorCallback(res) {
                        new Noty({
                            text: JSON.stringify(res.data, null, '  '),
                            animation: {}
                        }).show();
                    });
            };
        }])
})();
