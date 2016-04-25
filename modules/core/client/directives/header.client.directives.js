'use strict';

angular.module('core')
	.directive('tmplHeader', directiveHeader);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Activity Listing
//
// -----------------------------------------------------------------------------------
directiveHeader.$inject = [];
/* @ngInject */
function directiveHeader() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/core/client/views/header.client.view.html',
		controller: 'controllerHeader',
		controllerAs: 'header',
		scope: {
			headerContext: '=',
			project: '='
		},
	};
	return directive;
}
