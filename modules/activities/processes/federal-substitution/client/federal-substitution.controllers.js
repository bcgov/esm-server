'use strict';

angular.module('process')
	.controller('controllerProcessFederalSub', controllerProcessFederalSub);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Process for Announcing a Project
//
// -----------------------------------------------------------------------------------
controllerProcessFederalSub.$inject = ['$scope'];
//
function controllerProcessFederalSub($scope) {
	var processFederalSub = this;
	
	$scope.$watch('project', function(newValue) {
		if (newValue) {
			processFederalSub.project = newValue;
		}
	});
}