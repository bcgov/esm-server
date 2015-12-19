'use strict';

angular.module('tasks')
	.controller('controllerTaskDecision', controllerTaskDecision);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Task for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerTaskDecision.$inject = ['$scope', '$rootScope', 'moment'];
	//
function controllerTaskDecision($scope, $rootScope, moment) {
	var taskDecision = this;

	taskDecision.data = {
		dateDecided: null,
		result: null
	};

	taskDecision.completeTask = function() {
		taskDecision.data.dateDecided = moment();
		$rootScope.$broadcast('resolveTask', taskDecision.task);			
	};

	// get the task identifier.  (ID + Task Type)
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
