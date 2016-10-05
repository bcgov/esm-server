'use strict';
// =========================================================================
//
// project condition routes
//
// =========================================================================
angular.module('projectconditions').config(['$stateProvider', 'RELEASE', function ($stateProvider, RELEASE) {
	if (RELEASE.enableConditions) {
		$stateProvider
		// -------------------------------------------------------------------------
		//
		// this is the abstract, top level view for project conditions.
		// since it is a child of p (project), the project injection has already
		// been resolved and is available to subsequent child states as 'project'
		// here we will resolve the list of conditions for this project, which will
		// also become available to child states as 'conditions'
		//
		// -------------------------------------------------------------------------
		.state('p.projectcondition', {
			abstract:true,
			url: '/projectcondition',
			template: '<ui-view></ui-view>',
			data: {
			},
			resolve: {
				conditions: function ($stateParams, ProjectConditionModel, project) {
					// console.log ('projectcondition abstract resolving conditions');
					// console.log ('project id = ', project._id);
					return ProjectConditionModel.forProject (project._id);
				},
				pillars: function (PILLARS) {
					return PILLARS.map (function (e) {
						return {id:e,title:e};
					});
				},
				phases: function(PROJECT_CONDITION_PHASES) {
					return PROJECT_CONDITION_PHASES.map (function (e) {
						return {id:e,title:e};
					});
				},
				projecttypes: function (PROJECT_TYPES) {
					return PROJECT_TYPES.map (function (e) {
						return {id:e,title:e};
					});
				},
				stages: function (CE_STAGES) {
					return ['Draft', 'Certified'].map (function (e) {
						return {id:e,title:e};
					});
				}
			}
		})
		// -------------------------------------------------------------------------
		//
		// the list state for project conditions and project are guaranteed to
		// already be resolved
		//
		// -------------------------------------------------------------------------
		.state('p.projectcondition.list', {
			url: '/list',
			templateUrl: 'modules/project-conditions/client/views/projectcondition-list.html',
			controller: function ($scope, NgTableParams, conditions, project, pillars, phases, projecttypes, stages) {
				$scope.ptypes = projecttypes;
				$scope.stypes = stages;
				$scope.pillars = pillars;
				$scope.phases = phases;
				$scope.project = project;
				$scope.show_filter = false;
				$scope.tableParams = new NgTableParams ({count:10}, {dataset: conditions});
			}
		})
		// -------------------------------------------------------------------------
		//
		// this is the add, or create state. it is defined before the others so that
		// it does not conflict
		//
		// -------------------------------------------------------------------------
		.state('p.projectcondition.create', {
			url: '/create',
			templateUrl: 'modules/project-conditions/client/views/projectcondition-edit.html',
			resolve: {
				condition: function (ProjectConditionModel) {
					return ProjectConditionModel.getNew ();
				}
			},
			controller: function ($scope, $state, _, Utils, project, condition, ProjectConditionModel, TopicModel, pillars, phases, projecttypes, stages, codeFromTitle, VcModel) {
				condition.project = project._id;
				$scope.condition = condition;
				$scope.project = project;
				$scope.sectors = projecttypes;
				$scope.pillars = pillars;
				$scope.phases = phases;
				$scope.stages = stages;
				
				$scope.editLinkedVcs = function() {
					VcModel.forProject(project._id)
						.then(function (data) {
							return Utils.openEntitySelectionModal(data, 'name', condition.vcs, 'Valued Components');
						})
						.then(function(selectedVcs) {
							condition.vcs = selectedVcs;
						});
				};
				
				$scope.save = function () {
					$scope.condition.code = codeFromTitle ($scope.condition.name);
					ProjectConditionModel.add ($scope.condition)
					.then (function (model) {
						$state.transitionTo('p.projectcondition.list', {projectid:project.code}, {
							reload: true, inherit: false, notify: true
						});
					})
					.catch (function (err) {
						console.error (err);
					});
				};
			}
		})
		// -------------------------------------------------------------------------
		//
		// this is the edit state
		//
		// -------------------------------------------------------------------------
		.state('p.projectcondition.edit', {
			url: '/:conditionId/edit',
			templateUrl: 'modules/project-conditions/client/views/projectcondition-edit.html',
			resolve: {
				condition: function ($stateParams, ProjectConditionModel) {
					return ProjectConditionModel.getModel ($stateParams.conditionId);
				}
			},
			controller: function ($scope, $state, _, Utils, condition, project, ProjectConditionModel, TopicModel, pillars, phases, projecttypes, stages, codeFromTitle, VcModel) {
				$scope.condition = condition;
				$scope.project = project;
				$scope.sectors = projecttypes;
				$scope.pillars = pillars;
				$scope.phases = phases;
				$scope.stages = stages;
				
				$scope.edit = true;
				
				_.each(condition.vcs, function (item, key) {
					VcModel.lookup(item)
						.then( function (o) {
							condition.vcs[key] = o;
							$scope.$apply();
						});
				});
				
				$scope.editLinkedVcs = function() {
					VcModel.forProject(project._id)
						.then(function (data) {
							return Utils.openEntitySelectionModal(data, 'name', condition.vcs, 'Valued Components');
						})
						.then(function (selectedVcs) {
							condition.vcs = selectedVcs;
						});
				};
				
				$scope.save = function () {
					$scope.condition.code = codeFromTitle($scope.condition.name);
					ProjectConditionModel.save($scope.condition)
						.then(function (model) {
							$state.transitionTo('p.projectcondition.list', {projectid: project.code}, {
								reload: true, inherit: false, notify: true
							});
						})
						.catch(function (err) {
							console.error(err);
						});
				};
				
				$scope.delete = function () {
					ProjectConditionModel.deleteId($scope.condition._id)
						.then(function () {
							$state.go('p.projectcondition.list', {projectid:project.code}, {
								reload: true, inherit: false, notify: true
							});
						});
				};
			}
		})
		// -------------------------------------------------------------------------
		//
		// this is the 'view' mode of a project condition. here we are just simply
		// looking at the information for this specific object
		//
		// -------------------------------------------------------------------------
		.state('p.projectcondition.detail', {
			url: '/:conditionId',
			templateUrl: 'modules/project-conditions/client/views/projectcondition-view.html',
			resolve: {
				condition: function ($stateParams, ProjectConditionModel) {
					// console.log ('conditionId = ', $stateParams.conditionId);
					return ProjectConditionModel.getModel ($stateParams.conditionId);
				}
			},
			controller: function ($scope, $state, _, condition, project, ProjectConditionModel, pillars, phases, projecttypes, stages, VcModel) {
				$scope.sectors = projecttypes;
				$scope.pillars = pillars;
				$scope.phases = phases;
				$scope.stages  = stages;
				$scope.condition = condition;
				$scope.project = project;
				
				_.each(condition.vcs, function (item, key) {
					VcModel.lookup(item)
						.then( function (o) {
							condition.vcs[key] = o;
							$scope.$apply();
						});
				});
				
				$scope.publish = function() {
					ProjectConditionModel.publish($scope.condition._id)
						.then(function() {
							$state.go('p.projectcondition.list', {projectid:project.code}, {
								reload: true, inherit: false, notify: true
							});
						});
				};
				
				$scope.unpublish = function() {
					ProjectConditionModel.unpublish($scope.condition._id)
						.then(function() {
							$state.go('p.projectcondition.list', {projectid:project.code}, {
								reload: true, inherit: false, notify: true
							});
						});
				};
			}
		});
}

}]);
