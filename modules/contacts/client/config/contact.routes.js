'use strict';

angular.module('contacts').config(['$stateProvider', function ($stateProvider) {

	$stateProvider
	.state('contacts', {
		url: '/contacts',
		template: '<tmpl-contact-list></tmpl-contact-list>',
		data: {
			roles: ['admin', 'user']
		}
	});

}]);

