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
		controller  : function ($scope, LOGO, Authentication, Menus, _, ENV, Application, ADMIN_FEATURES) {
			//console.log ('Application =',Application);
			$scope.logo 			= LOGO;
			$scope.application 		= Application;
			$scope.authentication 	= Authentication;
			$scope.ENV				= ENV;
			$scope.ADMIN_FEATURES	= ADMIN_FEATURES;
			$scope.systemMenu		= Menus.getMenu ('systemMenu');

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
		}
	};
});
