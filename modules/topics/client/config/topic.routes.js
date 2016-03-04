'use strict';

angular.module('topics').config(['$stateProvider', function ($stateProvider) {

	$stateProvider
	.state('topics', {
		url: '/topics',
		template: '<tmpl-topic-list></tmpl-topic-list>',
		data: {
			roles: ['admin', 'user']
		}
	});

}]);

