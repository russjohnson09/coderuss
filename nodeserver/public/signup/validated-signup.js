// create angular app
var validationApp = angular.module('validationApp', []);

// http://stackoverflow.com/questions/12419619/whats-the-difference-between-ng-model-and-ng-bind
// create angular controller
validationApp.controller('mainController', function($scope) {

	$scope.user = {
		email: '',
		password: '',
	};
	
	console.log($scope.user);


	// function to submit the form after all validation has occurred			
	$scope.submitForm = function() {

		// check to make sure the form is completely valid
		if ($scope.userForm.$valid) {
			console.log($scope.user);
			// alert('our form is amazing');
		}

	};

});
