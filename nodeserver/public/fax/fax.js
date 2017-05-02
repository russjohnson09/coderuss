var validationApp = angular.module('validationApp', []);

validationApp.config(['$locationProvider', function($locationProvider) {
	$locationProvider.html5Mode({
		enabled: true,
		requireBase: false
	});
}]);


validationApp.controller('mainController', function($rootScope, $scope, $location, $http) {

	// this.uploadFileToUrl = function(file, uploadUrl){
	//       var fd = new FormData();
	//       fd.append('file', file);
	//       $http.post(uploadUrl, fd, 
	// {
	//           transformRequest: angular.identity,
	//           headers: {'Content-Type': undefined}
	//       }
	// )
	//       .success(function(){
	//       })
	//       .error(function(){
	//       });
	//   }


	// var fax = function(fax) {
	// 	var fd = new FormData();
	// 	fd.append('file', file);
	// 	$http.post('/v1/fax', fd, {
	// 		headers: {
	// 			transformRequest: angular.identity,
	// 			'Content-Type': undefined
	// 		}
	// 	}).then(function successCallback(res) {
	// 			console.log('success');
	// 			console.log(res);
	// 			console.log(res.status);
	// 			console.log(res.data);
	// 			if (res.status === 201) {
	// 				if (!$scope.queryParams.redirect_uri) {
	// 					$scope.queryParams.redirect_uri = '/v1/todos/public/';
	// 				}
	// 				console.log('redirect to ' + $scope.queryParams.redirect_uri)
	// 				window.location = $scope.queryParams.redirect_uri;
	// 			}
	// 		},
	// 		function errorCallback(res) {
	// 			if (res.status === 401) {
	// 				new Noty({
	// 					text: res.data,
	// 					animation: {}
	// 				}).show();
	// 			}
	// 			console.log(res.status);
	// 		});

	// }

	$scope.submitForm = function() {
		// fax({
		// 	fax: $scope.fax.fax,
		// 	file: $scope.fax.file
		// });

		var fd = new FormData();
		$scope.file = $('input[name=file]')[0].files[0]
		console.log($scope.file)
		fd.append('file', $scope.file);
		fd.append('fax', $scope.fax);
		$http.post('/v1/fax', fd, 
		{
			transformRequest: angular.identity,
			headers: {
				'Content-Type': undefined
			}
		}).then(function successCallback(res) {
				console.log('success');
				console.log(res);
				console.log(res.status);
				console.log(res.data);
				if (res.status === 201) {
					new Noty({
						text: JSON.stringify(res.data,null,'  '),
						animation: {}
					}).show();
					// if (!$scope.queryParams.redirect_uri) {
					// 	$scope.queryParams.redirect_uri = '/v1/todos/public/';
					// }
					// console.log('redirect to ' + $scope.queryParams.redirect_uri)
					// window.location = $scope.queryParams.redirect_uri;
				}
			},
			function errorCallback(res) {
				if (res.status === 401) {
					new Noty({
						text: JSON.stringify(res.data,null,'  '),
						animation: {}
					}).show();
				}
				console.log(res.status);
			});

	};
	// }

});
