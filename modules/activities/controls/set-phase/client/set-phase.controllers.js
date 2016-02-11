'use strict';

angular.module('control')
	.controller('controllerProcessSetPhase', controllerProcessSetPhase);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Process for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerProcessSetPhase.$inject = ['$scope', '$rootScope', 'Project'];
	//
function controllerProcessSetPhase($scope, $rootScope, Project) {
	var processSetPhase = this;

	processSetPhase.saveProcess = function() {
		processSetPhase.project.currentPhase = processSetPhase.newPhase._id;
		Project.saveProject( processSetPhase.project ).then( function(res) {});
	};

	//$rootScope.$broadcast('resolveProcess', processSetPhase.task);

	// get the project
	$scope.$watch('project', function(newValue) {
		if (newValue) {
			processSetPhase.project = newValue;
			processSetPhase.newPhase = angular.copy(newValue.currentPhase);
		}
	});

	// get the task identifier.  (ID + Process Type)
	$scope.$watch('anchor', function(newValue) {
		if (newValue) {
			processSetPhase.anchor = newValue;
		}
	});

	// get the spec item
	$scope.$watch('task', function(newValue) {
		// get item for title
		if (newValue) {
			processSetPhase.taskId = newValue._id;
			processSetPhase.task = newValue;
		}
	});
}    
