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

    app.factory('Transaction', ['$http', '$q', '$timeout', function ($http, $q,
                                                                     $timeout) {


        function Model(data) {
            if (data) {
                this.setData(data);
            }
        }

        let localTimeFormat = 'MMMM Do YYYY, h:mm:ss a z';
        let defaultTimeFormat = 'YYYY-MM-DD HH:mm:ss';
        Model.prototype = {
            setData: function (data) {
                angular.extend(this, data);
            },
            getCreatedLocalTime: function()
            {
                let self = this;
                return moment(this.created).format(localTimeFormat);
            },
            getCreatedDateTime: function()
            {
                let self = this;
                return moment(this.created).format(defaultTimeFormat);
            }
        };



        return Model;

    }]);

    app.factory('TransactionService', ['$http', '$q', '$timeout', 'Transaction',
        function ($http, $q,
                  $timeout, Transaction) {

            var baseurl = '';

            let service = {};

            service.createTransaction = function(data)
            {
                let url = '/v1/admin/transaction';

                return new Promise(function(resolve) {
                    $http(
                        {
                            method: 'POST',
                            url: url,
                            data: data,
                            headers: {
                                'cache-control': 'no-cache'
                            },
                        }
                    ).then(function (response) {
                        if (response.data) {
                            $timeout(function () {
                                resolve();
                            }, 500);
                        }
                    });
                });
            };

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
                                let transaction = new Transaction(transactionData); //TODO Transaction factory
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
        'NotificationService', 'Notification','TransactionService','UserService',
        function (_user, $rootScope, $cookies, $scope, $location, $http, $routeParams,
                  hotkeys, ErrorService,
                  NotificationService,Notification,TransactionService,UserService) {
            $scope._user = _user;

            $scope.transactionForm ={}; //not necessary for it to work but I prefer defining things

            $scope.transactionList = TransactionService.getTransactionList();

            $scope.createTransaction = function()
            {
                console.log('createTransaction');
                TransactionService.createTransaction($scope.transactionForm).then(function()
                {
                    console.log('get user',$scope._user);
                    $scope._user = UserService.getCurrentUser(true);

                    $scope.transactionList = TransactionService.getTransactionList();
                });
            }

        }])
})();
