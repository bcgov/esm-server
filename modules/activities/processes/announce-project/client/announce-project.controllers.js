'use strict';

angular.module('process')
	.controller('controllerProcessAnnounceProject', controllerProcessAnnounceProject);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Process for Announce Project
//
// -----------------------------------------------------------------------------------
controllerProcessAnnounceProject.$inject = ['$scope'];
//
function controllerProcessAnnounceProject($scope) {
	var processAnnounceProject = this;

	$scope.$watch('project', function(newValue) {
		if (newValue) {
			processAnnounceProject.project = newValue;
		}
	});	
}
