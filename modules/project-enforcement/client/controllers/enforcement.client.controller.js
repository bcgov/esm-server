'use strict';

angular.module ('enforcement')
	.controller('controllerEnforcementBrowser', controllerEnforcementBrowser);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: View Project Schedule
//
// -----------------------------------------------------------------------------------
controllerEnforcementBrowser.$inject = ['$scope', '_', 'ProjectModel', 'ProjectConditionModel'];
/* @ngInject */
function controllerEnforcementBrowser($scope, _, ProjectModel, ProjectConditionModel) {
	var enfBrowser = this;

	enfBrowser.inspReports = [{name: "August 2014"}, {name: "August 2015"}];
	ProjectConditionModel.forProject( $scope.project._id ).then( function(res) {
		enfBrowser.conditions = res;
	});

}