// 'use strict';

// angular.module('project')
// 	.directive('tmplEaoProject', directiveEAOProject)

	
// 	.directive('modalProjectEdit', directiveModalProjectEdit)
// 	.directive('modalProjectEditPlanSchedule', directiveModalProjectEditPlanSchedule)
// 	.directive('modalProjectContacts', directiveModalProjectContacts);

// -----------------------------------------------------------------------------------
//
// DIRECTIVE: EAO Project Main
//
// -----------------------------------------------------------------------------------
// directiveEAOProject.$inject = [];
// /* @ngInject */
// function directiveEAOProject() {
// 	var directive = {
// 		restrict: 'E',
// 		templateUrl: 'modules/projects/client/views/project-eao.html',
// 		controller: 'controllerEAOProject',
// 		controllerAs: 'vm'
// 	};
// 	return directive;
// }


// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Modal Edit Project
//
// -----------------------------------------------------------------------------------
// directiveModalProjectEdit.$inject = ['$modal'];
// /* @ngInject */
// function directiveModalProjectEdit($modal) {
// 	var directive = {
// 		restrict:'A',
// 		scope : {
// 			project: '='
// 		},
// 		link : function(scope, element, attrs) {
// 			element.on('click', function() {
// 				var modalMilestoneView = $modal.open({
// 					animation: true,
// 					templateUrl: 'modules/projects/client/views/project-partials/modal-edit-project.html',
// 					controller: 'controllerModalProjectEdit',
// 					controllerAs: 'projectEdit',
// 					resolve: {
// 						rProject: function () {
// 							return scope.project;
// 						}
// 					},
// 					size: 'lg'
// 				});
// 				modalMilestoneView.result.then(function () {}, function () {});
// 			});
// 		}
// 	};
// 	return directive;
// }    
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Modal Edit Project Phases
//
// -----------------------------------------------------------------------------------
//  directiveModalProjectEditPlanMilestones.$inject = ['$modal'];
//  /* @ngInject */
//  function directiveModalProjectEditPlanMilestones($modal) {
//      var directive = {
//          restrict:'A',
//          scope : {
//          	project: '='
//          },
		// link : function(scope, element, attrs) {
		// 	element.on('click', function() {
		// 		var modalMilestoneView = $modal.open({
		// 			animation: true,
		// 			templateUrl: 'components/project/project-eao/partials/modal-edit-plan-milestones.html',
		// 			controller: 'controllerModalProjectEditPlanMilestones',
		// 			controllerAs: 'pestag',
		// 			resolve: {
		// 				rProject: function () {
		// 					return scope.project;
		// 				}
		// 			},
		// 			size: 'lg'
		// 		});
		// 		modalMilestoneView.result.then(function () {}, function () {});
		// 	});
		// }
//      };
//      return directive;
//  }
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Modal Edit Project Phases
//
// -----------------------------------------------------------------------------------
// directiveModalProjectEditPlanSchedule.$inject = ['$modal'];
// /* @ngInject */
// function directiveModalProjectEditPlanSchedule($modal) {
// 	var directive = {
// 		restrict:'A',
// 		scope : {
// 			project: '='
// 		},
// 		link : function(scope, element, attrs) {
// 			element.on('click', function() {
// 				var modalDocView = $modal.open({
// 					animation: true,
// 					templateUrl: 'modules/projects/client/views/project-partials/modal-edit-plan-schedule.html',
// 					controller: 'controllerModalProjectEditPlanSchedule',
// 					controllerAs: 'pesched',
// 					resolve: {
// 						rProject: function () {
// 							return scope.project;
// 						}
// 					},
// 					size: 'lg'
// 				});
// 				modalDocView.result.then(function () {}, function () {});
// 			});
// 		}
// 	};
// 	return directive;
// }
// // -----------------------------------------------------------------------------------
//
// DIRECTIVE: Modal Edit Project Team
//
// -----------------------------------------------------------------------------------
// directiveModalProjectContacts.$inject = ['$modal'];
// /* @ngInject */
// function directiveModalProjectContacts($modal) {
// 	var directive = {
// 		restrict:'A',
// 		scope : {
// 			project: '='
// 		},
// 		link : function(scope, element, attrs) {
// 			element.on('click', function() {
// 				var modalDocView = $modal.open({
// 					animation: true,
// 					templateUrl: 'modules/projects/client/views/project-partials/modal-project-contacts.html',
// 					controller: 'controllerModalProjectContacts',
// 					controllerAs: 'projectContacts',
// 					resolve: {
// 						rProject: function () {
// 							return scope.project;
// 						}
// 					},
// 					size: 'lg'
// 				});
// 				modalDocView.result.then(function () {}, function () {});
// 			});
// 		}
// 	};
// 	return directive;
// }
