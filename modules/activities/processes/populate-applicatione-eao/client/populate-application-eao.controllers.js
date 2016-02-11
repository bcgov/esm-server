'use strict';

angular.module('process')
	.controller('controllerProcessPopulateApplicationEAO', controllerProcessPopulateApplicationEAO);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Process for Populate Application WG
//
// -----------------------------------------------------------------------------------
controllerProcessPopulateApplicationEAO.$inject = ['$scope'];
//
function controllerProcessPopulateApplicationEAO($scope) {
	var processPopulateApplicationEAO = this;

	$scope.$watch('project', function(newValue) {
		if (newValue) {
			processPopulateApplicationEAO.project = newValue;
		}
	});	
}
