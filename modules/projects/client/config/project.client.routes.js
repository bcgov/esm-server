'use strict';

angular.module('project').config (
	['$locationProvider', '$stateProvider', '$urlRouterProvider', '_',
	function ($locationProvider, $stateProvider, $urlRouterProvider, _) {

	$stateProvider
	// -------------------------------------------------------------------------
	//
	// the project abstract, this contains the menu and a ui-view for loading
	// child views. it also handles injecting the project
	//
	// -------------------------------------------------------------------------
	// .state ('newproject', {
	// 	url: '/newproject',
	// 	abstract: false,
	// 	template:'<p></p>',
	// 	resolve: {
	// 		project: function (ProjectModel, Authentication, _ ) {
	// 				var code = Authentication.user.username + '-' + 'newproject' + '-' + _.random (0,1000);
	// 				return ProjectModel.getNewWithCode (code);
	// 		}
	// 	},
	// 	controller: function ($state, project) {
	// 		console.log ('new project =' , project);
	// 		$state.go ('p.edit', {projectid:project.code,project:project.code});
	// 	}
	// })
	.state('p', {
		url: '/p/:projectid',
		abstract: true,
		templateUrl: 'modules/projects/client/views/project.abstract.html',
		resolve: {
			project: function ($stateParams, ProjectModel) {
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
		controller: function ($scope, $stateParams, project, ENV) {
			$scope.project = project;
			$scope.environment = ENV;
			$scope.isNew = ($stateParams.projectid === 'new');
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
		controller: function ($scope, project) {
			$scope.project = project;
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
		}
	});
}]);











