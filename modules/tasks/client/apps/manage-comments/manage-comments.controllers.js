'use strict';

angular.module('tasks')
	.controller('controllerTaskManageComments', controllerTaskManageComments);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Task for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerTaskManageComments.$inject = ['$scope', '$rootScope', 'Task', '_', 'sTaskManageComments', 'Project'];
	//
function controllerTaskManageComments($scope, $rootScope, Task, _, sTaskManageComments, Project) {

	var taskManageComments = this;

	
	// watch project
	$scope.$watch('project', function(newValue) {
		if (newValue) {
			taskManageComments.project = newValue;
			// make a copy so changes aren't bound to the underlying screens.
			sTaskManageComments.getAllPublicComments().then( function(res) {
				taskManageComments.comments = res.data;
			});
		}
	});


	$scope.$watch('anchor', function(newValue) {
		if (newValue) {
			taskManageComments.taskAnchor = newValue;
		}
	});


	$scope.$watch('task', function(newValue) {
		// get item for title
		if (newValue) {
			taskManageComments.taskId = newValue._id;
			taskManageComments.task = newValue;
			// get task data or blank if no record exists.
			// Task.getTaskData({'code':newValue.code, 'id':newValue._id}).then( function(res) {
			// 	taskManageComments.taskData = res.data;
			// });
		}
	});


	taskManageComments.saveTask = function() {
		// structure the data to save.
		//ValueComponents.saveTask();
		console.log('save ValueComponents.controllers.js');
	};

	
	// add callback from adding the new components.
	taskManageComments.saveNewBuckets = function(newBuckets) {
        var i = newBuckets.length;
        _.each( newBuckets, function(bucket) {
            i--;
            if( !_.some( taskManageComments.project.buckets, {'_id': bucket._id}) ) {
                Project.addBucketToProject(taskManageComments.project._id, bucket._id).then( function(res) {
                    taskManageComments.project.buckets.push(bucket);
                });
            }
        });
	};



	// taskNotification.completeTask = function() {
	// 	// validate
	// 	// when ok, broadcast
	// 	taskManageComments.item.value = 'Complete';
	// 	$rootScope.$broadcast('resolveItem', {item: taskManageComments.itemId});
	// }
	
}    
