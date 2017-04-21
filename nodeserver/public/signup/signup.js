// create angular app
var validationApp = angular.module('validationApp', []);

validationApp.config(['$locationProvider', function($locationProvider) {
	$locationProvider.html5Mode({
		enabled: true,
		requireBase: false
	});
}]);

// http://stackoverflow.com/questions/12419619/whats-the-difference-between-ng-model-and-ng-bind
// create angular controller
validationApp.controller('mainController', function($rootScope, $scope, $location, $http) {

	// $scope.user = {
	// 	email: '',
	// 	password: '',
	// };

	// console.log($scope.user);
	
	$scope.queryParams = $location.search();

	var singup = function(user) {
		$http.post('/v1/login', user).then(function successCallback(res) {
				console.log('success');
				console.log(res);
				console.log(res.status);
				console.log(res.data);
				if (res.status === 201) {
					if (!$scope.queryParams.redirect_uri) {
						$scope.queryParams.redirect_uri = '/v1/todos/public/';
					}
					console.log('redirect to ' + $scope.queryParams.redirect_uri)
					window.location = $scope.queryParams.redirect_uri;
				}
			},
			function errorCallback(res) {
				if (res.status === 401) {
					//TODO add link to login page. Ensure animation works.
					new Noty({
					    text: 'This email has already been signed up. Please login from the <a href="/login">main login page.</a>',
					    animation: {
					        // open: 'animated bounceInLeft', // Animate.css class names
					        // close: 'animated bounceOutLeft', // Animate.css class names
					    }
					}).show();
				}
				console.log(res.status);
			});

	}

	// function to submit the form after all validation has occurred			
	$scope.submitForm = function() {

		// check to make sure the form is completely valid
		if ($scope.userForm.$valid) {
			singup({
				username: $scope.user.email,
				password: $scope.user.password
			});
		}

	};

});
