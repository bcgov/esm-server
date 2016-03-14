'use strict';

angular.module('orgs').config(['$stateProvider', function ($stateProvider) {

	$stateProvider
	.state('orgs', {
		url: '/orgs/project/:project',
		template: '<tmpl-org-list></tmpl-org-list>',
		data: {
			roles: ['admin', 'user']
		}
	});

}]);

