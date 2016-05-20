'use strict';

angular.module('control')
	.controller('controllerControlFederalSubstitutionDecision', controllerControlFederalSubstitutionDecision);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Control for Federal Substitution Decision
//
// -----------------------------------------------------------------------------------
controllerControlFederalSubstitutionDecision.$inject = ['$scope', '$rootScope'];
//
function controllerControlFederalSubstitutionDecision($scope, $rootScope) {
	var ctrlFedDec = this;

	$scope.$watch('project', function(newValue) {
		if (newValue) {
			ctrlFedDec.project = newValue;
		}
	});

}    
