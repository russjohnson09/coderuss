(function ($) {
    (function () {
        let baseApiUrl = '/v1/users/me/address';

        app.factory('Address', ['$http', '$q', '$timeout', function ($http, $q,
                                                                     $timeout) {
            function Model(data) {
                if (data) {
                    this.setData(data);
                }
            }

            Model.prototype = {
                setData: function (data) {
                    angular.extend(this, data);
                },
                /**
                 * delete an address
                 */
                delete: function () {

                }
            };

            return Model;
        }]);

        app.factory('AddressService', ['$http', '$q', '$timeout', 'Address',
            function ($http, $q,
                      $timeout, Address) {

                let service = {};

                service.getAddressList = function (params) {
                    let list = {_status: 'loading', data: []};
                    let url = baseApiUrl;  // /v1/users/me/address

                    params = params || {};

                    $http(
                        {
                            method: 'GET',
                            url: url,
                            params: params,
                            headers: {
                                'cache-control': 'no-cache'
                            },
                        }
                    ).then(function (response) {
                        if (response.data) {
                            $timeout(function () {
                                let data = response.data.data;

                                for (let i in data) {
                                    let address = new Address(data[i]);
                                    list.data.push(address);
                                }
                                list._status = 'loaded';
                            }, 500);
                        }
                    });

                    return list;
                };

                return service;
            }]);
    })();


    app.controller('addressCtl', ['$rootScope', '$cookies', '$scope', '$location',
        '$http', '$routeParams', 'AddressService', 'hotkeys',
        function ($rootScope, $cookies, $scope, $location, $http, $routeParams,
                  AddressService,
                  hotkeys) {

            $scope.params = {};

            $scope.$watch("params", function(newValue, oldValue) {
                console.log('params',
                    Object.assign({},$scope.params),
                        Object.assign({},newValue),
                            Object.assign({},oldValue));

                    $scope.addressList = AddressService.getAddressList($scope.params);
                },
            true);

            $scope.addressList = AddressService.getAddressList($scope.params);

        }]);
})(jQuery);
