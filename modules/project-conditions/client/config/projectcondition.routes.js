'use strict';
// =========================================================================
//
// project condition routes
//
// =========================================================================
angular.module('projectconditions').config(['$stateProvider', function ($stateProvider) {
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
			projecttypes: function (PROJECT_TYPES) {
				return PROJECT_TYPES.map (function (e) {
					return {id:e,title:e};
				});
			},
			stages: function (CE_STAGES) {
				return CE_STAGES.map (function (e) {
					return {id:e,title:e};
				});
			}
		},
        onEnter: function (MenuControl, project) {
					MenuControl.routeAccessBuilder (undefined, project.code, '*', ['eao:admin', 'eao:member', 'responsible-epd','project-admin', 'project-lead','project-team','project-intake', 'assistant-dm', 'associate-dm', 'qa-officer', 'ce-lead', 'ce-officer']);
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
		controller: function ($scope, NgTableParams, conditions, project, pillars, projecttypes, stages) {
			$scope.ptypes = projecttypes;
			$scope.stypes = stages;
			$scope.pillars = pillars;
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
		controller: function ($scope, $state, project, condition, ProjectConditionModel, TopicModel, pillars, projecttypes, stages, codeFromTitle) {
			condition.project = project._id;
			$scope.condition = condition;
			$scope.project = project;
			$scope.sectors = projecttypes;
			$scope.pillars = pillars;
			$scope.stages  = stages;
			$scope.save = function (isValid) {
				if (!isValid) {
					$scope.$broadcast('show-errors-check-validity', 'conditionForm');
					return false;
				}
				$scope.condition.code = codeFromTitle ($scope.condition.name);
				ProjectConditionModel.add ($scope.condition)
				.then (function (model) {
					$state.transitionTo('p.projectcondition.list', {projectid:project.code}, {
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
		controller: function ($scope, $state, condition, project, ProjectConditionModel, TopicModel, pillars, projecttypes, stages, codeFromTitle) {
			$scope.condition = condition;
			$scope.project = project;
			$scope.sectors = projecttypes;
			$scope.pillars = pillars;
			$scope.stages  = stages;
			$scope.save = function (isValid) {
				if (!isValid) {
					$scope.$broadcast('show-errors-check-validity', 'conditionForm');
					return false;
				}
				$scope.condition.code = codeFromTitle ($scope.condition.name);
				ProjectConditionModel.save ($scope.condition)
				.then (function (model) {
					$state.transitionTo('p.projectcondition.list', {projectid:project.code}, {
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
		controller: function ($scope, condition, project, pillars, projecttypes, stages) {
			$scope.sectors = projecttypes;
			$scope.pillars = pillars;
			$scope.stages  = stages;
			$scope.condition = condition;
			$scope.project = project;
		}
	})

	;

}]);
