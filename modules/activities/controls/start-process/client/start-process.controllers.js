'use strict';

angular.module('control')
	.controller('controllerprocesseStartProcess', controllerProcesseStartProcess);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Process for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerProcesseStartProcess.$inject = ['$scope', '$rootScope'];
	//
function controllerProcesseStartProcess($scope, $rootScope) {
	var processeStartProcess = this;

	processeStartProcess.data = {
		startTime: null
	};

	processeStartProcess.startProcess = function() {
		processeStartProcess.data.startTime = Date();
		processeStartProcess.task.status = 'Complete';
		$rootScope.$broadcast('resolveItem', {item: processeStartProcess.itemId});			
	};

	// get the task identifier.  (ID + Process Type)
	$scope.$watch('anchor', function(newValue) {
		if (newValue) {
			processeStartProcess.anchor = newValue;
		}
	});

	// get the spec item
	$scope.$watch('task', function(newValue) {
		// get item for title
		if (newValue) {
			processeStartProcess.taskId = newValue._id;
			processeStartProcess.task = newValue;
		}
	});
}
