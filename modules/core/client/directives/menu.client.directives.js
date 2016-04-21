'use strict';

angular.module('core')
	.directive('tmplSystemMenu', directiveSystemMenu);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Activity Listing
//
// -----------------------------------------------------------------------------------
directiveSystemMenu.$inject = ['$window'];
/* @ngInject */
function directiveSystemMenu($window) {
	var directive = {
		restrict: 'E',
		replace: true,
		templateUrl: 'modules/core/client/views/menu.client.view.html',
		controller: 'controllerSystemMenu',
		controllerAs: 'menu',
		scope: {
			menuContext: '=',
			project: '='
		},
		link: function(scope, element, attrs) {
			angular.element($window).bind("scroll", function() {
				if (this.pageYOffset > 67) {
					//angular.element(element).css({'position': 'fixed', 'top': '10px'});
				} else {
					//angular.element(element).css({'position': 'relative', 'top': ''});
				}
			});
		}

		
	};
	return directive;
}