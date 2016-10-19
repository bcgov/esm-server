'use strict';

angular.module('documents').config(['$stateProvider', 'FEATURES', function ($stateProvider, FEATURES) {
	if ('true' === FEATURES.enableDocuments) {
		$stateProvider
			.state('p.documents', {
				url: '/documents',
				templateUrl: 'modules/documents/client/views/documents.html',
				data: { },
				controller: function($scope, project) {
					$scope.project = project;
				}
			});
	}
}]);

