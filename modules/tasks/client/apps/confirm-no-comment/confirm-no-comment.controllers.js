'use strict';

angular.module('tasks')
	.controller('controllerTaskConfirmNoComment', controllerTaskConfirmNoComment);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Task for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerTaskConfirmNoComment.$inject = ['$scope', '$rootScope', 'Tasks'];
	//
function controllerTaskConfirmNoComment($scope, $rootScope, Tasks) {
	var taskCnc = this;	

	// get the task identifier.  (ID + Task Type)
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

	taskCnc.completeTask = function() {
		// validate
		// when ok, broadcast
		$rootScope.$broadcast('resolveTask', taskCnc.task);
	}
	
}    
