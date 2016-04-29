'use strict';

angular.module('project').config (
	['$locationProvider', '$stateProvider', '$urlRouterProvider', '_',
	function ($locationProvider, $stateProvider, $urlRouterProvider, _) {

	$stateProvider
	.state('p', {
		url: '/p/:projectid',
		abstract: true,
		templateUrl: 'modules/projects/client/views/project.abstract.html',
		resolve: {
			project: function ($stateParams, ProjectModel) {
				// console.log ('loading project');
				if ($stateParams.projectid === 'new') {
					return ProjectModel.getNew ();
				} else {
					return ProjectModel.byCode ($stateParams.projectid);
				}
			},
			eaoAdmin: function (project) {
				return project.adminRole;
			},
			proponentAdmin: function (project) {
				return project.proponentAdminRole;
			}
		},
		controller: function ($scope, $stateParams, project, ENV, $rootScope, ProjectModel) {
			$scope.project = project;
			$scope.environment = ENV;
			$scope.isNew = ($stateParams.projectid === 'new');

			ProjectModel.setModel(project);

			$scope.intakeQuestions = ProjectModel.getProjectIntakeQuestions();

			var unbind = $rootScope.$on('refreshProject', function() {
				// console.log('refreshProject', $stateParams.projectid);
				$scope.project = angular.copy( ProjectModel.byCode ($stateParams.projectid) );
			});
			$scope.$on('$destroy',unbind);

		}
	})
	// -------------------------------------------------------------------------
	//
	// the detail view of a project
	//
	// -------------------------------------------------------------------------
	.state('p.detail', {
		url: '/detail',
		templateUrl: 'modules/projects/client/views/project-partials/project.detail.html',
		controller: function ($scope, $state, project, ProjectModel, $window) {
			$scope.project = project;

			// complete the current phase.
			$scope.completePhase = function() {
				ProjectModel.completePhase( project ).then( function(res) {
					$scope.project = res;
					$scope.$apply ();
					$state.go($state.current, {}, {reload: true});
					// $window.location.reload();
					// $state.transitionTo('p.detail', {projectid:project.code}, {
			  // 			reload: true, inherit: false, notify: true
					// });
				});
			};

			// complete the current phase.
			$scope.startNextPhase = function() {
				ProjectModel.nextPhase( project ).then( function(res) {
					$scope.project = res;
					$scope.$apply ();
					$state.go($state.current, {}, {reload: true});
					// $window.location.reload();
					// $state.transitionTo('p.detail', {projectid:project.code}, {
			  // 			reload: true, inherit: false, notify: true
					// });
				});
			};

			// complete the current phase.
			$scope.publishProject = function() {
				ProjectModel.publishProject( project ).then( function(res) {
					$scope.project = res;
					$state.go($state.current, {}, {reload: true});
					// $state.transitionTo('p.detail', {projectid:project.code}, {
			  // 			reload: true, inherit: false, notify: true
					// });
				});
			};
		}
	})
	// -------------------------------------------------------------------------
	//
	// the detail view of a project
	//
	// -------------------------------------------------------------------------
	.state('p.edit', {
		url: '/edit',
		templateUrl: 'modules/projects/client/views/project-partials/project.entry.html',
		controller: 'controllerProjectEntry',
		// resolve: {
		// 	intakeQuestions: function(ProjectModel) {
		// 		return ProjectModel.getProjectIntakeQuestions();
		// 	}
		// },
		onEnter: function (MenuControl, project, $stateParams) {
			if ($stateParams.projectid === 'new') {
				MenuControl.routeAccess ('', '','proponent');
			}
			else {
				MenuControl.routeAccess (project.code, 'pro','edit-project');
			}
		}
	})
	// -------------------------------------------------------------------------
	//
	// the decision package mockup
	//
	// -------------------------------------------------------------------------
	.state('p.decision', {
		url: '/decision',
		templateUrl: 'modules/projects/client/views/project-partials/project.decision.html',
		controller: function ($scope, $state, project, ProjectModel) {

		}
	})
	.state('p.schedule', {
		url: '/schedule',
		templateUrl: 'modules/projects/client/views/project-partials/project.schedule.html',
		resolve: {
			rMilestones: function (MilestoneModel, project) {
				return MilestoneModel.userMilestones(project._id);
			},
			rPhases: function (PhaseModel, project) {
				return PhaseModel.phasesForProject(project._id);
			},
		},
		controller: function ($scope, $state, project, ProjectModel, rMilestones, MilestoneModel, PhaseModel, rPhases) {
			$scope.rMilestones = rMilestones;
			$scope.rPhases = rPhases;
			console.log($scope.rPhases);
		}
	})
	;
}]);











