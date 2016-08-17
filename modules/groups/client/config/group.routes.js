'use strict';

angular.module('core').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
		.state('p.group', {
			abstract: true,
			url: '/group',
			template: '<ui-view></ui-view>',
			resolve: {}
		});
}]);
