'use strict';

angular.module('control')
	.controller('controllerControlFederalSubstitutionRequest', controllerControlFederalSubstitutionRequest);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Control for Federal Substitution Request
//
// -----------------------------------------------------------------------------------
controllerControlFederalSubstitutionRequest.$inject = ['$scope', '$rootScope'];
	//
function controllerControlFederalSubstitutionRequest($scope, $rootScope) {
	var ctrlFedReq = this;

	$scope.$watch('project', function(newValue) {
		if (newValue) {
			ctrlFedReq.project = newValue;
		}
	});

}    
