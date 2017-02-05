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
			project: "=project"
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
	var project = $scope.project;
	var code = project.code;
	console.log("BG projectInspectionController ", code);
	InspectionsModel.forProject(code).then(function (data) {
		console.log("BG have data from collection", data);
		complianceList.data = data;
	});
}
