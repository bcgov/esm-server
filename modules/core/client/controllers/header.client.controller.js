'use strict';

angular.module('core')
	.controller('controllerHeader', controllerHeader);

// -----------------------------------------------------------------------------------
//
// Controller Header
//
// -----------------------------------------------------------------------------------
controllerHeader.$inject = ['$scope', '$state', 'Authentication', 'Menus', '$rootScope', '_', 'LOGO'];
/* @ngInject */
function controllerHeader($scope, $state, Authentication, Menus, $rootScope, _, LOGO) {
	var header = this;
	header.logo = LOGO;
	header.authentication = Authentication;

	header.isAdmin = (Authentication.user && Authentication.user.roles.indexOf ('admin') !== -1);
	if ($scope.project) {
		header.isEAO = (Authentication.user && (!!~Authentication.user.roles.indexOf ($scope.project.code+':eao:member') || !!~Authentication.user.roles.indexOf ('admin')));
	}
	header.isProjectAdmin = false;
	header.isProponentAdmin = false;

	header.toggleSideMenu = function() {

		$scope.showSideMenu = !$scope.showSideMenu;

		var main = angular.element( document.querySelector( '#main-content-section' ) );
		var side = angular.element( document.querySelector( '#main-side-section' ) );
		var foot = angular.element( document.querySelector( '#main-foot-content' ) );

		main.toggleClass('col-sm-12 col-sm-10');
		foot.toggleClass('col-sm-12 col-sm-10');
		side.toggleClass('col-sm-2 col-0');
	};

	$scope.$watch('headerContext', function(newValue) {
		if(newValue) {
			console.log ('header.context = >' + newValue + '<');
			header.context = newValue;
		}
	});

	$scope.$watch('project', function(newValue) {
		if (newValue) {
			header.project = newValue;
			header.isProjectAdmin = (Authentication.user && Authentication.user.roles.indexOf (header.project.adminRole) !== -1);
			header.isProponentAdmin = (Authentication.user && Authentication.user.roles.indexOf (header.project.proponentAdminRole) !== -1);
		}
	});

	header.pageAnchors = function(id) {
		// get all links in the container.
		if (!id) {
			return;
		}
			console.log("foo");

		var showParent = false;
		var links = document.querySelectorAll ('#' + id + ' a');
		_.each(links, function(link) {
			if (header.showMenu( angular.element(link).attr('href') )) {
				// just need one to show the parent.
				showParent = true;
				angular.element(link).removeClass('ng-hide');
			} else {
				angular.element(link).addClass('ng-hide');
			}
		});
		return showParent;
	};

	header.systemMenu   = Menus.getMenu ('systemMenu');
}
