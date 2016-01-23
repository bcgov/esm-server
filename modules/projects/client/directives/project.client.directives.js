'use strict';

angular.module('project')
	.directive('tmplProject', directiveProject)
	.directive('modalProjectSchedule', directiveModalProjectSchedule)
	.directive('tmplProjectTombstone', directiveProjectTombstone)
	// .directive('tmplProjectTombstoneVertical', directiveProjectTombstoneVertical)
	// .directive('tmplProjectTimeline', directiveProjectTimeline)

	.directive('tmplProjectEntry', directiveProjectEntry)

	// .directive('tmplProjectProponent', directiveProjectProponent)        
	// .directive('tmplProjectBucketListing', directiveProjectBucketListing)
	// .directive('tmplProjectResearch', directiveProjectResearch)

	.directive('tmplProjectNew', directiveProjectNew)

	.directive('tmplProjectEdit', directiveProjectEdit)
	.directive('tmplProjectStreamSelect', directiveProjectStreamSelect)
	.directive('tmplProjectActivities', directiveProjectActivities);

// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Public Project Main
//
// -----------------------------------------------------------------------------------
directiveProject.$inject = [];
/* @ngInject */
function directiveProject() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/projects/client/views/project.html',
		controller: 'controllerProject',
		controllerAs: 'proj'
	};
	return directive;
}
   
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
					controller: 'modalProjectSchedule',
					controllerAs: 'ps',
					resolve: {
						rProject: function () {
							return scope.project;
						}
					},
					size: 'lg'
				});
				modalDocView.result.then(function () {}, function () {});
			});
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Project Tombstone Horizontal - same controller as the vertical view
//
// -----------------------------------------------------------------------------------
directiveProjectTombstone.$inject = [];
/* @ngInject */
function directiveProjectTombstone() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/projects/client/views/project-partials/project-tombstone.html',
		controller: 'controllerProjectTombstone',
		controllerAs: 'projTomb',
		scope: {
			project: '='
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Project Tombstone Vertical - same controller as the horizontal view
//
// -----------------------------------------------------------------------------------
// directiveProjectTombstoneVertical.$inject = [];
// /* @ngInject */
// function directiveProjectTombstoneVertical() {
// 	var directive = {
// 		restrict: 'E',
// 		templateUrl: 'modules/projects/client/views/project-partials/project-tombstone-vertical.html',
// 		controller: 'controllerProjectTombstone',
// 		controllerAs: 'projTomb',
// 		scope: {
// 			project: '='
// 		}
// 	};
// 	return directive;
// }
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
// DIRECTIVE: Project Entry Tombstone - just insert the template
//
// -----------------------------------------------------------------------------------
directiveProjectEntryTombstone.$inject = [];
/* @ngInject */
function directiveProjectEntryTombstone() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/projects/client/views/project-partials/project-entry-tombstone.html',
		controller: 'controllerProjectEntryTombstone',
		controllerAs: 'projectEntryTS',
		scope: {
			project: '='
		}            
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Project proponent
//
// -----------------------------------------------------------------------------------
// directiveProjectProponent.$inject = [];
// /* @ngInject */
// function directiveProjectProponent() {
// 	var directive = {
// 		restrict: 'E',
// 		templateUrl: 'modules/projects/client/views/project-partials/project-proponent.html',
// 		controller: 'controllerProjectProponent',
// 		controllerAs: 'projectProponent',
// 		scope: {
// 			project: '='
// 		}            
// 	};
// 	return directive;
// }
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Project bucket listing
//
// -----------------------------------------------------------------------------------
// directiveProjectBucketListing.$inject = [];
// /* @ngInject */
// function directiveProjectBucketListing() {
// 	var directive = {
// 		restrict: 'E',
// 		templateUrl: 'modules/projects/client/views/project-partials/project-bucket-listing.html',
// 		controller: 'controllerProjectBucketListing',
// 		controllerAs: 'projBuckets',
// 		scope: {
// 			project: '=',
// 			filter: '='
// 		}
// 	};
// 	return directive;
// }
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Project bucket listing
//
// -----------------------------------------------------------------------------------
// directiveProjectResearch.$inject = [];
// /* @ngInject */
// function directiveProjectResearch() {
// 	var directive = {
// 		restrict: 'E',
// 		templateUrl: 'modules/projects/client/views/project-partials/project-research.html',
// 		controller: 'controllerProjectResearch',
// 		controllerAs: 'pr',
// 		scope: {
// 			project: '='
// 		}
// 	};
// 	return directive;
// }

// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Project New
//
// -----------------------------------------------------------------------------------
directiveProjectNew.$inject = [];
/* @ngInject */
function directiveProjectNew() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/projects/client/views/project-new.html',
		controller: 'controllerProjectNew',
		controllerAs: 'proj'
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Project Entry
//
// -----------------------------------------------------------------------------------
directiveProjectEntry.$inject = [];
/* @ngInject */
function directiveProjectEntry() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/projects/client/views/project-partials/project-entry.html',
		controller: 'controllerProjectEntry',
		controllerAs: 'projectEntry',
		scope: {
			project: '='
		}		
	};
	return directive;
}

// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Project Edit
//
// -----------------------------------------------------------------------------------
directiveProjectEdit.$inject = [];
/* @ngInject */
function directiveProjectEdit() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/projects/client/views/project-partials/project-entry.html',
		controller: 'controllerProjectEdit',
		controllerAs: 'projectEntry',
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
directiveProjectStreamSelect.$inject = [];
/* @ngInject */
function directiveProjectStreamSelect() {
	var directive = {
		restrict: 'E',
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


