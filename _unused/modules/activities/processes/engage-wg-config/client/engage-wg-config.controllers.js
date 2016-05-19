'use strict';

angular.module('process')
	.controller('controllerProcessEngageWGConfig', controllerProcessEngageWGConfig);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Process for Engage WG Configuration
//
// -----------------------------------------------------------------------------------
controllerProcessEngageWGConfig.$inject = ['$scope'];
//
function controllerProcessEngageWGConfig($scope) {
	var processEngageWGConfig = this;

	$scope.$watch('project', function(newValue) {
		if (newValue) {
			processEngageWGConfig.project = newValue;
			// WGCommentPeriodModel.getNewForProject(newValue._id).then( function(data) {
			// 	processEngageWGConfig.config = data;
			// 	console.log('config', data);
			// });
		}
	});

	$scope.$watch('activity', function(newValue) {
		if (newValue) {
			processEngageWGConfig.activity = newValue;
			// console.log('act', newValue);
		}
	});



}
