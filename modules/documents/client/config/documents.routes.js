'use strict';

angular.module('documents').config(['$stateProvider', function ($stateProvider) {

	$stateProvider
	.state('p.docs', {
		url: '/docs',
		templateUrl: 'modules/documents/client/views/docs.html',
		data: { },
		resolve: { },
		controller: function($scope, project) {
			$scope.project = project;
			// Used to start the documentUI in a specific folder location.
			$scope.opendir = window.location.search;
		}
	});

}]);

