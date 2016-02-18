'use strict';

angular.module('core').config(configFunction);

configFunction.$inject = ['$locationProvider', '$stateProvider', '$urlRouterProvider'];

/* @ngInject */
function configFunction($locationProvider, $stateProvider, $urlRouterProvider) {

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
	.state('projects', {
		url: '/',
		template: '<tmpl-projects></tmpl-projects>'
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
	// -----------------------------------------------------------------------------------
	//
	// ROUTES: Public
	//
	// -----------------------------------------------------------------------------------
	// .state('public', {
	// 	url: '/public',
	// 	abstract: true,
	// 	template: '<div ui-view></div>'
	// })
	// .state('public.projects', {
	// 	url: '/projects',
	// 	template: '<tmpl-public-projects></tmpl-public-projects>'
	// })
	// .state('public.project', {
	// 	url: '/project/:id',
	// 	template: '<tmpl-public-project></tmpl-public-project>'
	// })
	// -----------------------------------------------------------------------------------
	//
	// ROUTES: Proponent
	//
	// -----------------------------------------------------------------------------------
	// .state('proponent', {
	// 	url: '/proponent',
	// 	abstract: true,
	// 	template: '<div ui-view></div>',
	// 	data: {
	// 		roles: ['admin']
	// 	}
	// })
	// .state('proponent.projects', {
	// 	url: '/projects',
	// 	template: '<tmpl-eao-projects></tmpl-eao-projects>'
	// })
	// .state('proponent.project', {
	// 	url: '/project/:id',
	// 	template: '<tmpl-eao-project></tmpl-eao-project>'
	// })
	// .state('proponent.newproject', {
	// 	url: '/newproject/',
	// 	template: '<tmpl-eao-project-new></tmpl-eao-project-new>'
	// })
	// .state('proponent.register', {
	// 	url: '/register/',
	// 	template: '<tmpl-proponent-register></tmpl-proponent-register>'
	// })
	// .state('proponent.activity', {
	// 	url: '/activity/:id',
	// 	template: '<tmpl-proponent-activity></tmpl-proponent-activity>'
	// })
	// -----------------------------------------------------------------------------------
	//
	// ROUTES: Proponent
	//
	// -----------------------------------------------------------------------------------
	// .state('eao', {
	// 	url: '/eao',
	// 	abstract: true,
	// 	template: '<div ui-view></div>',
	// 	data: {
	// 		roles: ['admin', 'user']
	// 	}
	// })
	// .state('eao.projects', {
	// 	url: '/projects',
	// 	template: '<tmpl-eao-projects></tmpl-eao-projects>',
	// 	data: {
	// 		roles: ['admin', 'user']
	// 	}
	// })
	.state('project', {
		url: '/project/:id',
		template: '<tmpl-project></tmpl-project>'
	})
	.state('activity', {
		url: '/project/:project/activity/:activity',
		template: '<tmpl-activity></tmpl-activity>',
		data: {
			roles: ['admin', 'user']
		}
	})
	.state('activities', {
		url: '/activities',
		template: '<tmpl-user-activities></tmpl-user-activities>',
		data: {
			roles: ['admin', 'user']
		}
	});





	// Home state routing
	$stateProvider
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
	});

}











