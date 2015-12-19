'use strict';

angular.module('projects')
	// Public
	.directive('tmplPublicProjects', directivePublicProjects);

// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Public Projects Main
//
// -----------------------------------------------------------------------------------
directivePublicProjects.$inject = [];
/* @ngInject */
function directivePublicProjects() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/projects/client/views/projects-public.html',
		controller: 'controllerPublicProjects',
		controllerAs: 'vm'
	};
	return directive;
}
