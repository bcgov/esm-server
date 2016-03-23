'use strict';
// =========================================================================
//
// org routes (under admin)
//
// =========================================================================
angular.module('orgs').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
	// -------------------------------------------------------------------------
	//
	// this is the abstract, top level view for orgs.
	// we resolve orgs to all sub-states
	//
	// -------------------------------------------------------------------------
	.state('admin.org', {
		abstract:true,
		url: '/org',
		template: '<ui-view></ui-view>',
		resolve: {
			orgs: function ($stateParams, OrgModel) {
				return OrgModel.getCollection ();
			}
		}
	})
	// -------------------------------------------------------------------------
	//
	// the list state for orgs. orgs are guaranteed to
	// already be resolved
	//
	// -------------------------------------------------------------------------
	.state('admin.org.list', {
		url: '/list',
		templateUrl: 'modules/orgs/client/views/org-list.html',
		controller: function ($scope, NgTableParams, orgs) {
			$scope.orgs = orgs;
			$scope.tableParams = new NgTableParams ({count:10}, {dataset: orgs});
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the add, or create state. it is defined before the others so that
	// it does not conflict
	//
	// -------------------------------------------------------------------------
	.state('admin.org.create', {
		url: '/create',
		templateUrl: 'modules/orgs/client/views/org-edit.html',
		resolve: {
			org: function (OrgModel) {
				return OrgModel.getNew ();
			}
		},
		controller: function ($scope, $state, org, OrgModel, $filter) {
			$scope.org = org;
			var which = 'add';
			$scope.save = function (isValid) {
				if (!isValid) {
					$scope.$broadcast('show-errors-check-validity', 'organizationForm');
					return false;
				}
				$scope.org.code = $filter('kebab')($scope.org.name);
				var p = (which === 'add') ? OrgModel.add ($scope.org) : OrgModel.save ($scope.org);
				p.then (function (model) {
					$state.transitionTo('admin.org.list', {}, {
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
	.state('admin.org.edit', {
		url: '/:orgId/edit',
		templateUrl: 'modules/orgs/client/views/org-edit.html',
		resolve: {
			org: function ($stateParams, OrgModel) {
				return OrgModel.getModel ($stateParams.orgId);
			}
		},
		controller: function ($scope, $state, org, OrgModel, $filter) {
			$scope.org = org;
			var which = 'edit';
			$scope.save = function (isValid) {
				if (!isValid) {
					$scope.$broadcast('show-errors-check-validity', 'organizationForm');
					return false;
				}
				$scope.org.code = $filter('kebab')($scope.org.name);
				var p = (which === 'add') ? OrgModel.add ($scope.org) : OrgModel.save ($scope.org);
				p.then (function (model) {
					$state.transitionTo('admin.org.list', {}, {
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
	// this is the 'view' mode of a org. here we are just simply
	// looking at the information for this specific object
	//
	// -------------------------------------------------------------------------
	.state('admin.org.detail', {
		url: '/:orgId',
		templateUrl: 'modules/orgs/client/views/org-view.html',
		resolve: {
			org: function ($stateParams, OrgModel) {
				return OrgModel.getModel ($stateParams.orgId);
			}
		},
		controller: function ($scope, org) {
			$scope.org = org;
		}
	})

	;

}]);


