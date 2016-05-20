'use strict';

angular.module('process')
	.controller('controllerProcessSection11', controllerProcessSection11);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Process for Section 11
//
// -----------------------------------------------------------------------------------
controllerProcessSection11.$inject = ['$scope'];
//
function controllerProcessSection11($scope) {
	var processSection11 = this;

	$scope.$watch('project', function(newValue) {
		if (newValue) {
			processSection11.project = newValue;
		}
	});	
}
