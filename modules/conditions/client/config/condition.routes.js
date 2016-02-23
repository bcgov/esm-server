'use strict';

angular.module('condition').config(['$stateProvider', function ($stateProvider) {

	$stateProvider
	.state('conditions', {
		abstract: true,
		url: '/conditions',
		template: '<ui-view>'
	})
	.state('conditions.list', {
		url: '',
		templateUrl: 'modules/conditions/client/views/list-conditions.view.html'
	})
	.state('conditions.create', {
		url: '/create',
		templateUrl: 'modules/conditions/client/views/create-condition.view.html'
	})
	.state('conditions.view', {
		url: '/:conditionId',
		templateUrl: 'modules/conditions/client/views/view-condition.view.html'
	})
	.state('conditions.edit', {
		url: '/:conditionId/edit',
		templateUrl: 'modules/conditions/client/views/edit-condition.view.html'
	});

}]);

