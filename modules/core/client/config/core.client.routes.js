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
	.state('configuration', {
		url: '/configuration',
		template: '<tmpl-configuration></tmpl-configuration>',
		data: {
			roles: ['admin']
		}
	})
	.state('login', {
		url: '/login',
		template: '<tmpl-login></tmpl-login>'
	})
	.state('register', {
		url: '/register',
		template: '<tmpl-register></tmpl-register>'
	})
	.state('recover', {
		url: '/recover',
		template: '<tmpl-recover></tmpl-recover>'
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
	;

	// $stateProvider.modalState = function (name, opts) {
	// 	var modalInstance;
	// 	$stateProvider.state (name, {
	// 		url: opts.url,
	// 		resolve: opts.resolve || {},
	// 		onEnter: function ($modal, $state) {
	// 			modalInstance = $modal.open (opts);
	// 			modalInstance.result['finally'](function () {
	// 				modalInstance = null;
	// 				if ($state.$current.name === name) $state.go ('^');
	// 			});
	// 		},
	// 		onExit: function () {
	// 			if (modalInstance) modalInstance.close ();
	// 		}
	// 	});
	// };

}]);











