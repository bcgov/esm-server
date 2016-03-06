'use strict';

angular.module('templates').config(['$stateProvider', function ($stateProvider) {

	$stateProvider
	.state('templates', {
		url: '/templates',
		template: '<tmpl-template-list></tmpl-template-list>',
		data: {
			roles: ['admin', 'user']
		}
	});

}]);

