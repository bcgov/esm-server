'use strict';

angular.module('core')
	.directive('tmplFooter', directiveFooter);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Footer
//
// -----------------------------------------------------------------------------------
directiveFooter.$inject = [];
/* @ngInject */
function directiveFooter() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/core/client/views/footer.client.view.html',
		controller: 'controllerFooter',
		controllerAs: 'footer'
	};
	return directive;
}
