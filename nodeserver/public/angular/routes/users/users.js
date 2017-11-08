app.controller('usersCtl', ['$rootScope', '$cookies', '$scope', '$location',
    '$http', '$routeParams', 'hotkeys', 'UserService',
    function ($rootScope, $cookies, $scope, $location, $http, $routeParams, hotkeys, UserService) {
        // $scope.isActive = function (path) {
        //     return path === $location.path();
        // };

        console.log('UserService',UserService);

        $scope.getCurrentUser = UserService.getCurrentUser;

        console.log('usersCtl',$scope.getCurrentUser);

        $scope.users = UserService.getUsers();


    }]);