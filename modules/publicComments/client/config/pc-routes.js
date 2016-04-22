'use strict';
// =========================================================================
//
// condition routes (under admin)
//
// =========================================================================
angular.module('publicComments').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
	// -------------------------------------------------------------------------
	//
	// this is the abstract, top level view for conditions.
	// we resolve conditions to all sub-states
	//
	// -------------------------------------------------------------------------
	.state('eao.myproject.pcs', {
		data: {roles: ['admin','eao','user']},
		abstract:false,
		url: '/pcs',
		template: '<ui-view></ui-view>',
		resolve: {
			comments: function (project, Project) {
				console.log ('project = ', project);
				return Project.getPublicCommentsPublished (project._id).then (function(r){return r.data;});
			}
		}
	})
	// -------------------------------------------------------------------------
	//
	// the list state for conditions. conditions are guaranteed to
	// already be resolved
	//
	// -------------------------------------------------------------------------
	.state('eao.myproject.pcs.list', {
		url: '/list',
		templateUrl: 'modules/publicComments/client/views/listing/pc.list.html',
		controller: function ($scope, NgTableParams, project, comments) {
			console.log ('project = ', project);
			console.log ('comments = ', comments);
			$scope.project = project;
			$scope.comments = comments;
			$scope.toggleDateComment = [];
			$scope.tableParams = new NgTableParams ({count:10}, {dataset: comments});
			$scope.show_filter = true;
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the add, or create state. it is defined before the others so that
	// it does not conflict
	//
	// -------------------------------------------------------------------------
	// .state('admin.condition.create', {
	// 	data: {roles: ['admin','edit-conditions']},
	// 	url: '/create',
	// 	templateUrl: 'modules/conditions/client/views/condition-edit.html',
	// 	resolve: {
	// 		condition: function (ConditionModel) {
	// 			return ConditionModel.getNew ();
	// 		}
	// 	},
	// 	controller: function ($scope, $state, condition, ConditionModel, TopicModel, pillars, projecttypes, stages, codeFromTitle) {
	// 		// console.log ('add condition = ', condition);
	// 		$scope.condition = condition;
	// 		// console.log ('condition = ', condition);
	// 		$scope.sectors = projecttypes;
	// 		$scope.pillars = pillars;
	// 		$scope.stages  = stages;
	// 		var which = 'add';
	// 		$scope.save = function (isValid) {
	// 			if (!isValid) {
	// 				$scope.$broadcast('show-errors-check-validity', 'conditionForm');
	// 				return false;
	// 			}
	// 			$scope.condition.code = codeFromTitle ($scope.condition.name);
	// 			var p = (which === 'add') ? ConditionModel.add ($scope.condition) : ConditionModel.save ($scope.condition);
	// 			p.then (function (model) {
	// 				$state.transitionTo('admin.condition.list', {}, {
	// 		  			reload: true, inherit: false, notify: true
	// 				});
	// 			})
	// 			.catch (function (err) {
	// 				console.error (err);
	// 				// alert (err.message);
	// 			});
	// 		};
	// 	}
	// })
	// // -------------------------------------------------------------------------
	// //
	// // this is the edit state
	// //
	// // -------------------------------------------------------------------------
	// .state('admin.condition.edit', {
	// 	data: {roles: ['admin','edit-conditions']},
	// 	url: '/:conditionId/edit',
	// 	templateUrl: 'modules/conditions/client/views/condition-edit.html',
	// 	resolve: {
	// 		condition: function ($stateParams, ConditionModel) {
	// 			return ConditionModel.getModel ($stateParams.conditionId);
	// 		}
	// 	},
	// 	controller: function ($scope, $state, condition, ConditionModel, TopicModel, pillars, projecttypes, stages, codeFromTitle) {
	// 		// console.log ('edit condition = ', condition);
	// 		$scope.condition = condition;
	// 		// console.log ('condition = ', condition);
	// 		$scope.sectors = projecttypes;
	// 		$scope.pillars = pillars;
	// 		$scope.stages  = stages;
	// 		// console.log ('stages:', $scope.stages);
	// 		// console.log ('condition.stage:',condition.stages);
	// 		// console.log ($scope.pillars);

	// 		var which = 'edit';
	// 		$scope.save = function (isValid) {
	// 			if (!isValid) {
	// 				$scope.$broadcast('show-errors-check-validity', 'conditionForm');
	// 				return false;
	// 			}
	// 			$scope.condition.code = codeFromTitle ($scope.condition.name);
	// 			var p = (which === 'add') ? ConditionModel.add ($scope.condition) : ConditionModel.save ($scope.condition);
	// 			p.then (function (model) {
	// 				$state.transitionTo('admin.condition.list', {}, {
	// 		  			reload: true, inherit: false, notify: true
	// 				});
	// 			})
	// 			.catch (function (err) {
	// 				console.error (err);
	// 				// alert (err.message);
	// 			});
	// 		};
	// 	}
	// })
	// // -------------------------------------------------------------------------
	// //
	// // this is the 'view' mode of a condition. here we are just simply
	// // looking at the information for this specific object
	// //
	// // -------------------------------------------------------------------------
	// .state('admin.condition.detail', {
	// 	url: '/:conditionId',
	// 	templateUrl: 'modules/conditions/client/views/condition-view.html',
	// 	resolve: {
	// 		condition: function ($stateParams, ConditionModel) {
	// 			return ConditionModel.getModel ($stateParams.conditionId);
	// 		}
	// 	},
	// 	controller: function ($scope, condition, pillars, projecttypes, stages) {
	// 		$scope.condition = condition;
	// 		$scope.sectors = projecttypes;
	// 		$scope.pillars = pillars;
	// 		$scope.stages  = stages;
	// 	}
	// })

	;

}]);


