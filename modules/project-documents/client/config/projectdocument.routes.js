'use strict';

angular.module('projectdocuments').config(['$stateProvider', function ($stateProvider) {

	$stateProvider
	.state('projectdocuments', {
		url: '/projectdocuments',
		template: '<tmpl-project-document-list></tmpl-project-document-list>',
		data: {
			roles: ['admin', 'user']
		}
	});

}]);

