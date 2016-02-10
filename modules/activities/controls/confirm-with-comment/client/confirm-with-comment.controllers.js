'use strict';

angular.module('control')
	.controller('controllerProcessConfirmWithComment', controllerProcessConfirmWithComment);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Process for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerProcessConfirmWithComment.$inject = ['$scope', '$rootScope', 'processes'];
	//
function controllerProcessConfirmWithComment($scope, $rootScope, processes) {
	var taskCwc = this;

	$scope.$watch('anchor', function(newValue) {
		if (newValue) {
			taskCwc.task = newValue;
		}
	});

	$scope.$watch('task', function(newValue) {
		// get task fskor title
		if (newValue) {
			taskCwc.taskId = newValue._id;
			taskCwc.task = newValue;
		}
		// processes.gettask({id: newValue}).then( function(res) {
		// 	taskCwc.processesk = res.data;
		// }sk);
	});

	taskCwc.completeProcess = function() {
		// validate
		// when ok, broadcast
		$rootScope.$broadcast('resolveProcess', taskCwc.task);
	};
	
}    
