var validationApp = angular.module('validationApp', []);

validationApp.config(['$locationProvider', function($locationProvider) {
	$locationProvider.html5Mode({
		enabled: true,
		requireBase: false
	});
}]);

//https://stackoverflow.com/questions/4853898/display-pdf-within-web-browser


//https://stackoverflow.com/questions/19009370/timeout-not-defined-error-in-angularjs-app
validationApp.controller('mainController', function($rootScope, $scope, $location, $http, $timeout) {

	$scope.submitForm = function() {

		var fd = new FormData();
		// $scope.file = $('input[name=file]')[0].files[0]
		// console.log($scope.file)
		// fd.append('file', $scope.file);
		$scope.preview = {};
		fd.append('test', 'test');
		$http.post('/v1/postcards/send/test', fd, {
			transformRequest: angular.identity,
			headers: {
				'Content-Type': undefined
			}
		}).then(function successCallback(res) {
				console.log('success');
				console.log(res);
				console.log(res.status);
				console.log(res.data);
				if (res.status === 200) {
					new Noty({
						text: JSON.stringify(res.data, null, '  '),
						animation: {}
					}).show();
					// $scope.last_response = res;
					//window.setTimeout(function() {
					//https://forum.ionicframework.com/t/view-not-updating-after-changing-scope-variable/15092/3
					console.log(Date.now());
					$timeout(function() {
						console.log('set preview');
						console.log(Date.now());

						console.log($scope);
						$scope.preview.front_src = res.data.thumbnails[0].small;
						$scope.preview.back_src = res.data.thumbnails[1].small;
						// $scope.preview.front_src = $scope.last_response.data.thumbnails[0].small;
						// $scope.preview.back_src = $scope.last_response.data.thumbnails[1].small;
						console.log($scope.preview);
					}, 8000)


				}
			},
			function errorCallback(res) {
				console.log(res);
				if (res.status === 401) {
					new Noty({
						text: JSON.stringify(res.data, null, '  '),
						animation: {}
					}).show();
				}
				else {
					console.log(res);
				}
			});

	};
	// }

});
