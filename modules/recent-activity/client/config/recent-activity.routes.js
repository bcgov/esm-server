'use strict';
// =========================================================================
//
// org routes (under admin)
//
// =========================================================================
angular.module('recent-activity').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
	// -------------------------------------------------------------------------
	//
	// this is the abstract, top level view for recent-activity.
	// we resolve recent-activity to all sub-states
	//
	// -------------------------------------------------------------------------
	.state('admin.recentactivity', {
		data: {roles: ['admin','eao']},
		abstract:true,
		url: '/recentactivity',
		template: '<ui-view></ui-view>',
		controller: function ($scope, projectsLookup) {
			$scope.projects = projectsLookup;
		}
	})
	// -------------------------------------------------------------------------
	//
	// the list state for recent-activity. recent-activity are guaranteed to
	// already be resolved
	//
	// -------------------------------------------------------------------------
	.state('admin.recentactivity.list', {
		url: '/list',
		templateUrl: 'modules/recent-activity/client/views/recent-activity-list.html',
		resolve: {
			recentActivity: function ($stateParams, RecentActivityModel) {
				return RecentActivityModel.getCollection ();
			}
		},
		controller: function ($scope, NgTableParams, recentActivity) {
			$scope.tableParams = new NgTableParams ({count:10}, {dataset: recentActivity});
		}
	})
	.state('news', {
		url: '/news',
		templateUrl: 'modules/recent-activity/client/views/recent-activity-news-list.html',
		resolve: {
			recentActivity: function ($stateParams, RecentActivityModel) {
				return RecentActivityModel.getCollection ();
			}
		},
		controller: function ($scope, NgTableParams, recentActivity) {
			$scope.tableParams = new NgTableParams ({count:10}, {dataset: recentActivity});
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the add, or create state. it is defined before the others so that
	// it does not conflict
	//
	// -------------------------------------------------------------------------
	.state('admin.recentactivity.create', {
		data: {roles: ['admin','edit-recent-activity']},
		url: '/create',
		templateUrl: 'modules/recent-activity/client/views/recent-activity-edit.html',
		resolve: {
			recentActivity: function (RecentActivityModel) {
				return RecentActivityModel.getNew ();
			}
		},
		controller: function ($scope, $state, recentActivity, RecentActivityModel, $filter) {
			$scope.recentActivity = recentActivity;
			var which = 'add';
			$scope.save = function (isValid) {
				if (!isValid) {
					$scope.$broadcast('show-errors-check-validity', 'recentActivityForm');
					return false;
				}

				var p = (which === 'add') ? RecentActivityModel.add ($scope.recentActivity) : RecentActivityModel.save ($scope.recentActivity);
				p.then (function (model) {
					$state.transitionTo('admin.recentactivity.list', {}, {
			  			reload: true, inherit: false, notify: true
					});
				})
				.catch (function (err) {
					console.error (err);
					// alert (err.message);
				});
			};
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the edit state
	//
	// -------------------------------------------------------------------------
	.state('admin.recentactivity.edit', {
		data: {roles: ['admin','edit-recent-activity']},
		url: '/:recentActivityId/edit',
		templateUrl: 'modules/recent-activity/client/views/recent-activity-edit.html',
		resolve: {
			recentActivity: function ($stateParams, RecentActivityModel) {
				return RecentActivityModel.getModel ($stateParams.recentActivityId);
			}
		},
		controller: function ($scope, $state, recentActivity, RecentActivityModel, $filter) {
			$scope.recentActivity = recentActivity;
			var which = 'edit';
			$scope.save = function (isValid) {
				if (!isValid) {
					$scope.$broadcast('show-errors-check-validity', 'recentActivityForm');
					return false;
				}

				var p = (which === 'add') ? RecentActivityModel.add ($scope.recentActivity) : RecentActivityModel.save ($scope.recentActivity);
				p.then (function (model) {
					$state.transitionTo('admin.recentactivity.list', {}, {
			  			reload: true, inherit: false, notify: true
					});
				})
				.catch (function (err) {
					console.error (err);
					// alert (err.message);
				});
			};
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the 'view' mode of a recentactivity. here we are just simply
	// looking at the information for this specific object
	//
	// -------------------------------------------------------------------------
	.state('admin.recentactivity.detail', {
		url: '/:recentActivityId',
		templateUrl: 'modules/recent-activity/client/views/recent-activity-view.html',
		resolve: {
			recentActivity: function ($stateParams, RecentActivityModel) {
				return RecentActivityModel.getModel ($stateParams.recentActivityId);
			}
		},
		controller: function ($scope, recentActivity) {
			$scope.recentActivity = recentActivity;
		}
	})

	;

}]);


