'use strict';
// =========================================================================
//
// org routes (under admin)
//
// =========================================================================
angular.module('organizations').config(['$stateProvider', function ($stateProvider) {
    $stateProvider
    // -------------------------------------------------------------------------
    //
    // this is the abstract, top level view for orgs.
    // we resolve orgs to all sub-states
    //
    // -------------------------------------------------------------------------
    .state('admin.organization', {
        data: {permissions: ['listOrganizations']},
        abstract:true,
        url: '/organization',
        template: '<ui-view></ui-view>',
        resolve: {
            orgs: function ($stateParams, OrganizationModel) {
                return OrganizationModel.getSorted ("name");
            }
        }
    })
    // -------------------------------------------------------------------------
    //
    // the list state for orgs. orgs are guaranteed to
    // already be resolved
    //
    // -------------------------------------------------------------------------
    .state('admin.organization.list', {
        url: '/list',
        templateUrl: 'modules/organizations/client/views/organization-list.html',
        controller: function ($scope, NgTableParams, Application, Authentication, orgs, CodeLists) {
            $scope.authentication = Authentication;
            $scope.application = Application;
            $scope.orgs = orgs;
            $scope.tableParams = new NgTableParams ({count:10}, {dataset: orgs});
            $scope.organizationTypes = CodeLists.organizationTypes;
        },
    })
    // -------------------------------------------------------------------------
    //
    // this is the add, or create state. it is defined before the others so that
    // it does not conflict
    //
    // -------------------------------------------------------------------------
    .state('admin.organization.create', {
        data: {permissions: ['createOrganization']},
        url: '/create',
        templateUrl: 'modules/organizations/client/views/org-edit.html',
        resolve: {
            org: function (OrganizationModel) {
                return OrganizationModel.getNew ();
            }
        },
		controllerAs: 'orgEditControl',
        controller: function ($scope, $state, org, OrganizationModel, CodeLists, $filter) {
			$scope.org = org;
			$scope.users = [];
			$scope.projects = [];
			$scope.mode = 'add';
			$scope.readonly = false;
			$scope.enableDelete = false;
			$scope.enableSave = true;
			$scope.enableEdit = false;
			$scope.enableAddContact = false;
			$scope.enableEditContact = false;
			$scope.enableRemoveContact = false;
			$scope.srefReturn = 'admin.organization.list';

			var orgEditControl = this;
			orgEditControl.title = 'Add Organization';
			orgEditControl.cancel = function() {
				$state.transitionTo($scope.srefReturn, {}, {reload: true, inherit: false, notify: true});
			};

			// we pass this to the user entry directive/controller for communication between the two...
			$scope.orgEntryControl = {
			};



			$scope.org = org;
            var which = 'add';
			$scope.types = CodeLists.organizationTypes.active;
			$scope.registeredIns = CodeLists.organizationRegisteredIns.active;
			$scope.save = function (isValid) {
                if (!isValid) {
                    $scope.$broadcast('show-errors-check-validity', 'organizationForm');
                    return false;
                }
                $scope.org.code = $filter('kebab')($scope.org.name);
                var p = (which === 'add') ? OrganizationModel.add ($scope.org) : OrganizationModel.save ($scope.org);
                p.then (function (model) {
                    $state.transitionTo('admin.organization.list', {}, {
                        reload: true, inherit: false, notify: true
                    });
                })
                .catch (function (err) {
                    console.error (err);
                    // alert (err.message);
                });
            };
        },
    })
    // -------------------------------------------------------------------------
    //
    // this is the edit state
    //
    // -------------------------------------------------------------------------
    .state('admin.organization.edit', {
        data: {permissions: ['createOrganization']},
        url: '/:orgId/edit',
        templateUrl: 'modules/organizations/client/views/org-edit.html',
        resolve: {
            org: function ($stateParams, OrganizationModel) {
                return OrganizationModel.getModel ($stateParams.orgId);
            },
            users: function (org, OrganizationModel) {
                return OrganizationModel.getUsers (org._id);
            },
			projects: function(org, ProjectModel) {
				return ProjectModel.forProponent(org._id);
			}
        },
		controllerAs: 'orgEditControl',
		controller: function ($scope, $state, NgTableParams, org, users, projects, OrganizationModel, CodeLists, $filter, $modal, _, UserModel) {
            $scope.org = org;
			$scope.users = users;
			$scope.projects = projects;
			$scope.mode = 'edit';
			$scope.readonly = false;
			$scope.enableDelete = true;
			$scope.enableSave = true;
			$scope.enableEdit = false;
			$scope.enableAddContact = false;
			$scope.enableEditContact = true;
			$scope.enableRemoveContact = true;
			$scope.srefReturn = 'admin.organization.list';

			var orgEditControl = this;
			orgEditControl.title = 'Edit Organization';
			orgEditControl.cancel = function() {
				$state.transitionTo($scope.srefReturn, {}, {reload: true, inherit: false, notify: true});
			};

			// we pass this to the user entry directive/controller for communication between the two...
			$scope.orgEntryControl = {
			};
        }
    })
    // -------------------------------------------------------------------------
    //
    // this is the 'view' mode of a org. here we are just simply
    // looking at the information for this specific object
    //
    // -------------------------------------------------------------------------
    .state('admin.organization.detail', {
        url: '/:orgId',
        templateUrl: 'modules/organizations/client/views/org-edit.html',
        resolve: {
            org: function ($stateParams, OrganizationModel) {
                return OrganizationModel.getModel ($stateParams.orgId);
            },
            users: function (org, OrganizationModel) {
                return OrganizationModel.getUsers (org._id);
            },
			projects: function (org, ProjectModel) {
				return ProjectModel.forProponent(org._id);
			}
        },
		controllerAs: 'orgEditControl',
        controller: function ($scope, $state, NgTableParams, org, users, projects, UserModel, OrganizationModel, ProjectModel, CodeLists) {
            $scope.org = org;
			$scope.users = users;
			$scope.projects = projects;
			$scope.mode = 'edit';
			$scope.readonly = true;
			$scope.enableDelete = false;
			$scope.enableSave = false;
			$scope.enableEdit = true;
			$scope.enableAddContact = true;
			$scope.enableEditContact = true;
			$scope.enableRemoveContact = true;
			$scope.srefReturn = 'admin.organization.list';

			var orgEditControl = this;
			orgEditControl.title = 'View Organization';

			orgEditControl.cancel = function() {
				$state.transitionTo($scope.srefReturn, {}, {reload: true, inherit: false, notify: true});
			};
			orgEditControl.edit = function() {
				$state.transitionTo('admin.organization.edit', {orgId : $scope.org._id}, {reload: true, inherit: false, notify: true});
			};

			// we pass this to the entry directive/controller for communication between the two...
			$scope.orgEntryControl = {
			};
		}
    })

    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    //
    // -------------------------------------------------------------------------
    // USERS
    // -------------------------------------------------------------------------
    //
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    .state('admin.organization.user', {
        data: {permissions: ['createOrganization']},
        abstract:true,
        url: '/:orgId/user',
        template: '<ui-view></ui-view>',
        resolve: {
            org: function ($stateParams, OrganizationModel) {
                return OrganizationModel.getModel ($stateParams.orgId);
            },
            //roles: function (RoleModel) {
            //    return RoleModel.getSystemRoles ({isProjectDefault:false});
            //}
        },
    })
	// -------------------------------------------------------------------------
	//
	// user create state
	//
	// -------------------------------------------------------------------------
		.state('admin.organization.user.create', {
			data: {permissions: ['createOrganization']},
			url: '/create',
			templateUrl: 'modules/users/client/views/user-edit.html',
			resolve: {
				user: function (UserModel) {
					return UserModel.getNew ();
				}
			},
			controllerAs: 'userEditControl',
			controller: function ($scope, $state, $filter, $modal, Authentication, user, org) {
				$scope.user = user;
				$scope.org = org;
				$scope.mode = 'add';
				$scope.readonly = false;
				$scope.enableDelete = false;
				$scope.enableSave = true;
				$scope.enableEdit = false;
				$scope.enableSetOrganization = false;
				$scope.enableSignature = false;
				$scope.enableNotes = true;
				$scope.showDisplayName = false;
				$scope.showUsername = false;
				//$scope.srefReturn = 'admin.user.list';

				var userEditControl = this;
				userEditControl.title = 'Add Contact';
				userEditControl.cancel = function() {
					$state.transitionTo('admin.organization.detail', {orgId: org._id}, {reload: true, inherit: false, notify: true});
				};
				userEditControl.onSave = function() {
					$state.transitionTo('admin.organization.detail', {orgId: org._id}, {reload: true, inherit: false, notify: true});
				};
				// we pass this to the user entry directive/controller for communication between the two...
				$scope.userEntryControl = {
					onCancel: userEditControl.cancel,
					onSave: userEditControl.onSave
				};
			}
		})
		// -------------------------------------------------------------------------
		//
		// this is the edit state
		//
		// -------------------------------------------------------------------------
		.state('admin.organization.user.edit', {
			data: {permissions: ['createOrganization']},
			url: '/:userId/edit',
			templateUrl: 'modules/users/client/views/user-edit.html',
			resolve: {
				user: function ($stateParams, UserModel) {
					return UserModel.getModel ($stateParams.userId);
				},
				orgs: function(OrganizationModel) {
					return OrganizationModel.getCollection();
				}
			},
			controllerAs: 'userEditControl',
			controller: function ($scope, $state, $filter, $modal, Authentication, user, org) {
				$scope.user = user;
				$scope.mode = 'edit';
				$scope.readonly = false;
				$scope.enableDelete = true;
				$scope.enableSave = true;
				$scope.enableEdit = false;
				$scope.enableSetOrganization = false;
				$scope.enableSignature = true;
				$scope.enableNotes = true;
				$scope.showDisplayName = true;
				$scope.showUsername = true;
				//$scope.srefReturn = 'admin.user.list';

				var userEditControl = this;
				userEditControl.title = 'Edit Contact';
				userEditControl.cancel = function() {
					$state.transitionTo('admin.organization.detail', {orgId: org._id}, {reload: true, inherit: false, notify: true});
				};
				userEditControl.onSave = function() {
					$state.transitionTo('admin.organization.detail', {orgId: org._id}, {reload: true, inherit: false, notify: true});
				};
				userEditControl.onDelete = function() {
					$state.transitionTo('admin.organization.detail', {orgId: org._id}, {reload: true, inherit: false, notify: true});
				};
				// we pass this to the user entry directive/controller for communication between the two...
				$scope.userEntryControl = {
					onCancel: userEditControl.cancel,
					onSave: userEditControl.onSave,
					onDelete: userEditControl.onDelete
				};
			}
		})
		// -------------------------------------------------------------------------
		//
		// this is the 'view' state
		//
		// -------------------------------------------------------------------------
		.state('admin.organization.user.detail', {
			data: {permissions: ['createOrganization']},
			url: '/:userId',
			templateUrl: 'modules/users/client/views/user-edit.html',
			resolve: {
				user: function ($stateParams, UserModel) {
					return UserModel.getModel ($stateParams.userId);
				}
			},
			controllerAs: 'userEditControl',
			controller: function ($scope, $state, $filter, $modal, Authentication, user, org) {
				$scope.user = user;
				$scope.org = org;
				$scope.mode = 'edit';
				$scope.readonly = true;
				$scope.enableDelete = false;
				$scope.enableSave = false;
				$scope.enableEdit = true;
				$scope.enableSetOrganization = false;
				$scope.enableSignature = true;
				$scope.enableNotes = true;
				$scope.showDisplayName = true;
				$scope.showUsername = true;
				//$scope.srefReturn = 'admin.user.list';

				var userEditControl = this;
				userEditControl.title = 'View Contact';

				userEditControl.cancel = function() {
					$state.transitionTo('admin.organization.detail', {orgId: org._id}, {reload: true, inherit: false, notify: true});
				};
				userEditControl.edit = function() {
					$state.transitionTo('admin.organization.user.edit', {orgId: org._id, userId: user._id}, {reload: true, inherit: false, notify: true});
				};

				// we pass this to the user entry directive/controller for communication between the two...
				$scope.userEntryControl = {
					onCancel: userEditControl.cancel
				};
			}
		})
	;
}]);
