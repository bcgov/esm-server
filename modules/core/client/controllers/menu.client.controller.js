'use strict';

angular.module('core')
	.controller('controllerSystemMenu', controllerSystemMenu);

// -----------------------------------------------------------------------------------
//
// Controller menu
//
// -----------------------------------------------------------------------------------
controllerSystemMenu.$inject = ['$scope', '$state', 'Authentication', 'Menus', '$rootScope', '_', 'ENV'];
/* @ngInject */
function controllerSystemMenu($scope, $state, Authentication, Menus, $rootScope, _, ENV) {
	var menu = this;
	$scope.ENV = ENV;

	// Expose view variables
	menu.$state = $state;
   	menu.authentication = Authentication;

   	menu.isAdmin = (Authentication.user && Authentication.user.roles.indexOf ('admin') !== -1);
   	if ($scope.project) {
   		menu.isEAO = (Authentication.user && (!!~Authentication.user.roles.indexOf ($scope.project.code+':eao:member') || !!~Authentication.user.roles.indexOf ('admin')));
   	}
   	menu.isProjectAdmin = false;
   	menu.isProponentAdmin = false;

   	menu.goToPrevious = function() {
		$state.go($state.previous.state.name, $state.previous.params);
   	};

   	$scope.$watch('menuContext', function(newValue) {
		if(newValue) {
			//console.log ('controllerSystemMenu.menuContext = >' + newValue + '<');
		   	menu.context = newValue;
		}
   	});

   	$scope.$watch('project', function(newValue) {
   		if (newValue) {
			//console.log ('controllerSystemMenu.project = >' + newValue.code + '<');
			menu.project = newValue;
		   	menu.isProjectAdmin = (Authentication.user && Authentication.user.roles.indexOf (menu.project.adminRole) !== -1);
		   	menu.isProponentAdmin = (Authentication.user && Authentication.user.roles.indexOf (menu.project.proponentAdminRole) !== -1);
   		}
   	});


	menu.pageAnchors = function(id) {
		// get all links in the container.
		if (!id) {
			return;
		}
		var showParent = false;
		var links = document.querySelectorAll ('#' + id + ' a');
		_.each(links, function(link) {
			if (menu.showMenu( angular.element(link).attr('href') )) {
				// just need one to show the parent.
				showParent = true;
				angular.element(link).removeClass('ng-hide');
			} else {
				angular.element(link).addClass('ng-hide');
			}
		});
		return showParent;
	};


   	menu.showMenu = function(id) {
   		if (id) {
	   		return (angular.element (document.querySelector (id)).length > 0);
	   	} else {
	   		return false;
	   	}
   	};

	menu.systemMenu   = Menus.getMenu ('systemMenu');
	menu.projectsMenu = Menus.getMenu ('projectsMenu');
	menu.projectTopMenu  = Menus.getMenu ('projectTopMenu');
	menu.projectMenu  = Menus.getMenu ('projectMenu');



}
