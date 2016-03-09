'use strict';

angular.module('core')
	.controller('controllerSystemMenu', controllerSystemMenu);

// -----------------------------------------------------------------------------------
//
// Controller menu
//
// -----------------------------------------------------------------------------------
controllerSystemMenu.$inject = ['$scope', '$state', 'Authentication', 'Menus', '$rootScope'];
/* @ngInject */
function controllerSystemMenu($scope, $state, Authentication, Menus, $rootScope) {
	var menu = this;

	// Expose view variables
	menu.$state = $state;
   	menu.authentication = Authentication;

   	menu.isAdmin = (Authentication.user && Authentication.user.roles.indexOf ('admin') !== -1);
   	menu.isProjectAdmin = false;
   	menu.isProponentAdmin = false;

   	menu.goToPrevious = function() {
		$state.go($state.previous.state.name, $state.previous.params);
   	};

   	$scope.$watch('menuContext', function(newValue) {
		if(newValue) {
			console.log ('menu.context = >' + newValue + '<');
		   	menu.context = newValue;
		}
   	});

   	$scope.$watch('project', function(newValue) {
   		if (newValue) {
			menu.project = newValue;
		   	menu.isProjectAdmin = (Authentication.user && Authentication.user.roles.indexOf (menu.project.adminRole) !== -1);
		   	menu.isProponentAdmin = (Authentication.user && Authentication.user.roles.indexOf (menu.project.proponentAdminRole) !== -1);
   		}
   	});


   	menu.showMenu = function(id) {
   		if (id) {
	   		return (angular.element(document.querySelector('#' + id)).length > 0);
	   	} else {
	   		return false;
	   	}
   	};

	// Get the topbar menu
	menu.systemMenu = Menus.getMenu('systemMenu');
	menu.projectsMenu = Menus.getMenu('projectsMenu');
	menu.projectMenu = Menus.getMenu('projectMenu');
}
