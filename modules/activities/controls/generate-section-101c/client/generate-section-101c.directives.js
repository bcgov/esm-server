'use strict';

angular.module('control')
	.directive('tmplGenerateSection101C',  directiveControlGenerateSection101c);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Control, Generate Section 101c
//
// -----------------------------------------------------------------------------------
directiveControlGenerateSection101c.$inject = [];
/* @ngInject */
function directiveControlGenerateSection101c() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/activities/controls/generate-section-101c/client/generate-section-101c.html',
		controller: 'controllerControlGenerateSection101c',
		controllerAs: 'ctrlSection101c',
		scope: {
			project: '='
		}
	};
	return directive;
}
