'use strict';

angular.module('search')
	.controller('controllerModalSearchInstructions', controllerModalSearchInstructions)
;

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: View Instructions for Search Page
//
// -----------------------------------------------------------------------------------
controllerModalSearchInstructions.$inject = ['$modalInstance'];
/* @ngInject */
function controllerModalSearchInstructions($modalInstance) {
	var modal = this;

	modal.continue = function () {
		$modalInstance.dismiss('cancel');
	};
}
