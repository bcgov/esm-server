'use strict';

angular.module('core')
	.directive('tmplSystemMenu', directiveSystemMenu);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Activity Listing
//
// -----------------------------------------------------------------------------------
directiveSystemMenu.$inject = [];
/* @ngInject */
function directiveSystemMenu() {
	var directive = {
		restrict: 'E',
		replace: true,
		templateUrl: 'modules/core/client/views/menu.client.view.html',
		controller: 'controllerSystemMenu',
		controllerAs: 'menu',
		scope: {
			menuContext: '@'
		}
	};
	return directive;
}
