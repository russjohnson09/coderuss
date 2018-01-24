(function addTravelCtl() {


    app.factory('TravelWarningService', ['$http', '$q', '$timeout',
        function ($http, $q,
                  $timeout) {

            var baseurl = '';

            let service = {};

            // let warning_api = 'https://www.reisewarnung.net/api';

            //reisewarnung -> travel warning
            // let warning_api = '/reisewarnung/api';

            let travelWarningApi = '/v1/proxy/travelwarning/api';


            // https://www.reisewarnung.net/api GET
            service.getTravelWarningList = function()
            {
                let list = {
                    _status: 'loading',
                    _response: null,
                    data: [],
                };

                let url = travelWarningApi;
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


    app.controller('travelCtl', ['_user', '$rootScope', '$cookies', '$scope', '$location',
        '$http', '$routeParams', 'hotkeys','ErrorService',
        'NotificationService', 'Notification','TravelWarningService',
        function (_user, $rootScope, $cookies, $scope, $location, $http, $routeParams,
                  hotkeys, ErrorService,
                  NotificationService,Notification,TravelWarningService) {
            $scope._user = _user;

            $scope.countries = TravelWarningService.getTravelWarningList();


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



            $scope.getCountryPanelClass = function(item)
            {
                if (item.situation.sources > 0) {

                    //danger level
                    if (item.situation.rating < 2.1)
                    {
                        return 'panel-success';
                    }
                    if (item.situation.rating < 3)
                    {
                        return 'panel-warning';
                    }
                }


                return 'panel-danger';

            }

            // $scope.transactionList = TransactionService.getTransactionList();

        }])
})();
