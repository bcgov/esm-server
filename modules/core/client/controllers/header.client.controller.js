'use strict';

angular.module('core')
	.controller('controllerHeader', controllerHeader);
	
// -----------------------------------------------------------------------------------
//
// Controller Header
//
// -----------------------------------------------------------------------------------
controllerHeader.$inject = ['$scope', '$state', 'Authentication', 'Menus'];
/* @ngInject */
function controllerHeader($scope, $state, Authentication, Menus) {
	var header = this;

    // Expose view variables
	header.$state = $state;
    header.authentication = Authentication;

    // Get the topbar menu
    header.menu = Menus.getMenu('topbar');
}
