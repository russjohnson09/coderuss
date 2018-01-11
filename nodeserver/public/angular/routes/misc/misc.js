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
