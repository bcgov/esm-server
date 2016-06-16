'use strict';
// =========================================================================
//
// condition routes (under admin)
//
// =========================================================================
angular.module('conditions').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
	// -------------------------------------------------------------------------
	//
	// this is the abstract, top level view for conditions.
	// we resolve conditions to all sub-states
	//
	// -------------------------------------------------------------------------
	.state('admin.condition', {
		data: {roles: ['admin','eao']},
		abstract:true,
		context: 'application',
		url: '/condition',
		template: '<ui-view></ui-view>',
		resolve: {
			conditions: function ($stateParams, ConditionModel) {
				return ConditionModel.getCollection ();
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
		}
	})
	// -------------------------------------------------------------------------
	//
	// the list state for conditions. conditions are guaranteed to
	// already be resolved
	//
	// -------------------------------------------------------------------------
	.state('admin.condition.list', {
		url: '/list',
		templateUrl: 'modules/conditions/client/views/condition-list.html',
		controller: function ($scope, NgTableParams, conditions, pillars, projecttypes, stages, MenuControl, Application) {
			// console.log ('app.usercan = ',Application.userCan);
			$scope.ptypes = projecttypes;
			$scope.showedit = MenuControl.userHasOne(['admin','qa-officer', 'ce-lead', 'ce-officer']);
			$scope.stypes = stages;
			$scope.pillars = pillars;
			$scope.tableParams = new NgTableParams ({count:10}, {dataset: conditions});
			$scope.show_filter = false;
			$scope.toggleFilter = function () {
				// $('.ng-table-filters').toggle();
			};
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the add, or create state. it is defined before the others so that
	// it does not conflict
	//
	// -------------------------------------------------------------------------
	.state('admin.condition.create', {
		data: {roles: ['admin','*:*:qa-officer', '*:*:ce-lead', '*:*:ce-officer']},
		url: '/create',
		templateUrl: 'modules/conditions/client/views/condition-edit.html',
		resolve: {
			condition: function (ConditionModel) {
				return ConditionModel.getNew ();
			}
		},
		controller: function ($scope, $state, condition, ConditionModel, TopicModel, pillars, projecttypes, stages, codeFromTitle) {
			// console.log ('add condition = ', condition);
			$scope.condition = condition;
			// console.log ('condition = ', condition);
			$scope.sectors = projecttypes;
			$scope.pillars = pillars;
			$scope.stages  = stages;
			var which = 'add';
			$scope.save = function (isValid) {
				if (!isValid) {
					$scope.$broadcast('show-errors-check-validity', 'conditionForm');
					return false;
				}
				$scope.condition.code = codeFromTitle ($scope.condition.name);
				var p = (which === 'add') ? ConditionModel.add ($scope.condition) : ConditionModel.save ($scope.condition);
				p.then (function (model) {
					$state.transitionTo('admin.condition.list', {}, {
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
	.state('admin.condition.edit', {
		data: {roles: ['admin','*:*:qa-officer', '*:*:ce-lead', '*:*:ce-officer']},
		url: '/:conditionId/edit',
		templateUrl: 'modules/conditions/client/views/condition-edit.html',
		resolve: {
			condition: function ($stateParams, ConditionModel) {
				return ConditionModel.getModel ($stateParams.conditionId);
			}
		},
		controller: function ($scope, $state, condition, ConditionModel, TopicModel, pillars, projecttypes, stages, codeFromTitle) {
			// console.log ('edit condition = ', condition);
			$scope.condition = condition;
			// console.log ('condition = ', condition);
			$scope.sectors = projecttypes;
			$scope.pillars = pillars;
			$scope.stages  = stages;
			// console.log ('stages:', $scope.stages);
			// console.log ('condition.stage:',condition.stages);
			// console.log ($scope.pillars);

			var which = 'edit';
			$scope.save = function (isValid) {
				if (!isValid) {
					$scope.$broadcast('show-errors-check-validity', 'conditionForm');
					return false;
				}
				$scope.condition.code = codeFromTitle ($scope.condition.name);
				var p = (which === 'add') ? ConditionModel.add ($scope.condition) : ConditionModel.save ($scope.condition);
				p.then (function (model) {
					$state.transitionTo('admin.condition.list', {}, {
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
	// this is the 'view' mode of a condition. here we are just simply
	// looking at the information for this specific object
	//
	// -------------------------------------------------------------------------
	.state('admin.condition.detail', {
		url: '/:conditionId',
		templateUrl: 'modules/conditions/client/views/condition-view.html',
		resolve: {
			condition: function ($stateParams, ConditionModel) {
				return ConditionModel.getModel ($stateParams.conditionId);
			}
		},
		controller: function ($scope, condition, pillars, projecttypes, stages, MenuControl) {
			$scope.condition = condition;
			$scope.showedit = MenuControl.userHasOne(['admin','qa-officer', 'ce-lead', 'ce-officer']);
			$scope.sectors = projecttypes;
			$scope.pillars = pillars;
			$scope.stages  = stages;
		}
	})

	;

}]);


