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
	var processFedSub = this;
	
	$scope.$watch('project', function(newValue) {
		if (newValue) {
			processFedSub.project = newValue;
		}
	});
}