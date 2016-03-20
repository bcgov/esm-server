'use strict';

angular.module('project').config(configFunction);

configFunction.$inject = ['$locationProvider', '$stateProvider', '$urlRouterProvider', '_'];

/* @ngInject */
function configFunction($locationProvider, $stateProvider, $urlRouterProvider, _) {

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
	})
	// -------------------------------------------------------------------------
	//
	// project description
	//
	// -------------------------------------------------------------------------
	.state('projectdescription', {
		url: '/projectdescription/:project',
		template: '<tmpl-project-description-edit></tmpl-project-description-edit>',
		data: {
			roles: ['admin', 'user']
		}
	})
	.state('comments', {
		url: '/comments/:project',
		template: '<tmpl-comment-period-list></tmpl-comment-period-list>',
		data: {
			roles: ['admin', 'user']
		}
	})
	.state('activity', {
		url: '/project/:project/activity/:activity',
		template: '<tmpl-activity></tmpl-activity>',
		data: {
			roles: ['admin', 'user']
		}
	})
	.state('activities', {
		url: '/activities',
		templateUrl: 'modules/users/client/views/user-partials/user-activities.html',
		resolve: {
			activities: function(ActivityModel) {
				return ActivityModel.userActivities ();
			},
			projects: function(ProjectModel) {
				return ProjectModel.lookup ();
			}
		},
		controller: function ($scope, $stateParams, activities, projects, NgTableParams) {
			$scope.projects = projects;
			_.map(activities, function(item) {
				item.project = projects[item.project].name;
			});
			$scope.tableParams = new NgTableParams ({count:50}, {dataset: activities});
		},
		data: {
			roles: ['admin', 'user']
		}
	});
}











