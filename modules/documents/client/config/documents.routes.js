'use strict';

angular.module('documents').config(['$stateProvider', function ($stateProvider) {

	$stateProvider
	.state('p.documents', {
		url: '/documents',
		templateUrl: 'modules/documents/client/views/documents.html',
		data: { },
		controller: function($scope, project) {
			$scope.project = project;
		}

	})
	.state('p.docs', {
		url: '/docs',
		templateUrl: 'modules/documents/client/views/docs.html',
		data: { },
		resolve: { },
		controller: function($scope, project) {
			$scope.project = project;
		}
	});

}]);

