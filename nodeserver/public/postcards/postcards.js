var validationApp = angular.module('validationApp', []);

validationApp.config(['$locationProvider', function($locationProvider) {
	$locationProvider.html5Mode({
		enabled: true,
		requireBase: false
	});
}]);

//https://stackoverflow.com/questions/4853898/display-pdf-within-web-browser


//https://stackoverflow.com/questions/19009370/timeout-not-defined-error-in-angularjs-app
validationApp.controller('mainController', function($rootScope, $scope, $location, $http, $timeout, $window, $sce) {

	// var userId;
	var user = {};
	$scope.me = {
		'test': 1
	};
	$scope.test = 'test';

	$scope.selectedTemplate = {};

	$scope.templates = [{
		value: 'fathersday',
		'label': 'Father\'s day'
	}, {
		value: 'postcard',
		'label': 'Postcard'
	}, ];

	$scope.currentProjectUrl = '/templates/fathersday.html'

	$scope.postcard = {
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
		data: {}
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
		$scope.postcard.to = $scope.testTo;
		$scope.postcard.from = $scope.testFrom;
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

	$scope.getTemplate = function(callback) {
		$http.get('/postcards/templates/' + $scope.selectedTemplate + '/front.html').then(function successCallback(res) {
			$scope.postcard.front = res.data;
			$http.get('/postcards/templates/' + $scope.selectedTemplate + '/back.html').then(function successCallback(res) {
				$scope.postcard.back = res.data;
				console.log('template complete');
				callback();
			});
		});
	}

	$scope.postcardPreview = function() {
		$scope.preview = {};

		console.log('call get template');
		$scope.getTemplate(function() {
			console.log('got template');
			$scope.submitImage(function() {
				console.log('submitted image');
				$http.post('/v1/postcards/preview', $scope.postcard, {
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
			});

		});

	};

	$scope.isSubmitted = false;

	$scope.img = "";


	$scope.submitImage = function(callback) {
		$scope.file = $('input[name=file]')[0].files[0]
		if (!$scope.file) {
			console.log('no file');
			return callback();
		}
		var fd = new FormData();
		console.log($scope.file)
		fd.append('file', $scope.file);
		fd.append('expirationCount', 50);
		fd.append('byteLength', 5);

		$http.post('/api/v1/files/tmp', fd, {
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
					$scope.postcard.data.img = "<img src=" + res.data.meta.href + "></img>"
					console.log('img length');
					console.log($scope.postcard.data.img.length);
					new Noty({
						text: JSON.stringify(res.data, null, '  ') +
							"<a href=/api/v1/files/tmp?id=" + res.data.id + ">Link to file</a>",
						animation: {}
					}).show();
				}
				callback();
			},
			function errorCallback(res) {
				if (res.status === 401) {
					new Noty({
						text: JSON.stringify(res.data, null, '  '),
						animation: {}
					}).show();
				}
				console.log(res.status);
				callback();

			});

	};


	$scope.submitCompletePostcard = function() {
		$scope.preview = {};

		if ($scope.isSubmitted) {
			return;
		}
		$scope.isSubmitted = true;

		$http.post('/v1/postcards', $scope.postcard, {
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



});
