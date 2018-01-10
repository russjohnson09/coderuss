(function addAdminLogsCtl() {


    // app.factory('TravelWarningService', ['$http', '$q', '$timeout',
    //     function ($http, $q,
    //               $timeout) {
    //
    //         var baseurl = '';
    //
    //         let service = {};
    //
    //         // let warning_api = 'https://www.reisewarnung.net/api';
    //
    //         //reisewarnung -> travel warning
    //         // let warning_api = '/reisewarnung/api';
    //
    //         let travelWarningApi = '/v1/proxy/travelwarning/api';
    //
    //
    //         // https://www.reisewarnung.net/api GET
    //         service.getTravelWarningList = function()
    //         {
    //             let list = {
    //                 _status: 'loading',
    //                 _response: null,
    //                 data: [],
    //             };
    //
    //             let url = travelWarningApi;
    //             $http(
    //                 {
    //                     method: 'GET',
    //                     url: url,
    //                     params: {
    //                     },
    //                     headers: {
    //                         'cache-control': 'no-cache'
    //                     },
    //                 }
    //             ).then(function (response) {
    //                 list._response = response;
    //                 if (response.data) {
    //
    //                     $timeout(function () {
    //                         for (let i in response.data.data) {
    //                             let objData = response.data.data[i];
    //                             let obj = objData; //TODO Transaction factory
    //                             list.data.push(obj);
    //                         }
    //                         list._status = 'loaded';
    //                     }, 500);
    //                 }
    //             });
    //             return list;
    //         };
    //
    //         return service;
    //     }]);


    app.controller('adminlogsCtl', ['_user', '$rootScope', '$cookies', '$scope', '$location',
        '$http', '$routeParams', 'hotkeys','ErrorService',
        'NotificationService', 'Notification','TravelWarningService',
        function (_user, $rootScope, $cookies, $scope, $location, $http, $routeParams,
                  hotkeys, ErrorService,
                  NotificationService,Notification,TravelWarningService) {
            $scope._user = _user;

            // $scope.countries = TravelWarningService.getTravelWarningList();


            // var socketUrl = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
            // var socket = io('/v1/adminlogs');
            //
            // socket.on('info', function (data) {
            //     console.log(JSON.stringify(data));
            // });
            //
            // socket.on('log', function (data) {
            //     console.log(JSON.stringify(data));
            // });
            //
            //
            // socket.on('zorkoutput', function (data) {
            //     console.log(data);
            //     // var html = ansi_up.ansi_to_html(data);
            //     // console.log(html);
            //     $("#zorkoutput").append(data);
            //     //http://www.jquerybyexample.net/2010/09/how-to-scroll-to-bottom-of-textarea.html
            //     $('#zorkoutput').scrollTop($('#zorkoutput')[0].scrollHeight);
            // });


            var socketUrl = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
            var socket = io('/v1/adminlogs');

            socket.on('info', function (data) {
                console.log(JSON.stringify(data));
            });


            socket.on('zorkoutput', function (data) {
                console.log(data);
                // var html = ansi_up.ansi_to_html(data);
                // console.log(html);
                $("#zorkoutput").append(data);
                //http://www.jquerybyexample.net/2010/09/how-to-scroll-to-bottom-of-textarea.html
                $('#zorkoutput').scrollTop($('#zorkoutput')[0].scrollHeight);
            });

            $('#zorkform').submit(function (event) {
                event.preventDefault();
                var zorkcmd = $('input#zorkcmd').val();
                $('input#zorkcmd').val('');
                console.log(zorkcmd);

                socket.emit('zorkcmd', zorkcmd);
            });


            // $scope.transactionList = TransactionService.getTransactionList();

        }])
})();
