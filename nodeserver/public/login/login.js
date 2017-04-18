var app = angular.module('login', ['ngMessages']);

app.config(['$locationProvider', function($locationProvider) {
	$locationProvider.html5Mode({
		enabled: true,
		requireBase: false
	});
}]);

app.controller('mainController', function($rootScope, $scope, $location, $http) {
	$scope.formData = {};

	$scope.alerts = [];

	var params = $location.search();

	$scope.closeAlert = function(index) {
		$scope.alerts.splice(index, 1);
	};


	$scope.reqestpasswordreset = function() {
		console.log($scope.formData);
		$http.post('/v1/reqestpasswordreset', $scope.formData).then(function successCallback(res) {
				console.log('success');
				console.log(res);
				console.log(res.status);
				console.log(res.data);
				if (res.status === 201) {
					$scope.alerts.push({
						msg: 'Email sent with password reset link!',
						show: true
					});

				}
			},
			function errorCallback(res) {
				console.log(res.status);
			});
	}


	$scope.login = function() {
		console.log($scope.formData);
		$http.post('/v1/login', $scope.formData).then(function successCallback(res) {
				console.log('success');
				console.log(res);
				console.log(res.status);
				console.log(res.data);
				if (res.status === 201) {
					if (!params.redirect_uri) {
						params.redirect_uri = '/v1/todos/public/';
					}
					console.log('redirect to ' + params.redirect_uri)
					window.location = params.redirect_uri;
				}
			},
			function errorCallback(res) {
				console.log(res.status);


			});
	}

});
