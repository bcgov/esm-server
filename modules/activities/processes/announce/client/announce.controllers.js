'use strict';

angular.module('process')
	.controller('controllerProcessAnnounce', controllerProcessAnnounce);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Process for Announcing a Project
//
// -----------------------------------------------------------------------------------
controllerProcessAnnounce.$inject = ['$scope'];
//
function controllerProcessAnnounce($scope) {
	var processAnnounce = this;
	
	$scope.$watch('project', function(newValue) {
		if (newValue) {
			processAnnounce.project = newValue;
		}
	});
}
	
