'use strict';

angular.module('projectdocuments').config(['$stateProvider', function ($stateProvider) {

	$stateProvider
	.state('projectdocuments', {
		url: '/projectdocuments/project/:project',
		template: '<tmpl-projectdocument-list></tmpl-projectdocument-list>',
		data: {
			roles: ['admin', 'user']
		}
	});

}]);

