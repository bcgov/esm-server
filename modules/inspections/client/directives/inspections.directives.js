"use strict";

angular.module('inspections')
	.controller('projectInspectionController', projectInspectionController)
	.directive('tmplProjectCompliance', directiveProjectComplianceOversight);

directiveProjectComplianceOversight.$inject = [];
/* @ngInject */
function directiveProjectComplianceOversight() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/inspections/client/views/project-inspections.html',
		scope: {
		},
		controller: projectInspectionController,
		controllerAs: 'complianceList'
	};
	return directive;
}

projectInspectionController.$inject = ['$scope', 'InspectionsModel'];
/* @ngInject */
function projectInspectionController($scope, InspectionsModel) {
	var complianceList = this;
	console.log("BG projectInspectionController");
	InspectionsModel.forProject('Brucejack').then(function (data) {
		console.log("BG have data from collection", data);
		complianceList.data = data;
	});
}
