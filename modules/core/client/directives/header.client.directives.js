'use strict';

angular.module('core')
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Activity Listing
//
// -----------------------------------------------------------------------------------
.directive ('tmplHeader', function () {
	return {
		restrict    : 'E',
		templateUrl : 'modules/core/client/views/header.client.view.html',
		controller  : function ($scope, LOGO, Authentication, Menus, _, ENV, Application) {
			//console.log ('Application =',Application);
			$scope.logo               = LOGO;
			$scope.application        = Application;
			$scope.authentication     = Authentication;
			$scope.ENV                = ENV;
			$scope.systemMenu         = Menus.getMenu ('systemMenu');
			// -------------------------------------------------------------------------
			//
			// literally toggle the side menu
			//
			// -------------------------------------------------------------------------
			$scope.toggleSideMenu = function() {

				$scope.showSideMenu = !$scope.showSideMenu;

				var main = angular.element( document.querySelector( '#main-content-section' ) );
				var side = angular.element( document.querySelector( '#main-side-section' ) );
				var foot = angular.element( document.querySelector( '#main-foot-content' ) );

				main.toggleClass('col-sm-12 col-sm-10');
				foot.toggleClass('col-sm-12 col-sm-10');
				side.toggleClass('col-sm-2 col-0');
			};

			//
			// CC: not needed with permissions
			//
			// $scope.isAdmin = (Authentication.user && Authentication.user.roles.indexOf ('admin') !== -1);
			// if ($scope.project) {
			// 	$scope.isEAO = (Authentication.user && (!!~Authentication.user.roles.indexOf ($scope.project.code+':eao:member') || !!~Authentication.user.roles.indexOf ('admin')));
			// }
			// $scope.isProjectAdmin = false;
			// $scope.isProponentAdmin = false;

			// -------------------------------------------------------------------------
			//
			// really do need to watch here as this directive sits above ui-router resolves
			//
			// -------------------------------------------------------------------------
			$scope.$watch('project', function(newValue) {
				if (newValue) {
					//console.log ('header.project = >' + newValue.code + '<');
					$scope.project = newValue;
					//
					// CC: not needed with permissions
					//
					// $scope.isProjectAdmin = (Authentication.user && Authentication.user.roles.indexOf ($scope.project.adminRole) !== -1);
					// $scope.isProponentAdmin = (Authentication.user && Authentication.user.roles.indexOf ($scope.project.proponentAdminRole) !== -1);
				}
			});

			// -------------------------------------------------------------------------
			//
			// not sure if these are still used, or even the side menu with them
			//
			// -------------------------------------------------------------------------
			// $scope.pageAnchors = function(id) {
			// 	// get all links in the container.
			// 	if (!id) {
			// 		return;
			// 	}
			// 	var showParent = false;
			// 	var links = document.querySelectorAll ('#' + id + ' a');
			// 	_.each(links, function(link) {
			// 		if ($scope.showMenu( angular.element(link).attr('href') )) {
			// 			// just need one to show the parent.
			// 			showParent = true;
			// 			angular.element(link).removeClass('ng-hide');
			// 		} else {
			// 			angular.element(link).addClass('ng-hide');
			// 		}
			// 	});
			// 	return showParent;
			// };

		}
	};
});
