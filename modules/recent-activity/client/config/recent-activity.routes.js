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
		data: {permissions: ['listNews']},
		abstract:true,
		url: '/recentactivity',
		template: '<ui-view></ui-view>',
		resolve: {
			publishedProjects: function (ProjectModel) {
				return ProjectModel.published();
			}
		},
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
			projects: function (ProjectModel) {
				return ProjectModel.lookup();
			},
			recentActivity: function ($stateParams, RecentActivityModel, projects, _) {
				return RecentActivityModel.getCollection ()
				.then( function (data) {
					_.each(data, function (item) {
						if (item.project) {
							var proj = projects[item.project];
							item.code = proj ? proj.code : '';
							item.projectName = proj ? proj.name : '';
						}
						item.activeDesc = item.active ? 'Active' : 'Inactive';
					});
					return data;
				});
			}
		},
		controller: function (_, $scope, $state, NgTableParams, recentActivity, projects, RecentActivityModel, $modal, AlertService) {
			$scope.tableParams = new NgTableParams ({count:10, sorting: {dateAdded: 'desc'}}, {dataset: recentActivity});

			var s = this;
			s.typeArray = [];
			s.activeDescArray = [];
			s.busy = false;

			var items = _(angular.copy(recentActivity)).chain().flatten();
			items.pluck('type').unique().value().map( function(item) {
				s.typeArray.push({id: item, title: item});
			});
			items.pluck('activeDesc').unique().value().map( function(item) {
				var id = 'Active' === item ? true : false;
				s.activeDescArray.push({id: id, title: item});
			});

			this.confirmText = function(o) {
				return 'Are you sure you would like to permanently delete activity "' + o.headline + '"?';
			};
			this.deleteActivity = function (o) {
				return RecentActivityModel.deleteId(o._id)
				.then(
					function (result) {
						$state.reload();
						AlertService.success('Activity/Update '+ o.headline + ' was deleted!');
					},
					function (error) {
						$state.reload();
						AlertService.error('Activity/Update '+ o.headline + ' could not be deleted! ' + error.message);
					});
			};

			this.onNewsClick = function(activity, event) {
				if (!activity.project) {
					event.preventDefault();
				} else {
					$state.go('p.detail', {projectid: projects[activity.project].code });
				}
			};

			this.onPinActivity = function (activity) {
				// Update this record
				s.busy = true;
				RecentActivityModel.togglePinnedActivity(activity)
				.then(function (data) {
					$state.go($state.current, {}, {reload: true});
				}, function (err) {
					// Error
					s.busy = false;
					$modal.open({
						animation: true,
						templateUrl: 'modules/recent-activity/client/views/pinned-warning.html',
						controller: function ($scope, $state, $modalInstance, _) {
							var self = this;

							self.msg = err.message;

							self.ok = function () {
								$modalInstance.close('ok');
							};

							self.cancel = function () {
								$modalInstance.dismiss('cancel');
							};
						},
						controllerAs: 'self',
						scope: $scope,
						size: 'lg'
					});
				});
			};
		},
		controllerAs: 's'
	})
	.state('news', {
		url: '/news',
		templateUrl: 'modules/recent-activity/client/views/recent-activity-news-list.html',
		resolve: {
			projects: function (ProjectModel) {
				return ProjectModel.lookup();
			},
			recentActivity: function ($stateParams, RecentActivityModel, projects, _) {
				return RecentActivityModel.getCollection ()
				.then( function (data) {
					_.each(data, function (item) {
						if (item.project) {
							var proj = projects[item.project];
							item.code = proj ? proj.code : '';
							item.projectName = proj ? proj.name : '';
						}
						item.activeDesc = item.active ? 'Active' : 'Inactive';
					});
					return data;
				});
			}
		},
		controller: function ($scope, $state, NgTableParams, recentActivity, projects) {
			$scope.tableParams = new NgTableParams ({count:10, sorting: {dateAdded: 'desc'}}, {dataset: recentActivity});

			this.onNewsClick = function(activity, event) {
				if (!activity.project) {
					event.preventDefault();
				} else {
					$state.go('p.detail', {projectid: projects[activity.project].code });
				}
			};
		},
		controllerAs: 's'
	})
	// -------------------------------------------------------------------------
	//
	// this is the add, or create state. it is defined before the others so that
	// it does not conflict
	//
	// -------------------------------------------------------------------------
	.state('admin.recentactivity.create', {
		data: {permissions: ['createNews']},
		url: '/create',
		templateUrl: 'modules/recent-activity/client/views/recent-activity-edit.html',
		resolve: {
			recentActivity: function (RecentActivityModel) {
				return RecentActivityModel.getNew ();
			}
		},
		controller: function ($scope, $state, Authentication, recentActivity, RecentActivityModel, $filter, publishedProjects) {
			$scope.publishedProjects = publishedProjects;
			$scope.recentActivity = recentActivity;
			$scope.recentActivity.addedBy = Authentication.user._id;
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
		data: {permissions: ['createNews']},
		url: '/:recentActivityId/edit',
		templateUrl: 'modules/recent-activity/client/views/recent-activity-edit.html',
		resolve: {
			recentActivity: function ($stateParams, RecentActivityModel) {
				return RecentActivityModel.getModel ($stateParams.recentActivityId);
			}
		},
		controller: function ($scope, $state, recentActivity, RecentActivityModel, $filter, publishedProjects) {
			$scope.publishedProjects = publishedProjects;
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


