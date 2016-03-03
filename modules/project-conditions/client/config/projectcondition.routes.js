'use strict';

angular.module('projectconditions').config(['$stateProvider', function ($stateProvider) {

	$stateProvider
	.state('projectconditions', {
		url: '/projectconditions',
		template: '<tmpl-project-projectcondition-list></tmpl-project-projectcondition-list>',
		data: {
			roles: ['admin', 'user']
		}
	});

}]);

