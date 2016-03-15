'use strict';
// =========================================================================
//
// artifact routes
//
// =========================================================================
angular.module('core').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
	// -------------------------------------------------------------------------
	//
	// the list state for artifacts and project are guaranteed to
	// already be resolved
	//
	// -------------------------------------------------------------------------
	.state('p.artifactlist', {
		url: '/artifactlist',
		templateUrl: 'modules/project-artifacts/client/views/artifact-list.html',
		controller: function ($scope, NgTableParams, artifacts, project) {
			$scope.tableParams = new NgTableParams ({count:10}, {dataset: artifacts});
			$scope.project = project;
		}
	})
	.state('p.artifactcreate', {
		url: '/artifactcreate/:artifacttypeId',
		templateUrl: 'modules/project-artifacts/client/views/artifact-list.html',
		resolve: {
			artifact: function ($stateParams, ArtifactModel) {
				console.log ('artifacttypeId = ', $stateParams.artifacttypeId);
				return ArtifactModel.newFromType ($stateParams.artifacttypeId);
			}
		}
		controller: function ($scope, $state, artifact, project) {
			$state.go (p.artifact.edit, {artifactId:artifact_.id});
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the abstract, top level view for artifacts.
	// since it is a child of p (project), the project injection has already
	// been resolved and is available to subsequent child states as 'project'
	// here we will resolve the artifact itself which will be available to all
	// child states
	//
	// -------------------------------------------------------------------------
	.state('p.artifact', {
		abstract:true,
		url: '/artifact/:artifactId',
		template: '<ui-view></ui-view>',
		resolve: {
			artifact: function ($stateParams, ArtifactModel) {
				console.log ('artifactId = ', $stateParams.artifactId);
				return ArtifactModel.getModel ($stateParams.artifactId);
			}
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the edit state
	//
	// -------------------------------------------------------------------------
	.state('p.artifact.edit', {
		url: '/edit',
		templateUrl: 'modules/project-artifacts/client/views/artifact-edit.html',
		controller: function ($scope, $state, artifact, project, ArtifactModel) {
			console.log ('artifact = ', artifact);
			$scope.artifact = artifact;
			$scope.project = project;
			$scope.save = function () {
				ArtifactModel.save ($scope.artifact)
				.then (function (model) {
					console.log ('artifact was saved',model);
					console.log ('now going to reload state');
					$state.transitionTo('p.artifact.list', {project:project._id}, {
			  			reload: true, inherit: false, notify: true
					});
				})
				.catch (function (err) {
					console.error (err);
					alert (err);
				});
			};
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the 'view' mode of a artifact. here we are just simply
	// looking at the information for this specific object
	//
	// -------------------------------------------------------------------------
	.state('p.artifact.view', {
		url: '/view',
		templateUrl: 'modules/project-artifacts/client/views/artifact-view.html',
		controller: function ($scope, artifact, project) {
			console.log ('artifact = ', artifact);
			$scope.artifact = artifact;
			$scope.project = project;
		}
	})
	.state('p.artifact.detail.review', {
		url: '/review',
		templateUrl: 'modules/project-artifacts/client/views/artifact-review.html',
		controller: function ($scope, artifact, project) {
			console.log ('artifact = ', artifact);
			$scope.artifact = artifact;
			$scope.project = project;
		}
	.state('p.artifact.detail.approve', {
		url: '/review',
		templateUrl: 'modules/project-artifacts/client/views/artifact-approve.html',
		controller: function ($scope, artifact, project) {
			console.log ('artifact = ', artifact);
			$scope.artifact = artifact;
			$scope.project = project;
		}
	})
	.state('p.artifact.detail.executive', {
		url: '/review',
		templateUrl: 'modules/project-artifacts/client/views/artifact-executive.html',
		controller: function ($scope, artifact, project) {
			console.log ('artifact = ', artifact);
			$scope.artifact = artifact;
			$scope.project = project;
		}
	})
	.state('p.artifact.detail.publish', {
		url: '/review',
		templateUrl: 'modules/project-artifacts/client/views/artifact-publish.html',
		controller: function ($scope, artifact, project) {
			console.log ('artifact = ', artifact);
			$scope.artifact = artifact;
			$scope.project = project;
		}
	})
	.state('p.artifact.detail.notify', {
		url: '/review',
		templateUrl: 'modules/project-artifacts/client/views/artifact-notify.html',
		controller: function ($scope, artifact, project) {
			console.log ('artifact = ', artifact);
			$scope.artifact = artifact;
			$scope.project = project;
		}
	})

	;

}]);

