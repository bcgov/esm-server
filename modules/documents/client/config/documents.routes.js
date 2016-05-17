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
		},
		onEnter: function (MenuControl, project) {
				MenuControl.routeAccessBuilder (['admin','user', 'public'], project.code, '*', ['eao:admin', 'eao:member', 'responsible-epd','project-admin', 'project-lead','project-team','project-intake', 'assistant-dm', 'associate-dm', 'pro:admin', 'pro:member', 'sub']);
		}

	});

}]);

