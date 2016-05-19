'use strict';

angular.module('control')
	.directive('tmplFederalRequest',  directiveControlFederalRequest);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Control, Federal Substitution Request
//
// -----------------------------------------------------------------------------------
directiveControlFederalRequest.$inject = [];
/* @ngInject */
function directiveControlFederalRequest() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/activities/controls/federal-request/client/fed-req.html',
		controller: 'controllerControlFederalRequest',
		controllerAs: 'ctrlFedReq',
		scope: {
			project: '='
		}
	};
	return directive;
}
