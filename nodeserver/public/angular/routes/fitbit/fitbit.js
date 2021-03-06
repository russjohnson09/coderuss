let baseApiUrl = '/v1/fitbit/api';
let fitbitApiUrl = '/v1/fitbit/api';


app.factory('FitbitProfile', ['$http', '$q', '$timeout', function ($http, $q,
                                                                   $timeout) {
    function FitbitProfile(data) {
        if (data) {
            this.setData(data);
        }
    }

    let baseApiUrl = '/v1/fitbit/api';

    //POST https://api.fitbit.com/1.2/user/-/sleep.json?date=2017-03-27&startTime=02:32&duration=7200000
    function getLogSleepUrl(user_id) {
        if (user_id === undefined) {
            user_id = '-';
        }
        return baseApiUrl + '/1.2/user/' + user_id + '/sleep.json';
    }

    // let url = '/v1/fitbit/api/1/user/-/profile.json';

    FitbitProfile.prototype = {
        setData: function (data) {
            angular.extend(this, data);
        },
        /**
         *
         * @param startTime Start time; hours and minutes in the format HH:mm.
         * @param duration Duration in milliseconds.
         * @param date Log entry date in the format yyyy-MM-dd.
         */
        logSleep: function (startTime, duration, date) {

            //https://web-api.fitbit.com/1.2/user/-/sleep/16286217913.json POST update sleep log

            let defaultStartTime = '00:00'; // moment().startOf('day').format('HH:mm');
            duration = duration || (1000 * 60 * 60 * 8); //8 hours in milliseconds
            startTime = startTime || defaultStartTime;
            date = date || moment().format('YYYY-MM-DD');

            // let user_id = this.user.encodedId;
            // let url = getLogSleepUrl(user_id);
            let url = getLogSleepUrl();
            $http(
                {
                    method: 'POST',
                    url: url,
                    headers: {
                        'cache-control': 'no-cache',
                        'content-type': 'application/json'
                    },
                    //is part of query parameters and not post parameters
                    params: {
                        startTime: startTime,
                        duration: duration,
                        date: date
                    },
                    // data: JSON.stringify({
                    //     startTime: startTime,
                    //     duration: duration,
                    //     date: date
                    // })
                }
            ).then(function (response) {
                if (response.data) {
                    $timeout(function () {
                        let data = $.extend(true, response.data, {_status: 'loaded'})
                        fitbitProfile.setData(data);
                        console.log(fitbitProfile);
                    }, 500);
                }
            });
        }
    };

    FitbitProfile.prototype.logSleep

    return FitbitProfile;
}]);


app.factory('SleepLog', ['$http', '$q', '$timeout', function ($http, $q,
                                                              $timeout) {
    function SleepLog(data) {
        if (data) {
            this.setData(data);
        }
    }

}]);

//"The value (99999999999) entered in field Limit was out of the range -2,147,483,648 to 2,147,483,647"
//"Limit cannot be greater than 100"
let maxInt = 2147483647;
let maxLimit = 100;

app.factory('FitbitService', ['$http', '$q', '$timeout', 'FitbitProfile',
    function ($http, $q,
              $timeout, FitbitProfile) {

        var baseurl = '';

        let service = {};

        //GET https://api.fitbit.com/1.2/user/-/sleep/list.json?beforeDate=2017-03-27&sort=desc&offset=0&limit=1
        service.getSleepLogsList = function (afterDate, sort, limit, offset) {


            // afterDate = afterDate || moment().startOf('month').format('YYYY-MM-DD');
            afterDate = afterDate || moment().subtract(maxLimit, 'days').format('YYYY-MM-DD');
            sort = sort || 'asc';
            limit = limit || maxLimit;
            offset = offset || 0;


            let sleepLogsList = {_status: 'loading'};
            let url = baseApiUrl + '/1.2/user/-/sleep/list.json';

            $http(
                {
                    method: 'GET',
                    url: url,
                    params: {
                        afterDate: afterDate,
                        sort: sort,
                        limit: limit,
                        offset: offset
                    },
                    headers: {
                        'cache-control': 'no-cache'
                    },
                }
            ).then(function (response) {
                if (response.data) {
                    $timeout(function () {

                        $.extend(true, sleepLogsList, response.data, {_status: 'loaded'});
                        // let data = $.extend(true,response.data,{_status:'loaded'})
                        // fitbitProfile.setData(data);
                        // console.log(fitbitProfile);
                    }, 500);
                }
            });

            return sleepLogsList;
        };


        service.getActivityLogsList = function (afterDate, sort, limit, offset) {


            afterDate = afterDate || moment().startOf('month').format('YYYY-MM-DD');
            sort = sort || 'asc';
            limit = limit || maxLimit;
            offset = offset || 0;


            let list = {_status: 'loading'};
            let url = baseApiUrl + '/1/user/-/activities/list.json';

            $http(
                {
                    method: 'GET',
                    url: url,
                    params: {
                        afterDate: afterDate,
                        sort: sort,
                        limit: limit,
                        offset: offset
                    },
                    headers: {
                        'cache-control': 'no-cache'
                    },
                }
            ).then(function (response) {
                if (response.data) {
                    $timeout(function () {

                        $.extend(true, list, response.data, {_status: 'loaded'});
                        // let data = $.extend(true,response.data,{_status:'loaded'})
                        // fitbitProfile.setData(data);
                        // console.log(fitbitProfile);
                    }, 500);
                }
            });

            return list;
        };

        /**
         * GET https://api.fitbit.com/1/user/[user-id]/body/log/fat/date/[date].json
         GET https://api.fitbit.com/1/user/[user-id]/body/log/fat/date/[date]/[period].json
         GET https://api.fitbit.com/1/user/[user-id]/body/log/fat/date/[base-date]/[end-date].json
         */
        service.getBodyFat = function () {
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
        service.getWeightGoal = function () {
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
                        console.log('goal', response.data);
                        // $.extend(true, habit, response.data);
                    }, 0);
                }
            });
        };

        // GET https://api.fitbit.com/1/user/[user-id]/foods/log/goal.json
        service.getFoodGoal = function () {
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
                        console.log('goal', response.data);
                        // $.extend(true, habit, response.data);
                    }, 0);
                }
            });
        };


        service.populateCurrentUserProfile = function (fitbitProfile) {
            console.log('populateCurrentUserProfile');
            fitbitProfile = fitbitProfile || new FitbitProfile({_status: 'loading'});
            let url = '/v1/fitbit/api/1/user/-/profile.json';
            return $q(function (resolve, reject) {
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
                                let data = $.extend(true, response.data, {_status: 'loaded'})
                                fitbitProfile.setData(data);
                                console.log(fitbitProfile);
                                resolve(fitbitProfile);
                            }, 500);
                        }
                    },
                    function (err) {
                        reject(err);
                    }
                );
            })
        };

        service.getCurrentUserProfile = function () {
            let fitbitProfile = new FitbitProfile({_status: 'loading'});
            service.populateCurrentUserProfile(fitbitProfile);
            console.log(fitbitProfile);
            return fitbitProfile;

            // let fitbitProfile = new FitbitProfile({_status: 'loading'});
            // let url = '/v1/fitbit/api/1/user/-/profile.json';
            // $http(
            //     {
            //         method: 'GET',
            //         url: url,
            //         headers: {
            //             'cache-control': 'no-cache'
            //         },
            //     }
            // ).then(function (response) {
            //     if (response.data) {
            //         $timeout(function () {
            //             let data = $.extend(true,response.data,{_status:'loaded'})
            //             fitbitProfile.setData(data);
            //             console.log(fitbitProfile);
            //         }, 500);
            //     }
            // });
            //
            // console.log(fitbitProfile);
            // return fitbitProfile;
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

        // window.location = '#!/signin';


        console.log('fitbitCtl user', $scope._user);
        var UserService = new User();

        UserService.getCurrentUser().then(function (user) {
            $rootScope.user = user;
        });


        $scope.fitbitUserProfile = FitbitService.getCurrentUserProfile();

        $scope.bodyFat = FitbitService.getBodyFat();

        FitbitService.getWeightGoal();

        FitbitService.getFoodGoal();

        $scope.sleepLogsList = FitbitService.getSleepLogsList();
        $scope.activityLogsList = FitbitService.getActivityLogsList();

        $scope.devMode = false;

    }]);

app.controller('fitbitDevCtl', ['_user', '$rootScope', '$cookies', '$scope', '$location',
    '$http', '$routeParams', 'FitbitService', 'hotkeys', 'User', '$timeout',
    function (_user, $rootScope, $cookies, $scope, $location, $http, $routeParams,
              FitbitService,
              hotkeys,
              User,
              $timeout) {

        console.log('fitbitDev');

        $scope.request = {};

        $scope.response = null;

        $scope.responses = [];

        //GET https://api.fitbit.com/<api-version>/user/-/sleep/goal.json
        $scope.getSleepGoal = function () {
            $scope.request = {
                url: fitbitApiUrl + '/1/user/-/sleep/goal.json',
                method: 'GET'
            };
            $scope.doRequest();
        };

        /**
         * Log sleep for the last 360 days.
         */
        $scope.logSleep = function () {
            let i = 0;
            // let hours = 8;
            let hours = 7;

            let duration = hours * 60 * 60 * 1000; //duration in milliseconds

            let date = moment().startOf('day');

            let rangeDays = 360;


            while (i < rangeDays) {
                let date2 = moment(date).subtract(i, 'days');
                // let date2 = date.subtract(i,'days')
                console.log(date2.format('YYYY-MM-DD HH:ss'));
                i++;
                $scope.request = {
                    url: fitbitApiUrl + '/1/user/-/sleep.json',
                    method: 'POST',
                    // headers: {
                    //     'content-type': 'application/json'
                    // },
                    params: {
                        duration: duration,
                        startTime: date2.format('HH:ss'),
                        date: date2.format('YYYY-MM-DD'),
                    }
                };

                $scope.doRequest();
            }
            return;


        };


        //https://dev.fitbit.com/reference/web-api/sleep/#get-sleep-goal
        $scope.updateSleepGoal = function () {
            $scope.request = {
                url: fitbitApiUrl + '/1/user/-/sleep/goal.json',
                method: 'POST',
                // headers: {
                //     'content-type': 'application/json'
                // },
                params: {
                    minDuration: 60 * 7,
                },
                // data: JSON.stringify(
                //     {
                //         minDuration: 60 * 7,
                //     }
                // )
            };
            $scope.doRequest();
        };

        $scope.doRequest = function () {
            console.log($scope.request);
            $scope.response = {
                _request: JSON.parse(JSON.stringify($scope.request)),
                _status: 'loading',
                _meta: {
                    start: Date.now(),
                }
            };
            $scope.responses.push($scope.response);
            $http(
                $scope.request
            ).then(function (response) {
                $scope.response._meta.end = Date.now();

                $timeout(function () {
                    $.extend(true, $scope.response, response);
                }, 0);
            });
        }

    }]);