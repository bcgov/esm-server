'use strict';

angular.module('process')
	.controller('controllerprocessesetPhase', controllerprocessesetPhase);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Process for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerprocessesetPhase.$inject = ['$scope', '$rootScope', 'Project'];
	//
function controllerprocessesetPhase($scope, $rootScope, Project) {
	var processesetPhase = this;

	processesetPhase.saveProcess = function() {
		processesetPhase.project.currentPhase = processesetPhase.newPhase._id;
		Project.saveProject( processesetPhase.project ).then( function(res) {});
	};

	//$rootScope.$broadcast('resolveProcess', processesetPhase.task);

	// get the project
	$scope.$watch('project', function(newValue) {
		if (newValue) {
			processesetPhase.project = newValue;
			processesetPhase.newPhase = angular.copy(newValue.currentPhase);
		}
	});

	// get the task identifier.  (ID + Process Type)
	$scope.$watch('anchor', function(newValue) {
		if (newValue) {
			processesetPhase.anchor = newValue;
		}
	});

	// get the spec item
	$scope.$watch('task', function(newValue) {
		// get item for title
		if (newValue) {
			processesetPhase.taskId = newValue._id;
			processesetPhase.task = newValue;
		}
	});
}    
