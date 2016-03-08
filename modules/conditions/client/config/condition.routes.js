'use strict';
// -------------------------------------------------------------------------
//
// A shared controller for add/edit
//
// -------------------------------------------------------------------------
var addEdit = function (which, $scope, $state, condition, ConditionModel, TopicModel, pillars, projecttypes, stages, codeFromTitle) {
	$scope.condition = condition;
	$scope.sectors = projecttypes;
	$scope.pillars = pillars;
	$scope.stages  = stages;
	$scope.save = function () {
		$scope.condition.code = codeFromTitle ($scope.condition.name);
		var p = (which === 'add') ? ConditionModel.add ($scope.condition) : ConditionModel.save ($scope.condition);
		p.then (function (model) {
			$state.transitionTo('admin.condition.list', {}, {
	  			reload: true, inherit: false, notify: true
			});
		})
		.catch (function (err) {
			console.error (err);
			alert (err);
		});
	};
	$scope.selectTopic = function () {
		if (!$scope.condition.pillar) return;
		TopicModel.getTopicsForPillar ($scope.condition.pillar).then (function (topics) {
			console.log ('topics = ', $scope.topics);
			$scope.topics = topics;
			$scope.$apply();
		});
	};
	$scope.selectTopic ();
};
// =========================================================================
//
// condition routes (under admin)
//
// =========================================================================
angular.module('core').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
	// -------------------------------------------------------------------------
	//
	// this is the abstract, top level view for conditions.
	// we resolve conditions to all sub-states
	//
	// -------------------------------------------------------------------------
	.state('admin.condition', {
		abstract:true,
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
		controller: function ($scope, NgTableParams, conditions, pillars, projecttypes, stages) {
			$scope.ptypes = projecttypes;
			$scope.stypes = stages;
			$scope.pillars = pillars;
			$scope.tableParams = new NgTableParams ({count:10}, {dataset: conditions});
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the add, or create state. it is defined before the others so that
	// it does not conflict
	//
	// -------------------------------------------------------------------------
	.state('admin.condition.create', {
		url: '/create',
		templateUrl: 'modules/conditions/client/views/condition-edit.html',
		resolve: {
			condition: function (ConditionModel) {
				return ConditionModel.getNew ();
			}
		},
		controller: function ($scope, $state, condition, ConditionModel, TopicModel, pillars, projecttypes, stages, codeFromTitle) {
			addEdit ('add', $scope, $state, condition, ConditionModel, TopicModel, pillars, projecttypes, stages, codeFromTitle);
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the edit state
	//
	// -------------------------------------------------------------------------
	.state('admin.condition.edit', {
		url: '/:conditionId/edit',
		templateUrl: 'modules/conditions/client/views/condition-edit.html',
		resolve: {
			condition: function ($stateParams, ConditionModel) {
				return ConditionModel.getModel ($stateParams.conditionId);
			}
		},
		controller: function ($scope, $state, condition, ConditionModel, TopicModel, pillars, projecttypes, stages, codeFromTitle) {
			addEdit ('edit', $scope, $state, condition, ConditionModel, TopicModel, pillars, projecttypes, stages, codeFromTitle);
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
		controller: function ($scope, condition, pillars, types) {
			$scope.condition = condition;
			$scope.types = types;
			$scope.pillars = pillars;
		}
	})

	;

}]);


