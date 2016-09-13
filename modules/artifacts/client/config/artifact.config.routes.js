'use strict';
// =========================================================================
//
// artifact configuration routes (under admin)
//
// =========================================================================
angular.module('core').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
	// -------------------------------------------------------------------------
	//
	// this is the abstract, top level view for artifacts.
	// we resolve artifacts to all sub-states
	//
	// -------------------------------------------------------------------------
	.state('admin.artifact', {
		data: { },
		abstract:true,
		url: '/artifact',
		template: '<ui-view></ui-view>',
		resolve: {
			artifactTypes: function (ArtifactTypeModel) {
				return ArtifactTypeModel.getCollection ();
			},
			templates: function (TemplateModel) {
				return TemplateModel.getCollection ();
			},
			phases: function (PhaseBaseModel) {
				return PhaseBaseModel.getCollection ();
			},
			milestones: function (MilestoneBaseModel) {
				return MilestoneBaseModel.getCollection ();
			},
			activities: function (ActivityBaseModel) {
				return ActivityBaseModel.getCollection ();
			},
		}
	})
	// -------------------------------------------------------------------------
	//
	// the list state for artifacts. artifacts are guaranteed to
	// already be resolved
	//
	// -------------------------------------------------------------------------
	.state('admin.artifact.list', {
		url: '/list',
		templateUrl: 'modules/artifacts/client/views/config/artifact-list.html',
		controller: function ($scope, NgTableParams, artifactTypes) {
			$scope.tableParams = new NgTableParams ({count:10}, {dataset: artifactTypes});
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the add, or create state. it is defined before the others so that
	// it does not conflict
	//
	// -------------------------------------------------------------------------
	.state('admin.artifact.create', {
		url: '/create',
		templateUrl: 'modules/artifacts/client/views/config/artifact-edit.html',
		resolve: {
			artifact: function (ArtifactTypeModel) {
				return ArtifactTypeModel.getNew ();
			}
		},
		controller: function ($scope, $state, artifact, ArtifactTypeModel, TopicModel, pillars, projecttypes, stages, codeFromTitle) {
			// console.log ('add artifact = ', artifact);
			$scope.artifact = artifact;
			// console.log ('artifact = ', artifact);
			$scope.sectors = projecttypes;
			$scope.pillars = pillars;
			$scope.stages  = stages;
			var which = 'add';
			$scope.save = function (isValid) {
				if (!isValid) {
					$scope.$broadcast('show-errors-check-validity', 'conditionForm');
					return false;
				}
				$scope.artifact.code = codeFromTitle ($scope.artifact.name);
				var p = (which === 'add') ? ArtifactTypeModel.add ($scope.artifact) : ArtifactTypeModel.save ($scope.artifact);
				p.then (function (model) {
					$state.transitionTo('admin.artifact.list', {}, {
			  			reload: true, inherit: false, notify: true
					});
				})
				.catch (function (err) {
					console.error (err);
					// alert (err.message);
				});
			};
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the edit state
	//
	// -------------------------------------------------------------------------
	.state('admin.artifact.edit', {
		url: '/:artifactId/edit',
		templateUrl: 'modules/artifacts/client/views/config/artifact-edit.html',
		resolve: {
			artifact: function ($stateParams, ArtifactTypeModel) {
				return ArtifactTypeModel.getModel ($stateParams.artifactId);
			}
		},
		controller: function ($scope, $state, artifact, ArtifactTypeModel, TopicModel, pillars, projecttypes, stages, codeFromTitle) {
			// console.log ('edit artifact = ', artifact);
			$scope.artifact = artifact;
			// console.log ('artifact = ', artifact);
			$scope.sectors = projecttypes;
			$scope.pillars = pillars;
			$scope.stages  = stages;
			// console.log ('stages:', $scope.stages);
			// console.log ('artifact.stage:',artifact.stages);
			// console.log ($scope.pillars);

			var which = 'edit';
			$scope.save = function (isValid) {
				if (!isValid) {
					$scope.$broadcast('show-errors-check-validity', 'conditionForm');
					return false;
				}
				$scope.artifact.code = codeFromTitle ($scope.artifact.name);
				var p = (which === 'add') ? ArtifactTypeModel.add ($scope.artifact) : ArtifactTypeModel.save ($scope.artifact);
				p.then (function (model) {
					$state.transitionTo('admin.artifact.list', {}, {
			  			reload: true, inherit: false, notify: true
					});
				})
				.catch (function (err) {
					console.error (err);
					// alert (err.message);
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
	.state('admin.artifact.detail', {
		url: '/:artifactId',
		templateUrl: 'modules/artifacts/client/views/config/artifact-view.html',
		resolve: {
			artifact: function ($stateParams, ArtifactTypeModel) {
				return ArtifactTypeModel.getModel ($stateParams.artifactId);
			}
		},
		controller: function ($scope, artifact, pillars, projecttypes, stages) {
			$scope.artifact = artifact;
			$scope.sectors = projecttypes;
			$scope.pillars = pillars;
			$scope.stages  = stages;
		}
	})

	;

}]);


