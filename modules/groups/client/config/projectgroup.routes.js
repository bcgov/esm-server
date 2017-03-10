'use strict';

angular.module('core').config(['$stateProvider', function ($stateProvider) {
		$stateProvider
			.state('p.group', {
				abstract:true,
				url: '/group',
				template: '<ui-view></ui-view>',
				resolve: {}
			})
			.state('p.group.list', {
				url: '/list',
				templateUrl: 'modules/groups/client/views/group-list.html',
				resolve: {
					groups: function ($stateParams, ProjectGroupModel, project) {
						return ProjectGroupModel.forProject (project._id);
					}
				},
				controller: function ($scope, $modal, $state, Authentication, NgTableParams, _, project, groups,CodeLists) {
					$scope.tableParams = new NgTableParams ({count:10}, {dataset: groups});
					$scope.project = project;
					$scope.authentication = Authentication;
					$scope.projectGroupTypes = CodeLists.projectGroupTypes;
					var self = this;

				},
				controllerAs: 'self'
			})
			.state('p.group.create', {
				url: '/create',
				templateUrl: 'modules/groups/client/views/group-edit.html',
				resolve: {
					group: function(ProjectGroupModel, project) {
						return ProjectGroupModel.new();
					},
					mode: function() {
						return 'create';
					}
				},
				controller: 'GroupEditController',
				controllerAs: 's'
			})
			.state('p.group.edit', {
				url: '/:groupId/edit',
				templateUrl: 'modules/groups/client/views/group-edit.html',
				resolve: {
					group: function ($stateParams, ProjectGroupModel) {
						return ProjectGroupModel.getModel ($stateParams.groupId);
					},
					mode: function() { return 'edit'; }
				},
				controller: 'GroupEditController',
				controllerAs: 's'
			})
			.state('p.group.detail', {
				url: '/:groupId',
				templateUrl: 'modules/groups/client/views/group-view.html',
				resolve: {
					group: function ($stateParams, ProjectGroupModel) {
						return ProjectGroupModel.getModel ($stateParams.groupId);
					},
					mode: function() { return 'detail'; }
				},
				controller: 'GroupEditController',
				controllerAs: 's'
			});
	}]);
