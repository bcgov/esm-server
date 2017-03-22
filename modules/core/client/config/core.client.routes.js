'use strict';

angular.module('core').config (
	['$locationProvider', '$stateProvider', '$urlRouterProvider', '_',
	function ($locationProvider, $stateProvider, $urlRouterProvider, _) {

	$locationProvider.html5Mode(true);

	// Redirect to 404 when route not found
	$urlRouterProvider.otherwise(function ($injector, $location) {
		$injector.get('$state').transitionTo('not-found', null, {
			location: false
		});
	});

	$stateProvider
	// Authorizations
	.state('authorizations', {
		url: '/authorizations',
		templateUrl: 'modules/authorizations/client/views/authorizations.html',
		data: {}
	})

	// Compliance Oversight
	.state('compliance-oversight', {
		url: '/compliance-oversight',
		templateUrl: 'modules/compliance-oversight/client/views/compliance-oversight.html',
		data: {}
	})

	// Legislation
	.state('legislation', {
		url: '/legislation',
		templateUrl: 'modules/legislation/client/views/legislation.html',
		data: {}
	})

	// Mining Lifecycle
	.state('mining-lifecycle', {
		url: '/lifecycle',
		templateUrl: 'modules/lifecycle/client/views/mining-lifecycle.html',
		data: {}
	})

	// Topics
	.state('topics', {
		url: '/topics-of-interest',
		templateUrl: 'modules/topics/client/views/topics-of-interest.html',
		data: {}
	})
	.state('reclamation', {
		url: '/reclamation',
		templateUrl: 'modules/topics/client/views/reclamation.html',
		data: {}
	})
	.state('tailings-management', {
		url: '/tailings-management',
		templateUrl: 'modules/topics/client/views/tailings-management.html',
		data: {}
	})
	.state('water-quality', {
		url: '/water-quality',
		templateUrl: 'modules/topics/client/views/water-quality.html',
		data: {}
	})
	
	.state('configuration', {
		url: '/configuration',
		template: '<tmpl-configuration></tmpl-configuration>',
		data: {}
	})
	.state('login', {
		url: '/login',
		template: '<tmpl-login></tmpl-login>',
		data: {}
	})
	.state('register', {
		url: '/register',
		template: '<tmpl-register></tmpl-register>',
		data: {}
	})
	.state('recover', {
		url: '/recover',
		template: '<tmpl-recover></tmpl-recover>',
		data: {}
	})

	// Home state routing
	.state('not-found', {
		url: '/not-found',
		templateUrl: 'modules/core/client/views/404.client.view.html',
		data: {
			ignoreState: true
		}
	})
	.state('bad-request', {
		url: '/bad-request',
		templateUrl: 'modules/core/client/views/400.client.view.html',
		data: {
			ignoreState: true
		}
	})
	.state('forbidden', {
		url: '/forbidden',
		templateUrl: 'modules/core/client/views/403.client.view.html',
		data: {
			ignoreState: true
		}
	})
	.state('smerr', {
		url: '/smerr',
		reloadOnSearch: false,
		templateUrl: 'modules/core/client/views/smerr.view.html',
		controller: function($scope, $location, _) {
			$scope.userType = ($location.search().t || 'unknown').toLowerCase();
			// combine this with reloadOnSearch = false to strip off the query string now that we have the value we need.
			$location.url($location.path());
		}
	})
	.state('prototype-load-error', {
		url: '/error/prototype',
		reloadOnSearch: false,
		templateUrl: 'modules/core/client/views/prototype.load.error.html',
		controller: function($scope, $location, _) {
		}
	});
}]);











