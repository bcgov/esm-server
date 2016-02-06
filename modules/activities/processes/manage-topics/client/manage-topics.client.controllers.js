'use strict';

angular.module('process')
	.controller('controllerProcessTopics', controllerProcessTopics);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Process for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerProcessTopics.$inject = ['$scope', '$rootScope', 'Process', '$q', 'ProcessCodes', 'sConfiguration', 'Project', '_'];
	//
function controllerProcessTopics($scope, $rootScope, Process, $q, ProcessCodes, sConfiguration, Project, _) {

	var taskTopics = this;

	sConfiguration.getBaseConfigItem('bucket').then( function(res) {
		taskTopics.allBuckets = res.data;
	});

	// watch project
	$scope.$watch('project', function(newValue) {
		if (newValue) {
			taskTopics.project = newValue;
			// make a copy so changes aren't bound to the underlying screens.
			taskTopics.selectedBuckets = angular.copy(newValue.buckets);
		}
	});


	$scope.$watch('anchor', function(newValue) {
		if (newValue) {
			taskTopics.taskAnchor = newValue;
		}
	});


	$scope.$watch('task', function(newValue) {
		// get item for title
		if (newValue) {
			taskTopics.taskId = newValue._id;
			taskTopics.task = newValue;
			// get task data or blank if no record exists.
			// Process.getProcessData({'code':newValue.code, 'id':newValue._id}).then( function(res) {
			// 	taskTopics.taskData = res.data;
			// });
		}
	});


	taskTopics.saveProcess = function() {
		// structure the data to save.
		//ValueComponents.saveProcess();
		console.log('save ValueComponents.controllers.js');
	};

	
	// add callback from adding the new components.
	taskTopics.saveNewBuckets = function(newBuckets) {
        var i = newBuckets.length;
        _.each( newBuckets, function(bucket) {
            i--;
            if( !_.some( taskTopics.project.buckets, {'_id': bucket._id}) ) {
                Project.addBucketToProject(taskTopics.project._id, bucket._id).then( function(res) {
                    taskTopics.project.buckets.push(bucket);
                });
            }
        });
	};



	// taskNotification.completeProcess = function() {
	// 	// validate
	// 	// when ok, broadcast
	// 	taskTopics.item.value = 'Complete';
	// 	$rootScope.$broadcast('resolveItem', {item: taskTopics.itemId});
	// }
	
}    
