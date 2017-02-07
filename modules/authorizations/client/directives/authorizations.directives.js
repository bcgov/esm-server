"use strict";

angular.module('authorizations')
	.controller('projectAuthorizationController', projectAuthorizationController)
	.directive('tmplProjectAuthorizations', directiveProjectAuthorizationOversight);

directiveProjectAuthorizationOversight.$inject = [];
/* @ngInject */
function directiveProjectAuthorizationOversight() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/authorizations/client/views/project-authorizations.html',
		scope: {
			project: "=project",
			agencyCode: "@agency"
		},
		controller: projectAuthorizationController,
		controllerAs: 'auth'
	};
	console.log("BG authorizations directive", directive);
	return directive;
}

const agencyMap = {
	'ENV': {name: 'Ministry of Environment', act: "Environmental Management Act"},
	'MEM': {name: 'Ministry of Energy and Mines', act: "Mines Act"},
	'EAO': {name: "Environmental Assessment Office", act: "Environmental Assessment Act"}
};

projectAuthorizationController.$inject = ['$scope', '_', 'AuthorizationsModel'];
/* @ngInject */
function projectAuthorizationController($scope, _, AuthorizationsModel) {
	// var complianceList = this;
	var project = $scope.project;
	var projectCode = project.code;
	var agencyCode = $scope.agencyCode;
	$scope.agencyName = agencyMap[agencyCode].name;
	$scope.actName = agencyMap[agencyCode].act;
	console.log("BG projectAuthorizationController ", projectCode, agencyCode, $scope);
	AuthorizationsModel.forProject(projectCode, agencyCode).then(function (data) {
		console.log("BG have data from collection", data);
		// complianceList.data = data;
		$scope.list = data;
	});
}
