'use strict';

angular.module('projects').config (
	['$locationProvider', '$stateProvider', '$urlRouterProvider', '_',
	function ($locationProvider, $stateProvider, $urlRouterProvider, _) {
		$stateProvider
		// Landing Page (Home)
		.state('home', {
			url: '/',
			templateUrl: 'modules/home/client/views/home.html',
			data: {},
			controller: function ($cookies, $scope) {
				console.log("Loading...");
				$scope.seenOnce = $cookies.get('seenOnce');
				if (!$scope.seenOnce) {
					// console.log("Haven't seen you before.");
					var now = new Date();
					$cookies.put('seenOnce', true, {expires: new Date(now.getFullYear()+1, now.getMonth(), now.getDate())});
				} else {
					// console.log("Welcome back.");
				}
				console.log("Done.");
			}
		});
	}]);
