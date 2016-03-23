'use strict';

angular.module('project')
	// .directive('tmplProject', directiveProject)
	.directive('modalProjectSchedule', directiveModalProjectSchedule)
	.directive('modalAddPhaseToProject', directiveModalAddPhaseToProject )
	.directive('modalAddActivity', directiveModalAddActivity)
	.directive('tmplProjectTombstone', directiveProjectTombstone)
	.directive('modalProjectImport', directiveModalProjectImport)

	.directive('tmplProjectInitiated', directiveProjectInitiated)
	.directive('tmplProjectStreamSelect', directiveProjectStreamSelect)
	.directive('tmplProjectActivities', directiveProjectActivities);


	// .directive('modalProjectVc', directiveProjectVC)
	// .directive('modalProjectVcEntry', directiveProjectVCEntry)
	// .directive('tmplProjectTombstoneVertical', directiveProjectTombstoneVertical)
	// .directive('tmplProjectTimeline', directiveProjectTimeline)

	// .directive('tmplProjectEntry', directiveProjectEntry)

	// .directive('tmplProjectProponent', directiveProjectProponent)
	// .directive('tmplProjectBucketListing', directiveProjectBucketListing)
	// .directive('tmplProjectResearch', directiveProjectResearch)

	// .directive('modalProjectEntry', directiveModalProjectEntry)

	// .directive('tmplProjectNew', directiveProjectNew)
	// .directive('tmplProjectEdit', directiveProjectEdit)

// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Modal Project Schedule
//
// -----------------------------------------------------------------------------------
directiveModalProjectSchedule.$inject = ['$modal'];
/* @ngInject */
function directiveModalProjectSchedule($modal) {
	var directive = {
		restrict:'A',
		scope : {
			project: '='
		},
		link : function(scope, element, attrs) {
			element.on('click', function() {
				var modalDocView = $modal.open({
					animation: true,
					templateUrl: 'modules/projects/client/views/project-partials/modal-project-schedule.html',
					controller: 'controllerModalProjectSchedule',
					controllerAs: 'projSched',
					resolve: {
						rProject: function () {
							return scope.project;
						}
					},
					size: 'lg'
				});
				modalDocView.result.then(function (items) {
					scope.project = items;
				}, function () {});
			});
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Modal Add Phase to Project
//
// -----------------------------------------------------------------------------------
directiveModalAddPhaseToProject.$inject = ['$modal', '$rootScope'];
/* @ngInject */
function directiveModalAddPhaseToProject($modal, $rootScope) {
	var directive = {
		restrict:'A',
		scope: {
			project: '='
		},
		link : function(scope, element, attrs) {
			element.on('click', function() {
				var modalAddPhase = $modal.open({
					animation: true,
					templateUrl: 'modules/projects/client/views/project-partials/modal-add-phase.html',
					controller: 'controllerModalAddPhase',
					controllerAs: 'addPhase',
					resolve: {
						rProject: function() {
							return scope.project;
						}
					},
					size: 'sm'
				});
				modalAddPhase.result.then(function (data) {
				}, function () {});
			});
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Modal Add Milestone to Phase
//
// -----------------------------------------------------------------------------------
directiveModalAddMilestoneToPhase.$inject = ['$modal', '$rootScope'];
/* @ngInject */
function directiveModalAddMilestoneToPhase($modal, $rootScope) {
	var directive = {
		restrict:'A',
		scope: {
			phase: '='
		},
		link : function(scope, element, attrs) {
			element.on('click', function() {
				var modalAddMilestone = $modal.open({
					animation: true,
					templateUrl: 'modules/projects/client/views/project-partials/modal-add-milestone.html',
					controller: 'controllerModalAddMilestone',
					controllerAs: 'addMile',
					resolve: {
						rPhase: function() {
							return scope.phase;
						}
					},
					size: 'sm'
				});
				modalAddMilestone.result.then(function (data) {
				}, function () {});
			});
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Modal Add Activity
//
// -----------------------------------------------------------------------------------
directiveModalAddActivity.$inject = ['$modal', '$rootScope'];
/* @ngInject */
function directiveModalAddActivity($modal, $rootScope) {
	var directive = {
		restrict:'A',
		scope : {
			milestone: '='
		},
		link : function(scope, element, attrs) {
			element.on('click', function() {
				var modalAddAct = $modal.open({
					animation: true,
					templateUrl: 'modules/projects/client/views/project-partials/modal-add-activity.html',
					controller: 'controllerModalAddActivity',
					controllerAs: 'addAct',
					resolve: {
						rMilestone: function () {
							return scope.milestone;
						}
					},
					size: 'sm'
				});
				modalAddAct.result.then(function (data) {
					$rootScope.$broadcast('refreshActivitiesForMilestone', {milestone: data});
					// fetch project again.
				}, function () {});
			});
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Modal Project Entry
//
// -----------------------------------------------------------------------------------
directiveModalProjectImport.$inject = ['$modal', '$state', '$rootScope', 'ProjectModel'];
/* @ngInject */
function directiveModalProjectImport($modal, $state, $rootScope, sProjectModel) {
	var directive = {
		restrict:'A',
		scope : {
			project: '='
		},
		link : function(scope, element, attrs) {
			element.on('click', function() {
				var modalProjectEntry = $modal.open({
					animation: true,
					templateUrl: 'modules/projects/client/views/project-partials/modal-project-import.html',
					controller: 'controllerModalProjectImport',
					controllerAs: 'projectImport',
					resolve: {
						rProject: function () {
							return scope.project;
						}
					},
					size: 'lg'
				});
				modalProjectEntry.result.then(function (data) {
					if ($state.current.name === 'projects') {
						// reload the complete projects list
						$rootScope.$broadcast('refreshProjectsList');
					} else {
						$rootScope.$broadcast('refreshProject');
						$rootScope.$broadcast('refreshDocumentList');
					}
				}, function () {});
			});
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Project Tombstone Horizontal
//
// -----------------------------------------------------------------------------------
directiveProjectTombstone.$inject = [];
/* @ngInject */
function directiveProjectTombstone() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/projects/client/views/project-partials/project-tombstone.html',
		scope: {
			project: '='
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Project Timeline Horizontal
//
// -----------------------------------------------------------------------------------
// directiveProjectTimeline.$inject = [];
// /* @ngInject */
// function directiveProjectTimeline() {
// 	var directive = {
// 		restrict: 'E',
// 		templateUrl: 'modules/projects/client/views/project-partials/project-timeline.html',
// 		controller: 'controllerProjectTimeline',
// 		controllerAs: 'ptime',
// 		scope: {
// 			project: '='
// 		}
// 	};
// 	return directive;
// }

// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Project Initiated
// Used
//
// -----------------------------------------------------------------------------------
function directiveProjectInitiated() {
	var directive = {
		restrict: 'E',
		replace: true,
		templateUrl: 'modules/projects/client/views/project-partials/project-initiated.html'
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Project Stream Select
//
// -----------------------------------------------------------------------------------
directiveProjectStreamSelect.$inject = [];
/* @ngInject */
function directiveProjectStreamSelect() {
	var directive = {
		restrict: 'E',
		replace: true,
		templateUrl: 'modules/projects/client/views/project-partials/project-stream-select.html',
		controller: 'controllerProjectStreamSelect',
		controllerAs: 'projectStreamSelect',
		scope: {
			project: '='
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Project Stream Select
//
// -----------------------------------------------------------------------------------
directiveProjectActivities.$inject = [];
/* @ngInject */
function directiveProjectActivities() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/projects/client/views/project-partials/project-activities.html',
		controller: 'controllerProjectActivities',
		controllerAs: 'projectActs',
		scope: {
			project: '='
		}
	};
	return directive;
}