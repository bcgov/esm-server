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
// directiveModalProjectEdit.$inject = ['$uibModal'];
// /* @ngInject */
// function directiveModalProjectEdit($uibModal) {
// 	var directive = {
// 		restrict:'A',
// 		scope : {
// 			project: '='
// 		},
// 		link : function(scope, element, attrs) {
// 			element.on('click', function() {
// 				var modalMilestoneView = $uibModal.open({
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
//  directiveModalProjectEditPlanMilestones.$inject = ['$uibModal'];
//  /* @ngInject */
//  function directiveModalProjectEditPlanMilestones($uibModal) {
//      var directive = {
//          restrict:'A',
//          scope : {
//          	project: '='
//          },
// link : function(scope, element, attrs) {
// 	element.on('click', function() {
// 		var modalMilestoneView = $uibModal.open({
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
// directiveModalProjectEditPlanSchedule.$inject = ['$uibModal'];
// /* @ngInject */
// function directiveModalProjectEditPlanSchedule($uibModal) {
// 	var directive = {
// 		restrict:'A',
// 		scope : {
// 			project: '='
// 		},
// 		link : function(scope, element, attrs) {
// 			element.on('click', function() {
// 				var modalDocView = $uibModal.open({
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
// directiveModalProjectContacts.$inject = ['$uibModal'];
// /* @ngInject */
// function directiveModalProjectContacts($uibModal) {
// 	var directive = {
// 		restrict:'A',
// 		scope : {
// 			project: '='
// 		},
// 		link : function(scope, element, attrs) {
// 			element.on('click', function() {
// 				var modalDocView = $uibModal.open({
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
