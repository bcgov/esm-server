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
		controller: function ($scope, project, ProjectModel) {
			$scope.project = project;
			
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
		resolve: {
			intakeQuestions: function(ProjectModel) {
				return ProjectModel.getProjectIntakeQuestions();
			}
		},
        onEnter: function (MenuControl, project, $stateParams) {
        	if ($stateParams.projectid === 'new') {
        		MenuControl.routeAccess ('', '','proponent');
        	}
        	else {
            	MenuControl.routeAccess (project.code, 'pro','edit-project');
        	}
        }
	});
}]);











