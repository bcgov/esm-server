'use strict';

angular.module('control')
	.controller('controllerProcessDecision', controllerProcessDecision);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Process for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerProcessDecision.$inject = ['$scope', '$rootScope', 'moment'];
	//
function controllerProcessDecision($scope, $rootScope, moment) {
	var taskDecision = this;

	taskDecision.data = {
		dateDecided: null,
		result: null
	};

	taskDecision.completeProcess = function() {
		taskDecision.data.dateDecided = moment();
		$rootScope.$broadcast('resolveProcess', taskDecision.task);			
	};

	// get the task identifier.  (ID + Process Type)
	$scope.$watch('anchor', function(newValue) {
		if (newValue) {
			taskDecision.anchor = newValue;
		}
	});

	// get the spec item
	$scope.$watch('task', function(newValue) {
		// get item for title
		if (newValue) {
			taskDecision.taskId = newValue._id;
			taskDecision.task = newValue;
		}
	});
}    
