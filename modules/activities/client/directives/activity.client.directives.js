'use strict';

angular.module('activity')
	.directive('tmplActivity', directiveActivity);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Activity
//
// -----------------------------------------------------------------------------------
directiveActivity.$inject = [];
/* @ngInject */
function directiveActivity() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/activities/client/views/activity.html',
		controller: 'controllerActivity',
		controllerAs: 'actBase'
	};
	return directive;
}
