(function addProfileCtl() {

    app.directive('transaction', function () {
        return {
            restrict: 'E',
            scope: {
                transaction: '=transaction',
            },
            templateUrl: 'directives/_transaction.html'
        };
    });

    app.controller('fundsCtl', ['_user', '$rootScope', '$cookies', '$scope', '$location',
        '$http', '$routeParams', 'hotkeys','ErrorService',
        'NotificationService', 'Notification',
        function (_user, $rootScope, $cookies, $scope, $location, $http, $routeParams,
                  hotkeys, ErrorService,
                  NotificationService,Notification) {
            $scope._user = _user;

        }])
})();
