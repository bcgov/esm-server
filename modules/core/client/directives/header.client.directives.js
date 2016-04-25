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
		controller: function($scope, LOGO, Authentication, Menus, _) {
			$scope.logo = LOGO;
			$scope.authentication = Authentication;
			$scope.toggleSideMenu = function() {

				$scope.showSideMenu = !$scope.showSideMenu;

				var main = angular.element( document.querySelector( '#main-content-section' ) );
				var side = angular.element( document.querySelector( '#main-side-section' ) );
				var foot = angular.element( document.querySelector( '#main-foot-content' ) );

				main.toggleClass('col-sm-12 col-sm-10');
				foot.toggleClass('col-sm-12 col-sm-10');
				side.toggleClass('col-sm-2 col-0');
			};

			$scope.isAdmin = (Authentication.user && Authentication.user.roles.indexOf ('admin') !== -1);
			if ($scope.project) {
				$scope.isEAO = (Authentication.user && (!!~Authentication.user.roles.indexOf ($scope.project.code+':eao:member') || !!~Authentication.user.roles.indexOf ('admin')));
			}
			$scope.isProjectAdmin = false;
			$scope.isProponentAdmin = false;

			$scope.$watch('project', function(newValue) {
				if (newValue) {
					$scope.project = newValue;
					$scope.isProjectAdmin = (Authentication.user && Authentication.user.roles.indexOf ($scope.project.adminRole) !== -1);
					$scope.isProponentAdmin = (Authentication.user && Authentication.user.roles.indexOf ($scope.project.proponentAdminRole) !== -1);
				}
			});

			$scope.pageAnchors = function(id) {
				// get all links in the container.
				if (!id) {
					return;
				}
				var showParent = false;
				var links = document.querySelectorAll ('#' + id + ' a');
				_.each(links, function(link) {
					if ($scope.showMenu( angular.element(link).attr('href') )) {
						// just need one to show the parent.
						showParent = true;
						angular.element(link).removeClass('ng-hide');
					} else {
						angular.element(link).addClass('ng-hide');
					}
				});
				return showParent;
			};

			$scope.systemMenu   = Menus.getMenu ('systemMenu');
		}
	};
	return directive;
}
