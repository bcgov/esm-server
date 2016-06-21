'use strict';
// =========================================================================
//
// project description routes
//
// =========================================================================
angular.module('core').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
	// -------------------------------------------------------------------------
	//
	// this is the abstract, top level view for project description.
	// since it is a child of p (project), the project injection has already
	// been resolved and is available to subsequent child states as 'project'
	// here we will resolve the list of descriptions for this project, which will
	// also become available to child states as 'descriptions'
	//
	// -------------------------------------------------------------------------
	.state('p.projectdescription', {
		abstract:true,
		url: '/projectdescription',
		template: '<ui-view></ui-view>',
		resolve: {
			descriptions: function ($stateParams, ProjectDescriptionModel, project) {
				// console.log ('projectdescription abstract resolving descriptions');
				// console.log ('project id = ', project._id);
				return ProjectDescriptionModel.getDescriptionsForProject (project._id);
			},
		}
	})
	// -------------------------------------------------------------------------
	//
	// the list state for description and project are guaranteed to
	// already be resolved
	//
	// -------------------------------------------------------------------------
	.state('p.projectdescription.list', {
		url: '/list',
		templateUrl: 'modules/project-descriptions/client/views/projectdescription-list.html',
		controller: function ($scope, NgTableParams, descriptions, project) {
			$scope.tableParams = new NgTableParams ({count:10}, {dataset: descriptions});
			$scope.project = project;
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the add, or create state. it is defined before the others so that
	// it does not conflict
	//
	// -------------------------------------------------------------------------
	.state('p.projectdescription.create', {
		url: '/create',
		templateUrl: 'modules/project-descriptions/client/views/projectdescription-edit.html',
		resolve: {
			description: function (ProjectDescriptionModel) {
				return ProjectDescriptionModel.getNew ();
			}
		},
		controller: function ($scope, $state, project, description, ProjectDescriptionModel) {
			$scope.description = description;
			$scope.project = project;
			$scope.save = function () {
				ProjectDescriptionModel.add ($scope.description)
				.then (function (model) {
					$state.transitionTo('p.projectdescription.list', {projectid:project.code}, {
			  			reload: true, inherit: false, notify: true
					});
				})
				.catch (function (err) {
					console.error (err);
					alert (err);
				});
			};
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the edit state
	//
	// -------------------------------------------------------------------------
	.state('p.projectdescription.edit', {
		url: '/:descriptionId/edit',
		templateUrl: 'modules/project-descriptions/client/views/projectdescription-edit.html',
		resolve: {
			description: function ($stateParams, ProjectDescriptionModel) {
				// console.log ('editing descriptionId = ', $stateParams.descriptionId);
				return ProjectDescriptionModel.getModel ($stateParams.descriptionId);
			}
		},
		controller: function ($scope, $state, description, project, ProjectDescriptionModel) {
			// console.log ('description = ', description);
			$scope.description = description;
			$scope.project = project;
			$scope.save = function () {
				ProjectDescriptionModel.save ($scope.description)
				.then (function (model) {
					// console.log ('description was saved',model);
					// console.log ('now going to reload state');
					$state.transitionTo('p.projectdescription.list', {projectid:project.code}, {
			  			reload: true, inherit: false, notify: true
					});
				})
				.catch (function (err) {
					console.error (err);
					alert (err);
				});
			};
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the 'view' mode of a project description. here we are just simply
	// looking at the information for this specific object
	//
	// -------------------------------------------------------------------------
	.state('p.projectdescription.detail', {
		url: '/:descriptionId',
		templateUrl: 'modules/project-descriptions/client/views/projectdescription-view.html',
		resolve: {
			description: function ($stateParams, ProjectDescriptionModel) {
				// console.log ('descriptionId = ', $stateParams.descriptionId);
				return ProjectDescriptionModel.getModel ($stateParams.descriptionId);
			}
		},
		controller: function ($scope, description, project) {
			// console.log ('description = ', description);
			$scope.description = description;
			$scope.project = project;
		}
	})

	;

}]);
