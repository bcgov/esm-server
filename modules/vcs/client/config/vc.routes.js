'use strict';

angular.module('vcs').config(['$stateProvider', function ($stateProvider) {

	$stateProvider
	.state('vcs', {
		url: '/vcs/project/:project',
		template: '<tmpl-vc-list></tmpl-vc-list>',
		data: {
			roles: ['admin', 'user']
		}
	});

}]);

