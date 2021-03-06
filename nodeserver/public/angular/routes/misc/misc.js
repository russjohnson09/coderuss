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


})();
