'use strict';

angular.module('core')
	.controller('controllerFooter', controllerFooter);
	
// -----------------------------------------------------------------------------------
//
// Controller Footer
//
// -----------------------------------------------------------------------------------
controllerFooter.$inject = ['Authentication'];
/* @ngInject */
function controllerFooter(Authentication) {
	var footer = this;
	footer.authentication = Authentication;
}
