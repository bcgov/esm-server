'use strict';

angular.module('project')
	.directive('modalProjectSchedule', directiveModalProjectSchedule)
	.directive('tmplProjectTombstone', directiveProjectTombstone)
	.directive('modalProjectImport', directiveModalProjectImport)

	.directive('tmplProjectInitiated', directiveProjectInitiated)
	.directive('tmplProjectStreamSelect', directiveProjectStreamSelect)
	.directive('tmplProjectActivities', directiveProjectActivities);

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
		},
		controller: function($scope, ENV, ProjectModel) {
			$scope.environment = ENV;

			// complete the current phase.
			$scope.completePhase = function() {
				ProjectModel.completePhase( $scope.project ).then( function(res) {
					$scope.project = res;
				});
			};

			// complete the current phase.
			$scope.startNextPhase = function() {
				ProjectModel.nextPhase( $scope.project ).then( function(res) {
					$scope.project = res;
				});
			};

			// complete the current phase.
			$scope.publishProject = function() {
				ProjectModel.publishProject( $scope.project ).then( function(res) {
					$scope.project = res;
				});
			};
		}
	};
	return directive;
}
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
		scope: {
			project: '='
		}
	};
	return directive;
}
