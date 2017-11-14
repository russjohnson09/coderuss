(function addHabitsCtl() {
    // app.factory('Habit', ['$http', '$q','$timeout' , function ($http, $q) {
    //     function Habit(data) {
    //         if (data) {
    //             this.setData(data);
    //         }
    //     };
    //
    //     var baseurl = '';
    //
    //     Habit.prototype = {
    //         setData: function (data) {
    //             angular.extend(this, {dates: {}}, data);
    //         },
    //         getJSON: function () {
    //             return JSON.stringify(this.getJSONObject());
    //         },
    //         getJSONObject: function () {
    //             return {
    //                 text: this.text,
    //             }
    //         },
    //         getHabits: function () {
    //             console.log('get habits')
    //             var self = this;
    //             var url = baseurl + '/v1/habits';
    //             return $q(function (resolve, reject) {
    //                 $http(
    //                     {
    //                         method: 'GET',
    //                         url: url,
    //                         headers: {
    //                             'cache-control': 'no-cache'
    //                         },
    //                     }
    //                 ).then(function (response) {
    //                     var habits = [];
    //                     if (response.data) {
    //                         for (var i in response.data) {
    //                             habits.push(new Habit(response.data[i]));
    //                         }
    //                         resolve(habits);
    //                     }
    //                 });
    //             })
    //         },
    //         add: function () {
    //             var self = this;
    //             return $q(function (resolve) {
    //                 var url = baseurl + '/v1/habits';
    //                 $http(
    //                     {
    //                         method: 'POST',
    //                         url: url,
    //                         data: self.getJSON(),
    //                         headers: {
    //                             'content-type': 'application/json',
    //                             'cache-control': 'no-cache'
    //                         },
    //                     }
    //                 ).then(function (response) {
    //                     if (response.data && response.data) {
    //                         self.setData(response.data);
    //                         resolve(self);
    //                     }
    //                 });
    //             });
    //
    //         },
    //         getStatus: function () {
    //             return this._status;
    //         },
    //         updateDate: function (date) {
    //             var self = this;
    //             var status;
    //             if (self.getDate(date).status !== 'complete') {
    //                 status = 'complete';
    //             }
    //             else {
    //                 status = 'incomplete';
    //             }
    //             var url = baseurl + '/v1/habits/' + self._id + '/dates/' + date;
    //             $http(
    //                 {
    //                     method: 'POST',
    //                     url: url,
    //                     headers: {},
    //                     data: {
    //                         status: status
    //                     }
    //                 }
    //             ).then(function (response) {
    //                 self.dates[date] = response.data;
    //             });
    //         },
    //         populateDate: function (date) {
    //             var self = this;
    //             var url = baseurl + '/v1/habits/' + self._id + '/dates/'
    //                 + date;
    //             $http(
    //                 {
    //                     method: 'GET',
    //                     url: url,
    //                     headers: {},
    //                 }
    //             ).then(function (response) {
    //                 self.dates[date] = response.data;
    //             });
    //         },
    //         getDate: function (date) {
    //             var self = this;
    //
    //             if (self.dates[date] === undefined) {
    //                 self.dates[date] = 'loading';
    //                 self.populateDate(date);
    //             }
    //
    //             return self.dates[date];
    //         },
    //         delete: function () {
    //             var self = this;
    //             this._status = 'deleted';
    //             var url = baseurl + '/v1/habits/' + self._id;
    //             $http(
    //                 {
    //                     method: 'DELETE',
    //                     url: url,
    //                     headers: {
    //                         'content-type': 'application/json',
    //                         'cache-control': 'no-cache'
    //                     },
    //                 }
    //             ).then(function (response) {
    //             });
    //         }
    //     };
    //
    //
    //     Habit.prototype.getHabitById = function(id) {
    //         let self = this;
    //         let habit = new Habit({_status: 'loading',_id: id});
    //
    //         let url = baseurl + '/v1/habits/' + habit._id;
    //
    //         $http(
    //             {
    //                 method: 'GET',
    //                 url: url,
    //                 headers: {
    //                     'cache-control': 'no-cache'
    //                 },
    //             }
    //         ).then(function (response) {
    //             if (response.data) {
    //                 $timeout(function () {
    //                     $.extend(true,habit,response.data);
    //                 }, 0);
    //             }
    //         });
    //
    //         return habit;
    //     };
    //
    //     return Habit;
    // }]);


    app.factory('HabitService', ['$http', '$q','$timeout','Habit' , function ($http, $q) {
        function Habit(data) {
            if (data) {
                this.setData(data);
            }
        };

        var baseurl = '';

        let service = {};

        Habit.prototype = {
            setData: function (data) {
                angular.extend(this, {dates: {}}, data);
            },
            getJSON: function () {
                return JSON.stringify(this.getJSONObject());
            },
            getJSONObject: function () {
                return {
                    text: this.text,
                }
            },
            getHabits: function () {
                console.log('get habits')
                var self = this;
                var url = baseurl + '/v1/habits';
                return $q(function (resolve, reject) {
                    $http(
                        {
                            method: 'GET',
                            url: url,
                            headers: {
                                'cache-control': 'no-cache'
                            },
                        }
                    ).then(function (response) {
                        var habits = [];
                        if (response.data) {
                            for (var i in response.data) {
                                habits.push(new Habit(response.data[i]));
                            }
                            resolve(habits);
                        }
                    });
                })
            },
            add: function () {
                var self = this;
                return $q(function (resolve) {
                    var url = baseurl + '/v1/habits';
                    $http(
                        {
                            method: 'POST',
                            url: url,
                            data: self.getJSON(),
                            headers: {
                                'content-type': 'application/json',
                                'cache-control': 'no-cache'
                            },
                        }
                    ).then(function (response) {
                        if (response.data && response.data) {
                            self.setData(response.data);
                            resolve(self);
                        }
                    });
                });

            },
            getStatus: function () {
                return this._status;
            },
            updateDate: function (date) {
                var self = this;
                var status;
                if (self.getDate(date).status !== 'complete') {
                    status = 'complete';
                }
                else {
                    status = 'incomplete';
                }
                var url = baseurl + '/v1/habits/' + self._id + '/dates/' + date;
                $http(
                    {
                        method: 'POST',
                        url: url,
                        headers: {},
                        data: {
                            status: status
                        }
                    }
                ).then(function (response) {
                    self.dates[date] = response.data;
                });
            },
            populateDate: function (date) {
                var self = this;
                var url = baseurl + '/v1/habits/' + self._id + '/dates/'
                    + date;
                $http(
                    {
                        method: 'GET',
                        url: url,
                        headers: {},
                    }
                ).then(function (response) {
                    self.dates[date] = response.data;
                });
            },
            getDate: function (date) {
                var self = this;

                if (self.dates[date] === undefined) {
                    self.dates[date] = 'loading';
                    self.populateDate(date);
                }

                return self.dates[date];
            },
            delete: function () {
                var self = this;
                this._status = 'deleted';
                var url = baseurl + '/v1/habits/' + self._id;
                $http(
                    {
                        method: 'DELETE',
                        url: url,
                        headers: {
                            'content-type': 'application/json',
                            'cache-control': 'no-cache'
                        },
                    }
                ).then(function (response) {
                });
            }
        };

        service.getHabitById = function(id) {
            let self = this;
            let habit = new Habit({_status: 'loading',_id: id});

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
                        $.extend(true,habit,response.data);
                    }, 0);
                }
            });

            return habit;
        };

        return service;
    }]);

    app.controller('habitsCtl', ['_user', '$rootScope', '$cookies', '$scope', '$location',
        '$http', '$routeParams', 'Habit', 'hotkeys', 'User',
        function (_user, $rootScope, $cookies, $scope, $location, $http, $routeParams, Habit,
                  hotkeys,
                  User) {
            $scope._user = _user;
            console.log($scope._user);
            var HabitService = new Habit();
            var UserService = new User();

            UserService.getCurrentUser().then(function (user) {
                $rootScope.user = user;
            });

            $scope.habits = [];
            $scope.devMode = false;

            hotkeys.bindTo($scope)
                .add({
                    combo: 'd e v',
                    description: 'Dev mode',
                    callback: function () {
                        $scope.devMode = !$scope.devMode;
                    }
                });


            //https://momentjs.com/docs/#/displaying/
            $scope.weekdays = [];
            var startOfWeek = moment().startOf('week');
            for (var i = 0; i < 7; i++) {
                $scope.weekdays.push(moment(startOfWeek).add(i, 'days'));
            }

            HabitService.getHabits().then(function (habits) {
                $scope.habits = habits;
            });


            $scope.newhabit = new Habit({});

            $scope.addHabit = function () {
                $scope.newhabit.add().then(function (habit) {
                    $scope.habits.push(habit);
                });
                $scope.newhabit = new Habit({});
            };

            console.log($scope.habits);


        }]);



    app.controller('habitsIdCtl', ['_user', '$rootScope', '$cookies', '$scope', '$location',
        '$http', '$routeParams', 'Habit', 'hotkeys', 'User',
        function (_user, $rootScope, $cookies, $scope, $location, $http, $routeParams, Habit,
                  hotkeys,
                  User) {
            $scope._user = _user;

            console.log('habitsIdCtl',$routeParams);
            console.log($scope._user);

            $scope.habit = Habit.getHabitById($routeParams.id);

            hotkeys.bindTo($scope)
                .add({
                    combo: 'd e v',
                    description: 'Dev mode',
                    callback: function () {
                        $scope.devMode = !$scope.devMode;
                    }
                });

        }]);

})();