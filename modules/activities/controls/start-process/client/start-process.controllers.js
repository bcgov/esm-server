'use strict';

angular.module('control')
	.controller('controllerprocessestartProcess', controllerprocessestartProcess);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Process for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerprocessestartProcess.$inject = ['$scope', '$rootScope'];
	//
function controllerprocessestartProcess($scope, $rootScope) {
	var processestartProcess = this;

	processestartProcess.data = {
		startTime: null
	};

	processestartProcess.startProcess = function() {
		processestartProcess.data.startTime = Date();
		processestartProcess.task.status = 'Complete';
		$rootScope.$broadcast('resolveItem', {item: processestartProcess.itemId});			
	};

	// get the task identifier.  (ID + Process Type)
	$scope.$watch('anchor', function(newValue) {
		if (newValue) {
			processestartProcess.anchor = newValue;
		}
	});

	// get the spec item
	$scope.$watch('task', function(newValue) {
		// get item for title
		if (newValue) {
			processestartProcess.taskId = newValue._id;
			processestartProcess.task = newValue;
		}
	});
}
