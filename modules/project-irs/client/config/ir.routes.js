'use strict';
// =========================================================================
//
// inspection report routes
//
// =========================================================================
angular.module('irs').config(['$stateProvider', 'RELEASE', function ($stateProvider, RELEASE) {
	if (RELEASE.enableInspectionReports) {
		$stateProvider
		// -------------------------------------------------------------------------
		//
		// this is the abstract, top level view for inspection reports (irs).
		// since it is a child of p (project), the project injection has already
		// been resolved and is available to subsequent child states as 'project'
		// here we will resolve the list of irs for this project,
		// which will also become available to child states as 'irs'
		//
		// -------------------------------------------------------------------------
		.state('p.ir', {
			abstract:true,
			url: '/ir',
			template: '<ui-view></ui-view>',
			resolve: {
				irs: function ($stateParams, ArtifactModel, project) {
					return ArtifactModel.forProjectGetType(project._id, "inspection-report");
				},
			}
		})
		// -------------------------------------------------------------------------
		//
		// the list state for irs and project are guaranteed to
		// already be resolved
		//
		// -------------------------------------------------------------------------
		.state('p.ir.list', {
			url: '/list',
			templateUrl: 'modules/project-irs/client/views/ir-list.html',
			controller: function ($scope, NgTableParams, irs, project) {
				$scope.tableParams = new NgTableParams ({count:10}, {dataset: irs});
				$scope.project = project;
			}
		})
		// -------------------------------------------------------------------------
		//
		// this is the add, or create state. it is defined before the others so that
		// it does not conflict
		//
		// -------------------------------------------------------------------------
		.state('p.ir.create', {
			url: '/create',
			template: '<p></p>',
			controller: function ($state, project, ArtifactModel) {
				ArtifactModel.newFromType("inspection-report", project._id)
				.then (function (a) {
					// console.log ('artifact = ', a);
					$state.go ('p.artifact.edit', {artifactId:a._id});
				});
			}
		});
	}
}]);
