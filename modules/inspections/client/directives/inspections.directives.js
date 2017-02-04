/**
 * Created by bryangilbert on 2017/02/02.
 * All rights reserved © Copyright 2016 - MemSharp Technologies Inc.
 */
"use strict";

// angular.module('inspections',[]);


angular.module('inspections')
	.controller('controllerComplianceBrowser', controllerComplianceBrowser)
	.directive('tmplProjectCompliance', directiveProjectComplianceOversight);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE:  Project Compliance Oversight
//
// -----------------------------------------------------------------------------------
directiveProjectComplianceOversight.$inject = [];
/* @ngInject */
function directiveProjectComplianceOversight() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/inspections/client/views/project-inspections.html',
		scope: {
		},
		controller: controllerComplianceBrowser,
		controllerAs: 'complianceList'
	};
	return directive;
}


controllerComplianceBrowser.$inject = ['$scope', 'InspectionsModel'];
/* @ngInject */
function controllerComplianceBrowser($scope, InspectionsModel) {
	var complianceList = this;
	console.log("BG controllerComplianceBrowser");
	InspectionsModel.forProject('brucejack').then(function (data) {
		console.log("BG have data from collection", data);
		complianceList.data = data;
	});
}
