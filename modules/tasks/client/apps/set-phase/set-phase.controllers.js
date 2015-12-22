'use strict';

angular.module('tasks')
	.controller('controllerTaskSetPhase', controllerTaskSetPhase);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Task for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerTaskSetPhase.$inject = ['$scope', '$rootScope', 'Project'];
	//
function controllerTaskSetPhase($scope, $rootScope, Project) {
	var taskSetPhase = this;

	taskSetPhase.saveTask = function() {
		Project.saveProject( taskSetPhase.project ).then( function(res) {});
	};

	//$rootScope.$broadcast('resolveTask', taskSetPhase.task);

	// get the project
	$scope.$watch('project', function(newValue) {
		if (newValue) {
			taskSetPhase.project = newValue;
		}
	});

	// get the task identifier.  (ID + Task Type)
	$scope.$watch('anchor', function(newValue) {
		if (newValue) {
			taskSetPhase.anchor = newValue;
		}
	});

	// get the spec item
	$scope.$watch('task', function(newValue) {
		// get item for title
		if (newValue) {
			taskSetPhase.taskId = newValue._id;
			taskSetPhase.task = newValue;
		}
	});
}    
