'use strict';

angular.module('conditions').config(['$stateProvider', function ($stateProvider) {

	$stateProvider
	.state('conditions', {
		url: '/conditions',
		template: '<tmpl-condition-list></tmpl-condition-list>',
		data: {
			roles: ['admin', 'user']
		}
	});

}]);

