'use strict';

angular.module('control')
	.controller('controllerControlGenerateSection101c', controllerControlGenerateSection101c);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Control for Section 101c Data Confirmation
//
// -----------------------------------------------------------------------------------
controllerControlGenerateSection101c.$inject = ['$scope', '$rootScope'];
	//
function controllerControlGenerateSection101c($scope, $rootScope) {
	var ctrlSection101c = this;

	$scope.$watch('project', function(newValue) {
		if (newValue) {
			ctrlSection101c.project = newValue;
		}
	});

}    
