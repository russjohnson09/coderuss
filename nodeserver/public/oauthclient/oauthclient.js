var app = angular.module('oauthclient', []);

app.config(['$locationProvider', function($locationProvider) {
	$locationProvider.html5Mode({
		enabled: true
			// ,requireBase: false
	});
}]);

app.controller('mainController', function($rootScope, $scope, $location, $http) {
	$scope.formData = {};

	$scope.alerts = [];

	$scope.clients = [];


	var params = $location.search();

	console.log(params);

	// $scope.addAlert = function(msg) {
	//};

	$scope.closeAlert = function(index) {
		$scope.alerts.splice(index, 1);
	};


	$scope.oauthclientsubmit = function() {
		console.log($scope.formData);
		$http.post('/v1/oauthclients', $scope.formData).then(function successCallback(res) {
				console.log('success');
				console.log(res);
				console.log(res.status);
				console.log(res.data);
				if (res.status === 201) {
					$scope.alerts.push({
						msg: 'Successful request',
						show: true
					});
				}

				$scope.getoauthclients();
			},
			function errorCallback(res) {
				console.log(res.status);
			});
	}

	$scope.getoauthclients = function() {
		$http.get('/v1/oauthclients', $scope.formData).then(function successCallback(res) {
				console.log('success');
				console.log(res);
				console.log(res.status);
				console.log(res.data);
				if (res.status === 200) {
					$scope.clients = res.data;
				}

			},
			function errorCallback(res) {
				console.log(res.status);
			});
	}

	$scope.getoauthclients();

});
