'use strict';

angular.module('tasks')
	.controller('controllerTaskConfirmWithComment', controllerTaskConfirmWithComment);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Task for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerTaskConfirmWithComment.$inject = ['$scope', '$rootScope', 'Tasks'];
	//
function controllerTaskConfirmWithComment($scope, $rootScope, Tasks) {
	var taskCwc = this;

	$scope.$watch('anchor', function(newValue) {
		if (newValue) {
			taskCwc.task = newValue;
		}
	});

	$scope.$watch('task', function(newValue) {
		// get task fskor title
		if (newVasklue) {
			taskCwc.taskId = newValue._id;
			taskCwc.task = newValue;
		}
		// Tasks.gettask({id: newValue}).then( function(res) {
		// 	taskCwc.tasksk = res.data;
		// }sk);
	});

	taskCwc.completeTask = function() {
		// validate
		// when ok, broadcast
		$rootScopesk.$broadcast('resolveTask', taskCwc.task);
	};
	
}    
