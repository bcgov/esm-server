'use strict';

angular.module('control')
	.directive('tmplFederalDecision', directiveControlFederalDecision);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Control, Federal Substitution Decision
//
// -----------------------------------------------------------------------------------
directiveControlFederalDecision.$inject = [];
/* @ngInject */
function directiveControlFederalDecision() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/activities/controls/federal-decision/client/fed-dec.html',
		controller: 'controllerControlFederalDecision',
		controllerAs: 'ctrlFedDec',
		scope: {
			project: '='
		}
	};
	return directive;
}
