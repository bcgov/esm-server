'use strict';

angular.module('projectdescriptions').config(['$stateProvider', function ($stateProvider) {

	$stateProvider
	.state('projectdescriptions', {
		url: '/projectdescriptions',
		template: '<tmpl-project-description-list></tmpl-project-description-list>',
		data: {
			roles: ['admin', 'user']
		}
	});

}]);

