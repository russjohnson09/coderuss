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

    app.factory('TransactionService', ['$http', '$q', '$timeout', 'FitbitProfile',
        function ($http, $q,
                  $timeout, FitbitProfile) {

            var baseurl = '';

            let service = {};

            // /v1/admin/transaction GET
            service.getTransactionList = function()
            {
                let transactionList = {
                    _status: 'loading',
                    _response: null,
                    data: [],
                };

                let url = '/v1/admin/transaction';
                $http(
                    {
                        method: 'GET',
                        url: url,
                        params: {
                        },
                        headers: {
                            'cache-control': 'no-cache'
                        },
                    }
                ).then(function (response) {
                    transactionList._response = response;
                    if (response.data) {

                        $timeout(function () {
                            for (let i in response.data.data) {
                                let transactionData = response.data.data[i];
                                let transaction = transactionData; //TODO Transaction factory
                                transactionList.data.push(transaction);
                            }
                            transactionList._status = 'loaded';
                        }, 500);
                    }
                });
                return transactionList;
            };

            return service;
        }]);


    app.controller('fundsCtl', ['_user', '$rootScope', '$cookies', '$scope', '$location',
        '$http', '$routeParams', 'hotkeys','ErrorService',
        'NotificationService', 'Notification','TransactionService',
        function (_user, $rootScope, $cookies, $scope, $location, $http, $routeParams,
                  hotkeys, ErrorService,
                  NotificationService,Notification,TransactionService) {
            $scope._user = _user;

            $scope.transactionList = TransactionService.getTransactionList();

        }])
})();
