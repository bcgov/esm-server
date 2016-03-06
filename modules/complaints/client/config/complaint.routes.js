'use strict';

angular.module('complaints').config(['$stateProvider', function ($stateProvider) {

	$stateProvider
	.state('complaints', {
		url: '/complaints/project/:project',
		template: '<tmpl-complaint-list></tmpl-complaint-list>',
		data: {
			roles: ['admin', 'user']
		}
	});

}]);

