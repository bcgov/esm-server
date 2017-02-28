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
	return directive;
}

var agencyMap = {
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
	AuthorizationsModel.forProject(projectCode, agencyCode).then(function (data) {
		$scope.list = data;
	});
}
