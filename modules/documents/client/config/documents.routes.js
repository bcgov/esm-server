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
		resolve: {
			documents: function(Document, project) {
				return Document.getProjectDocuments(project._id, 'false');
			}
		},
		controller: function($scope, project, documents) {
			$scope.project = project;
			$scope.documents = documents;
		}

	});

}]);

