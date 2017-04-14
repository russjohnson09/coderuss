var app = angular.module('index', []);

app.config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}]);

app.controller('mainController', function($rootScope, $scope, $location, $http) {
    $scope.formData = {};

    $scope.alerts = [];

    $scope.deploytime = '...';

    // moment('2017').unix()
    // moment.unix(1483228801).format('YYYY-MM-DD')

    $http.get('/v1/ping', $scope.formData).then(function successCallback(res) {
            // console.log('success');
            // console.log(res);
            // console.log(res.status);
            console.log(res.data);
            if (res.status === 200) {
                // $scope.deploytime = moment(res.data.server.started).tz(moment.tz.guess()).format('YYYY-MM-DD HH:mm:ss z');
                $scope.deploytime = moment(res.data.server.started).tz(moment.tz.guess()).format('MMMM Do YYYY, h:mm:ss a z');
                $scope.commit = res.data.server.commit;
            }
        },
        function errorCallback(res) {
            console.log(res.status);
        });

    var params = $location.search();

});
