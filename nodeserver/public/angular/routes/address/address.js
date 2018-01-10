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
                    let url = baseApiUrl;  // /v1/users/me/address
                    let self = this;
                    return new Promise(function(resolve) {
                        $http(
                            {
                                method: 'DELETE',
                                url: url + '/' + self._id,
                                headers: {
                                    'cache-control': 'no-cache'
                                },
                            }
                        ).then(function (response) {
                            $timeout(function () {
                                resolve(response);
                            }, 500);
                        });
                    });
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

                service.deleteById = function(id)
                {
                    let url = baseApiUrl;  // /v1/users/me/address
                    let self = this;
                    return new Promise(function(resolve) {
                        $http(
                            {
                                method: 'DELETE',
                                url: url + '/' + id,
                                data: data,
                                headers: {
                                    'cache-control': 'no-cache'
                                },
                            }
                        ).then(function (response) {
                            if (response.data) {
                                $timeout(function () {
                                    resolve(response);
                                }, 500);
                            }
                        });
                    });
                };

                service.createAddress = function(data)
                {
                    let url = baseApiUrl;  // /v1/users/me/address
                    if (data.tags) {
                        data.tags = data.tags.split(',')
                    }

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
                                    resolve(response);
                                }, 500);
                            }
                        });
                    });
                };

                return service;
            }]);
    })();


    // <!--{ _id: '5a2a33c323421f316427d54a',-->
    // <!--created: 1512715203642,-->
    // <!--user_id: '5a29e5637b25df2af7a626e9',-->
    // <!--name: 'test address',-->
    // <!--address: 'test address',-->
    // <!--city: 'Detroit',-->
    // <!--state: 'MI',-->
    // <!--zip: 48339-->
    // <!--tags: [] },-->

    app.controller('addressCtl', ['$rootScope', '$cookies', '$scope', '$location',
        '$http', '$routeParams', 'AddressService', 'hotkeys',
        function ($rootScope, $cookies, $scope, $location, $http, $routeParams,
                  AddressService,
                  hotkeys) {

            $scope.params = {};

            $scope.addressForm = {
                name: '',
                address: '',
                city: '',
                state: '',
                zip: '',
                tags: ''
            };

            $scope.createAddress = function()
            {
                let addressData = Object.assign({},$scope.addressForm);
                AddressService.createAddress(
                    addressData
                ).then(function(response) {
                    console.log('createAddress',response);
                    $scope.addressList = AddressService.getAddressList($scope.params);
                });
            };

            $scope.deleteAddress = function(index)
            {
                console.log('deleteAddress',index,$scope.addressList.data);
                let address = $scope.addressList.data.splice(index,1)[0];
                console.log('deleteAddress',address);

                address.delete().then(function() {
                    $scope.addressList = AddressService.getAddressList($scope.params);
                })
            };

            $scope.$watch("params", function(newValue, oldValue) {
                console.log('params',
                    Object.assign({},$scope.params),
                        Object.assign({},newValue),
                            Object.assign({},oldValue));

                    $scope.addressList = AddressService.getAddressList($scope.params);
                },
            true);


        }]);
})(jQuery);
