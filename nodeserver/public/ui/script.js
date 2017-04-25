// script.js

// create the module and name it scotchApp
// also include ngRoute for all our routing needs
var scotchApp = angular.module('scotchApp', ['ngRoute']);


//http://stackoverflow.com/questions/16677528/location-switching-between-html5-and-hashbang-mode-link-rewriting
// scotchApp.config(['$locationProvider', function($locationProvider) {
//     $locationProvider.html5Mode({
//         enabled: true,
//         requireBase: false,
//     }).hashPrefix('!');
//     // $locationProvider.hashPrefix('');
// }]);

// app.controller('mainController', function($rootScope, $scope, $location, $http) {

// configure our routes
scotchApp.config(function($routeProvider) {
    console.log($routeProvider);
    $routeProvider

    // route for the home page
        .when('/', {
        templateUrl: 'pages/home.html',
        controller: 'mainController'
    })

    // route for the about page
    .when('/about', {
        templateUrl: 'pages/about.html',
        controller: 'aboutController'
    })

    // route for the contact page
    .when('/contact', {
        templateUrl: 'pages/contact.html',
        controller: 'contactController'
    })

    .when('/todos', {
        templateUrl: 'pages/todos.html',
        controller: 'todosController'
    }) 
    .when('/bootstrap', {
        templateUrl: 'pages/bootstrap.html',
        controller: 'todosController'
    }) 

    .otherwise({
        templateUrl: 'pages/404.html'
    }); // Render 404 view

});

scotchApp.controller('todosController', function($rootScope, $scope, $location, $http) {
    console.log($location);
    console.log($location.search());
});

// create the controller and inject Angular's $scope
scotchApp.controller('mainController', function($scope) {
    // create a message to display in our view
    $scope.message = 'Everyone come and see how good I look!';
});

scotchApp.controller('aboutController', function($scope) {
    $scope.message = 'Look! I am an about page.';
});

scotchApp.controller('contactController', function($scope) {
    $scope.message = 'Contact us! JK. This is just a demo.';
});
