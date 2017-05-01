'use strict';

angular.module('documents').config(['$stateProvider', function ($stateProvider) {

	$stateProvider
	.state('p.docs', {
		url: '/docs?file&folder',
		templateUrl: 'modules/documents/client/views/docs.html',
		data: { },
		resolve: { },
		controller: function($scope, project, $stateParams) {
			$scope.project = project;
			// Used to start the documentUI in a specific folder or file location.
			$scope.file = $stateParams.file;
			$scope.folder = $stateParams.folder;
		}
	});

}]);

