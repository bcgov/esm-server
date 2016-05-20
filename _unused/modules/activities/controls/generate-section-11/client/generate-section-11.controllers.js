'use strict';

angular.module('control')
	.controller('controllerControlGenerateSection11', controllerControlGenerateSection11);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Process for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerControlGenerateSection11.$inject = ['$scope', '$rootScope'];
	//
function controllerControlGenerateSection11($scope, $rootScope) {
	var ctrlSection11 = this;

	$scope.$watch('project', function(newValue) {
		if (newValue) {
			ctrlSection11.project = newValue;
		}
	});
	
}    
