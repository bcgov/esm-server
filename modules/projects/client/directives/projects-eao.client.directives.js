'use strict';

angular.module('projects')
	// EAO
	.directive('tmplEaoProjects', directiveEAOProjects);	

// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Staff Projects Main List
//
// -----------------------------------------------------------------------------------
directiveEAOProjects.$inject = [];
/* @ngInject */
function directiveEAOProjects() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/projects/client/views/projects-eao.html',
		controller: 'controllerEAOProjects',
		controllerAs: 'vm'
	};
	return directive;
}
