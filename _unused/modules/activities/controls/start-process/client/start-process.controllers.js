'use strict';

angular.module('control')
	.controller('controllerControlSetVisibility', controllerControlSetVisibility);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Control for set visibility
//
// -----------------------------------------------------------------------------------
controllerControlSetVisibility.$inject = ['$scope', '$rootScope'];
	//
function controllerControlSetVisibility($scope, $rootScope) {
	var ctrlSetVis = this;

	$scope.$watch( 'project', function(newValue) {
		if (newValue) {
			ctrlSetVis.project = newValue; 	
		}
	});
}
