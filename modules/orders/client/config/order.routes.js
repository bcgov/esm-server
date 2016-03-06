'use strict';

angular.module('orders').config(['$stateProvider', function ($stateProvider) {

	$stateProvider
	.state('orders', {
		url: '/orders/project/:project',
		template: '<tmpl-order-list></tmpl-order-list>',
		data: {
			roles: ['admin', 'user']
		}
	});

}]);

