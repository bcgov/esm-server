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
				return ProjectConditionModel.getConditionsForProject (project._id);
			},
		},
        onEnter: function (MenuControl, project) {
            MenuControl.routeAccess (project.code, 'eao','edit-conditions');
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
		controller: function ($scope, NgTableParams, conditions, project) {
			$scope.tableParams = new NgTableParams ({count:10}, {dataset: conditions});
			$scope.project = project;
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
		controller: function ($scope, $state, project, condition, ProjectConditionModel) {
			$scope.condition = condition;
			$scope.project = project;
			$scope.save = function () {
				ProjectConditionModel.add ($scope.condition)
				.then (function (model) {
					$state.transitionTo('p.projectcondition.list', {project:project._id}, {
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
				// console.log ('editing conditionId = ', $stateParams.conditionId);
				return ProjectConditionModel.getModel ($stateParams.conditionId);
			}
		},
		controller: function ($scope, $state, condition, project, ProjectConditionModel) {
			// console.log ('condition = ', condition);
			$scope.condition = condition;
			$scope.project = project;
			$scope.save = function () {
				ProjectConditionModel.save ($scope.condition)
				.then (function (model) {
					// console.log ('condition was saved',model);
					// console.log ('now going to reload state');
					$state.transitionTo('p.projectcondition.list', {project:project._id}, {
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
		controller: function ($scope, condition, project) {
			// console.log ('condition = ', condition);
			$scope.condition = condition;
			$scope.project = project;
		}
	})

	;

}]);
