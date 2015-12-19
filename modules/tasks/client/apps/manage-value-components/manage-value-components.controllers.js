'use strict';

angular.module('tasks')
	.controller('controllerTaskValueComponents', controllerTaskValueComponents);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Task for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerTaskValueComponents.$inject = ['$scope', '$rootScope', 'Task', 'Notification', '$q', 'ProcessCodes', 'Configuration', 'Project'];
	//
function controllerTaskValueComponents($scope, $rootScope, Task, Notification, $q, ProcessCodes, Configuration, Project) {

	var taskValueComponents = this;

	Configuration.getBaseConfigItem('bucket').then( function(res) {
		taskValueComponents.allBuckets = res.data;
	});

	// watch project
	$scope.$watch('project', function(newValue) {
		if (newValue) {
			taskValueComponents.project = newValue;
			// make a copy so changes aren't bound to the underlying screens.
			taskValueComponents.selectedBuckets = angular.copy(newValue.buckets);
		}
	});


	$scope.$watch('anchor', function(newValue) {
		if (newValue) {
			taskValueComponents.taskAnchor = newValue;
		}
	});


	$scope.$watch('task', function(newValue) {
		// get item for title
		if (newValue) {
			taskValueComponents.taskId = newValue._id;
			taskValueComponents.task = newValue;
			// get task data or blank if no record exists.
			// Task.getTaskData({'code':newValue.code, 'id':newValue._id}).then( function(res) {
			// 	taskValueComponents.taskData = res.data;
			// });
		}
	});


	taskValueComponents.saveTask = function() {
		// structure the data to save.
		//ValueComponents.saveTask();
		console.log('save ValueComponents.controllers.js');
	};

	
	// add callback from adding the new components.
	taskValueComponents.saveNewBuckets = function(newBuckets) {
        var i = newBuckets.length;
        _.each( newBuckets, function(bucket) {
            i--;
            if( !_.some( taskValueComponents.project.buckets, {'_id': bucket._id}) ) {
                Project.addBucketToProject(taskValueComponents.project._id, bucket._id).then( function(res) {
                    taskValueComponents.project.buckets.push(bucket);
                });
            }
        });
	};



	// taskNotification.completeTask = function() {
	// 	// validate
	// 	// when ok, broadcast
	// 	taskValueComponents.item.value = 'Complete';
	// 	$rootScope.$broadcast('resolveItem', {item: taskValueComponents.itemId});
	// }
	
}    