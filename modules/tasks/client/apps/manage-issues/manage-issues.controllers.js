'use strict';

angular.module('tasks')
	.controller('controllerTaskManageIssues', controllerTaskManageIssues);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Task for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerTaskManageIssues.$inject = ['$scope', '$rootScope', 'Task'];
	//
function controllerTaskManageIssues($scope, $rootScope, Task) {
	var taskManageIssues = this;

	taskManageIssues.mailOut = [];

	// watch projoect
	$scope.$watch('project', function(newValue) {
		if (newValue) {
			taskManageIssues.project = newValue;
		}
	});

	$scope.$watch('anchor', function(newValue) {
		if (newValue) {
			taskManageIssues.taskAnchor = newValue;
		}
	});

	$scope.$watch('task', function(newValue) {
		// get item for title
		if (newValue) {
			taskManageIssues.taskId = newValue._id;
			taskManageIssues.task = newValue;
			// get task data or blank if no record exists.
			// Task.getTaskData({'code':newValue.code, 'id':newValue._id}).then( function(res) {
			// 	taskManageIssues.taskData = res.data;
			// });
		}
	});

	taskManageIssues.saveTask = function() {
		// structure the data to save.
		//Notifications.saveTask();
		console.log('save notifications.controllers.js');
	};

	// taskNotification.completeTask = function() {
	// 	// validate
	// 	// when ok, broadcast
	// 	taskManageIssues.item.value = 'Complete';
	// 	$rootScope.$broadcast('resolveItem', {item: taskManageIssues.itemId});
	// }
	
}    