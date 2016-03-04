'use strict';

angular.module('features').config(['$stateProvider', function ($stateProvider) {

	$stateProvider
	.state('features', {
		url: '/features',
		template: '<tmpl-feature-list></tmpl-feature-list>',
		data: {
			roles: ['admin', 'user']
		}
	})
	.state('projectfeatures', {
		url: '/features/project/:project',
		template: '<tmpl-feature-list></tmpl-feature-list>',
		data: {
			roles: ['admin', 'user']
		}
	})
	;


}]);

