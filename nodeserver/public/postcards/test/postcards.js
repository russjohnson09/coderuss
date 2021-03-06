var validationApp = angular.module('validationApp', []);

validationApp.config(['$locationProvider', function($locationProvider) {
	$locationProvider.html5Mode({
		enabled: true,
		requireBase: false
	});
}]);

//https://stackoverflow.com/questions/4853898/display-pdf-within-web-browser


//https://stackoverflow.com/questions/19009370/timeout-not-defined-error-in-angularjs-app
validationApp.controller('mainController', function($rootScope, $scope, $location, $http, $timeout,$window) {

	// var userId;
	var user = {};
	$scope.me = {
		'test': 1
	};
	$scope.test = 'test';
	
	$scope.fathersdaytemplate = {
			description: 'Demo Postcard job',
			to: {
				name: null,
				address_line1: null,
				address_city: null,
				address_state: null,
				address_zip: null,
			},
			from: {
				name: null,
				address_line1: null,
				address_city: null,
				address_state: null,
				address_zip: null,
			},
			front: null,
			back: null,
			data: {
			}
		};
		
			$scope.testTo = {
				name: 'Joe Smith',
				address_line1: '123 Main Street',
				address_city: 'Mountain View',
				address_state: 'CA',
				address_zip: '94041'
			};
			$scope.testFrom = {
				name: 'Joe Smith',
				address_line1: '123 Main Street',
				address_city: 'Mountain View',
				address_state: 'CA',
				address_zip: '94041'
			};
		
	$scope.populate = function() {
		$scope.fathersdaytemplate.to = $scope.testTo;
		$scope.fathersdaytemplate.from = $scope.testFrom;
	}
	
	$http.get('/postcards/templates/fathersday/front.html').then(function successCallback(res) {
		$scope.fathersdaytemplate.front = res.data;
		})
		
	$http.get('/postcards/templates/fathersday/back.html').then(function successCallback(res) {
		$scope.fathersdaytemplate.back = res.data;
		});
		

	$scope.fathersdaytemplate.data.signature = "Sincerely,<br><br>Russ<br>"
	$scope.fathersdaytemplate.data.body = "Thank you so much for being my Dad."


	
	$scope.postcard = {
			description: 'Demo Postcard job',
			to: {
				name: 'Joe Smith',
				address_line1: '123 Main Street',
				address_city: 'Mountain View',
				address_state: 'CA',
				address_zip: '94041'
			},
			from: {
				name: 'Joe Smith',
				address_line1: '123 Main Street',
				address_city: 'Mountain View',
				address_state: 'CA',
				address_zip: '94041'
			},
			front: '<html style="padding: 1in; font-size: 50;">Front HTML for {{name}}</html>',
			back: '<html style="padding: 1in; font-size: 20;">Back HTML for {{name}}</html>',
			data: {
				name: 'Harry'
			}
		}

	$http.get('/v1/users/me', {
		transformRequest: angular.identity,
	}).then(function successCallback(res) {
			console.log('success');
			console.log(res);
			console.log(res.status);
			new Noty({
				text: JSON.stringify(res.data, null, '  '),
				animation: {}
			}).show();
			if (res.status === 200) {
				console.log(Date.now());
				userId = res.data._id;
				$scope.me = res.data;
			}
		},
		function errorCallback(res) {
			new Noty({
				text: JSON.stringify(res.data, null, '  '),
				animation: {}
			}).show();
			$window.location.href = '/login?redirect_uri=/postcards/test';

		});


	$scope.completeVisible = false;
	$scope.fathersDayTemplate = function() {
		$scope.preview = {};
		
		$http.post('/v1/postcards/preview', $scope.fathersdaytemplate, {
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(function successCallback(res) {
				new Noty({
					text: JSON.stringify(res.data, null, '  '),
					animation: {}
				}).show();
				if (res.status === 200) {
					console.log(Date.now());
					$timeout(function() {
						console.log('set preview');
						console.log(Date.now());

						console.log($scope);
						$scope.preview.front_src = res.data.thumbnails[0].large;
						$scope.preview.back_src = res.data.thumbnails[1].large;
						console.log($scope.preview);
												$scope.completeVisible = true;

					}, 8000)


				}
			},
			function errorCallback(res) {
				new Noty({
					text: JSON.stringify(res.data, null, '  '),
					animation: {}
				}).show();
			});
	};

	$scope.isSubmitted = false;
	$scope.fathersDayTemplateComplete = function() {
		$scope.preview = {};
		
		if ($scope.isSubmitted) {
			return;
		}
		$scope.isSubmitted = true;
		
		$http.post('/v1/postcards', $scope.fathersdaytemplate, {
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(function successCallback(res) {
				new Noty({
					text: JSON.stringify(res.data, null, '  '),
					animation: {}
				}).show();
				if (res.status === 200) {
					console.log(Date.now());
					$timeout(function() {
						console.log($scope);
						$scope.preview.front_src = res.data.thumbnails[0].large;
						$scope.preview.back_src = res.data.thumbnails[1].large;
						console.log($scope.preview);
					}, 8000)


				}
			},
			function errorCallback(res) {
				new Noty({
					text: JSON.stringify(res.data, null, '  '),
					animation: {}
				}).show();
			});
	};


	$scope.addDollar = function() {

		$http.post('/v1/users/' + $scope.me._id + '/inc', {
			inc: 1
		}, {
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(function successCallback(res) {
				console.log(res.status);
				new Noty({
						text: JSON.stringify(res.data, null, '  '),
						animation: {}
					}).show();
			},
			function errorCallback(res) {
				new Noty({
					text: JSON.stringify(res.data, null, '  '),
					animation: {}
				}).show();
			});
	};

});
