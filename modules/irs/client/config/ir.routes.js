'use strict';

angular.module('irs').config(['$stateProvider', function ($stateProvider) {

	$stateProvider
	.state('irs', {
		url: '/irs/project/:project',
		template: '<tmpl-ir-list></tmpl-ir-list>',
		data: {
			roles: ['admin', 'user']
		}
	});

}]);

