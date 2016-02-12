'use strict';

angular.module('core')
	.directive('tmplSystemMenu', directiveSystemMenu)
	.directive('scroll', directiveScroll);
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
			menuContext: '@',
			project: '='
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Show logo on scroll
//
// -----------------------------------------------------------------------------------
directiveScroll.$inject = ['$window', '$rootScope'];
/* @ngInject */
function directiveScroll($window, $rootScope) {
	var directive = function(scope, element, attrs) {
		angular.element($window).bind("scroll", function() {
			if (this.pageYOffset >= 100) {
				$rootScope.showLogo = true;
			} else {
				$rootScope.showLogo = false;
			}
		});
	};
	return directive;
}
