'use strict';

angular.module('descriptions').config(['$stateProvider', function ($stateProvider) {

	$stateProvider
	.state('descriptions', {
		url: '/descriptions',
		template: '<tmpl-description-list></tmpl-description-list>',
		data: {
			roles: ['admin', 'user']
		}
	});

}]);

