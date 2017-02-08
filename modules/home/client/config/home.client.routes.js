'use strict';

angular.module('projects').config (
	['$locationProvider', '$stateProvider', '$urlRouterProvider', '_',
	function ($locationProvider, $stateProvider, $urlRouterProvider, _) {
		$stateProvider
		// Landing Page (Home)
		.state('home', {
			url: '/',
			templateUrl: 'modules/home/client/views/home.html',
			data: {
				roles: ['admin']
			}
		});
	}]);
