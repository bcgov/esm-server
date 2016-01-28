'use strict';

angular.module('activity')
	.directive('tmplEaoActivityDetail', directiveEAOActivityDetail)
	.directive('tmplEaoActivityTasks', directiveEAOActivityTasks)       
	.directive('tmplEaoActivityProcesses', directiveEAOActivityProcesses)
	.directive('modalAddCustomTask', directiveModalAddCustomTask);

// -----------------------------------------------------------------------------------
//
// DIRECTIVE: EAO Activity Detail
//
// -----------------------------------------------------------------------------------
directiveEAOActivityDetail.$inject = [];
/* @ngInject */
function directiveEAOActivityDetail() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/activities/client/views/activity-eao-partials/activity-eao-detail.html',
		controller: 'controllerEAOActivityDetail',
		controllerAs: 'actDetail',
		scope : {
			project: '=',
			activity: '='
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: EAO Activity Tasks
//
// -----------------------------------------------------------------------------------
directiveEAOActivityTasks.$inject = [];
/* @ngInject */
function directiveEAOActivityTasks() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/activities/client/views/activity-eao-partials/activity-eao-tasks.html',
		controller: 'controllerEAOActivityTasks',
		controllerAs: 'actTasks',
		scope : {
			project: '=',
			activity: '=',
			tasks: '=',
			task: '='
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: EAO Activity Processes
//
// -----------------------------------------------------------------------------------
directiveEAOActivityProcesses.$inject = [];
/* @ngInject */
function directiveEAOActivityProcesses() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/activities/client/views/activity-eao-partials/activity-eao-processes.html',
		controller: 'controllerEAOActivityProcesses',
		controllerAs: 'actProcs',
		scope : {
			project: '=',
			activity: '=',
			tasks: '=' ,
			task: '='              
		}
	};
	return directive;
}

// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Add Custom Task to Activity
//
// -----------------------------------------------------------------------------------
directiveModalAddCustomTask.$inject = ['$modal'];
/* @ngInject */
function directiveModalAddCustomTask($modal) {
	var directive = {
		restrict:'A',
		scope : {
			activity: '=',
			tasks: '='
		},
		link : function(scope, element, attrs) {
			element.on('click', function() {
				var modalCustomTask = $modal.open({
					animation: true,
					templateUrl: 'modules/activities/client/views/activity-eao-partials/modal-add-custom-task.html',
					controller: 'controllerModalAddCustomTask',
					controllerAs: 'customTask',
					resolve: {
						rActivity: function () {
							return scope.activity;
						},
						rTasks: function () {
							return scope.tasks;
						}
					},
					size: 'sm'
				});
				modalCustomTask.result.then(function () {}, function () {});
			});
		}
	};
	return directive;
}
