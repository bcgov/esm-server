'use strict';

angular.module('core')
	.controller('controllerSystemMenu', controllerSystemMenu);
	
// -----------------------------------------------------------------------------------
//
// Controller menu
//
// -----------------------------------------------------------------------------------
controllerSystemMenu.$inject = ['$scope', '$state', 'Authentication', 'Menus'];
/* @ngInject */
function controllerSystemMenu($scope, $state, Authentication, Menus) {
	var menu = this;

	// Expose view variables
	menu.$state = $state;
   	menu.authentication = Authentication;

   	$scope.$watch('menuContext', function(newValue) {
		if(newValue) {
		   	menu.context = newValue;		
		}
   	});

	// Get the topbar menu
	menu.systemMenu = Menus.getMenu('systemMenu');
	menu.projectsMenu = Menus.getMenu('projectsMenu');
	menu.projectMenu = Menus.getMenu('projectMenu');
}
