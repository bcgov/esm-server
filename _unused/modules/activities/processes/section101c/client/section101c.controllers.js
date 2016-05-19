'use strict';

angular.module('process')
	.controller('controllerProcessSection101c', controllerProcessSection101c);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Process for Section 101c
//
// -----------------------------------------------------------------------------------
controllerProcessSection101c.$inject = ['$scope'];
//
function controllerProcessSection101c($scope) {
	var processSection101c = this;

	$scope.$watch('project', function(newValue) {
		if (newValue) {
			processSection101c.project = newValue;
		}
	});
	
}
