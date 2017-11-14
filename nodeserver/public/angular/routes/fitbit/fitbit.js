app.factory('FitbitProfile',['$http', '$q', '$timeout', function ($http, $q,
                                                                  $timeout) {
    function FitbitProfile(data) {
        if (data) {
            this.setData(data);
        }
    }

    FitbitProfile.prototype = {
        setData: function (data) {
            angular.extend(this, data);
        },
    };

    return FitbitProfile;
}]);


app.factory('FitbitService', ['$http', '$q', '$timeout','FitbitProfile',
    function ($http, $q,
    $timeout, FitbitProfile) {

    var baseurl = '';

    let service = {};

    /**
     * GET https://api.fitbit.com/1/user/[user-id]/body/log/fat/date/[date].json
     GET https://api.fitbit.com/1/user/[user-id]/body/log/fat/date/[date]/[period].json
     GET https://api.fitbit.com/1/user/[user-id]/body/log/fat/date/[base-date]/[end-date].json
     */
    service.getBodyFat = function() {
        // let date = 'today';
        let date = '2017-11-13';

        let period = '1m';
        let end_date = '';

        let url = '/v1/fitbit/api/1/user/-/body/log/fat/date/' + date + '/' + period + '.json';
        $http(
            {
                method: 'GET',
                url: url,
                headers: {
                    'cache-control': 'no-cache'
                },
            }
        ).then(function (response) {
            if (response.data) {
                $timeout(function () {
                    console.log(response.data);
                    // $.extend(true, habit, response.data);
                }, 0);
            }
        });
    };

    //GET https://api.fitbit.com/1/user/[user-id]/body/log/[goal-type]/goal.json
    service.getWeightGoal = function() {
        let date = '2017-11-13';

        let period = '1m';
        let end_date = '';

        // let url = '/v1/fitbit/api/1/user/-/body/log/fat/goal.json';
        let url = '/v1/fitbit/api/1/user/-/body/log/weight/goal.json';

        $http(
            {
                method: 'GET',
                url: url,
                headers: {
                    'cache-control': 'no-cache'
                },
            }
        ).then(function (response) {
            if (response.data) {
                $timeout(function () {
                    console.log('goal',response.data);
                    // $.extend(true, habit, response.data);
                }, 0);
            }
        });
    };

    // GET https://api.fitbit.com/1/user/[user-id]/foods/log/goal.json
    service.getFoodGoal = function() {
        let url = '/v1/fitbit/api/1/user/-/foods/log/goal.json';

        $http(
            {
                method: 'GET',
                url: url,
                headers: {
                    'cache-control': 'no-cache'
                },
            }
        ).then(function (response) {
            if (response.data) {
                $timeout(function () {
                    console.log('goal',response.data);
                    // $.extend(true, habit, response.data);
                }, 0);
            }
        });
    };

    service.getCurrentUserProfile = function()
    {

        let fitbitProfile = new FitbitProfile({_status: 'loading'});
        let url = '/v1/fitbit/api/1/user/-/profile.json';
        $http(
            {
                method: 'GET',
                url: url,
                headers: {
                    'cache-control': 'no-cache'
                },
            }
        ).then(function (response) {
            if (response.data) {
                $timeout(function () {
                    let data = $.extend(true,response.data,{_status:'loaded'})
                    fitbitProfile.setData(data);
                    console.log(fitbitProfile);
                }, 500);
            }
        });

        console.log(fitbitProfile);
        return fitbitProfile;
    };

    service.getHabitById = function (id) {
        let self = this;
        let habit = new Habit({_status: 'loading', _id: id});

        let url = baseurl + '/v1/habits/' + habit._id;

        $http(
            {
                method: 'GET',
                url: url,
                headers: {
                    'cache-control': 'no-cache'
                },
            }
        ).then(function (response) {
            if (response.data) {
                $timeout(function () {
                    $.extend(true, habit, response.data);
                }, 0);
            }
        });

        return habit;
    };

    // service.linkFitbitUser = function()
    // {
    //     window.location = '/v1/fitbit/auth';
    // };

    return service;
}]);

app.controller('fitbitCtl', ['_user', '$rootScope', '$cookies', '$scope', '$location',
    '$http', '$routeParams', 'FitbitService', 'hotkeys', 'User',
    function (_user, $rootScope, $cookies, $scope, $location, $http, $routeParams,
              FitbitService,
              hotkeys,
              User) {
        $scope._user = _user;
        console.log($scope._user);
        var UserService = new User();

        UserService.getCurrentUser().then(function (user) {
            $rootScope.user = user;
        });


        $scope.fitbitUserProfile = FitbitService.getCurrentUserProfile();

        $scope.bodyFat = FitbitService.getBodyFat();

        FitbitService.getWeightGoal();

        FitbitService.getFoodGoal();

        $scope.devMode = false;

    }]);