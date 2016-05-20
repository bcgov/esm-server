'use strict';

angular.module('control')
	.controller('controllerProcessConfirmNoComment', controllerProcessConfirmNoComment);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Process for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerProcessConfirmNoComment.$inject = ['$scope', '$rootScope', 'processes'];
	//
function controllerProcessConfirmNoComment($scope, $rootScope, processes) {
	var taskCnc = this;	

	// get the task identifier.  (ID + Process Type)
	$scope.$watch('anchor', function(newValue) {
		if (newValue) {
			taskCnc.anchor = newValue;
		}
	});

	// get the spec task
	$scope.$watch('task', function(newValue) {
		// get task for title
		if (newValue) {
			taskCnc.taskId = newValue.task._id;
			taskCnc.task = newValue.task;
		}
	});

	taskCnc.completeProcess = function() {
		// validate
		// when ok, broadcast
		$rootScope.$broadcast('resolveProcess', taskCnc.task);
	};
	
}    
