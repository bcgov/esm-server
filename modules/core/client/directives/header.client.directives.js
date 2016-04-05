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
		controller: function($scope, LOGO, Authentication) {
			$scope.logo = LOGO;
			$scope.authentication = Authentication;
			$scope.toggleSideMenu = function() {
				
				$scope.showSideMenu = !$scope.showSideMenu;

				var main = angular.element( document.querySelector( '#main-content-section' ) );
				var side = angular.element( document.querySelector( '#main-side-section' ) );
				var foot = angular.element( document.querySelector( '#main-foot-content' ) );
				
				main.toggleClass('col-sm-12 col-sm-10');
				foot.toggleClass('col-sm-12 col-sm-10');
				side.toggleClass('col-sm-2 ng-hide');				
				
			};
		}
	};
	return directive;
}
