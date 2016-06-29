'use strict';

angular.module('documents').config(['$stateProvider', function ($stateProvider) {

	$stateProvider
	.state('p.documents', {
		url: '/documents',
		templateUrl: 'modules/documents/client/views/documents.html',
		data: {
			roles: ['eao:member', 'admin', 'user', 'public']
		},
		controller: function($scope, project) {
			$scope.project = project;
		}

	});

}]);

