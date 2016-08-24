'use strict';
// =========================================================================
//
// These are all directives used with permissions and roles throughout the
// system
//
// =========================================================================
angular.module('core')

// -------------------------------------------------------------------------
//
// a modal directive with isolated scope for viewing and
// interacting with a list of roles and permissions for a given context
// and thingamajig
//
// -------------------------------------------------------------------------
.directive('rolePermissionsModal', function ($modal, Authentication, Application, AccessModel, _) {
	return {
		restrict: 'A',
		scope: {
			context: '=',
			object: '='
		},
		link: function (scope, element, attrs) {
			element.on('click', function () {
				$modal.open({
					animation: true,
					templateUrl: 'modules/core/client/views/role-permissions-modal.html',
					controllerAs: 's',
					windowClass: 'permissions-modal',
					size: 'lg',
					resolve: {},
					controller: function ($scope, $modalInstance) {
						var s = this;
						
						var allRoles, roleUsers, permissionRoleIndex;
						
						var setPermissionRole = function (system, permission, role, value) {
							if (!system.permission[permission]) system.permission[permission] = {};
							if (!system.role[role]) system.role[role] = {};
							system.permission[permission][role] = value;
							system.role[role][permission] = value;
						};
						
						$scope.$on('NEW_ROLE_ADDED', function (e, data) {
							s.init(data.roleName, s.permissionView);
						});
						
						s.clickRole = function (permission, role, value) {
							setPermissionRole(s.permissionRoleIndex, permission, role, value);
						};
						
						s.clickPermission = function (permission, role, value) {
							setPermissionRole(s.permissionRoleIndex, permission, role, value);
						};
						
						s.cancel = function () {
							$modalInstance.dismiss('cancel');
						};
						
						s.ok = function () {
							$modalInstance.close({resource: s.object._id, data: s.permissionRoleIndex});
						};

						s.init = function (roleName, showPermissionView) {
							console.log('rolePermissionsModal.init... start');
							AccessModel.allRoles(scope.context._id)
							.then(function (ar) {
								allRoles = ar;
								console.log('rolePermissionsModal.init... allRoles');
								return AccessModel.roleUsers(scope.context._id);
							}).then(function (ru) {
								roleUsers = ru;
								console.log('rolePermissionsModal.init... roleUsers');
								return AccessModel.permissionRoleIndex(scope.object._id);
							}).then(function (rp) {
								console.log('rolePermissionsModal.init... permissionRoleIndex');

								// add in 'permissions' from the object...
								// should come from the server, but this is a whole lot quicker...
								if (_.has(scope.object, 'read')){
									_.forEach(scope.object.read, function(v) {
										setPermissionRole(rp, 'read', v, true);
									});
								}
								if (_.has(scope.object, 'write')){
									_.forEach(scope.object.write, function(v) {
										setPermissionRole(rp, 'write', v, true);
									});
								}
								if (_.has(scope.object, 'delete')){
									_.forEach(scope.object.delete, function(v) {
										setPermissionRole(rp, 'delete', v, true);
									});
								}

								permissionRoleIndex = rp;
								s.permissionRoleIndex = permissionRoleIndex;
								s.permissionRoleIndex.schemaName = scope.object._schemaName;
								console.log('rolePermissionsModal.index:', s.permissionRoleIndex);
								s.allRoles = allRoles;
								s.roleUsers = roleUsers;
								//scope.object.userCan gets public added in core.menus.service shouldRender, but we don't want it to be in our settable permissions list...
								s.allPermissions = _.keys(scope.object.userCan).filter(function(e) { return e !== 'public'; });
								s.allRoles = s.allRoles.concat(['public', '*']);
								// console.log ('permissionRoleIndex', permissionRoleIndex);
								// console.log ('allRoles', allRoles);
								// console.log ('roleUsers', roleUsers);
								// console.log ('allPermissions', s.allPermissions);
								//
								// expose the inputs
								//
								s.context = scope.context;
								s.object = scope.object;
								s.name = scope.object.name || scope.object.code || scope.object._id;
								//
								// these deal with setting the roles by permission
								//
								s.permissionView = showPermissionView;
								s.currentPermission = s.allPermissions[0] || '';
								//
								// these deal with setting the permissions by role
								//
								s.currentRole = (roleName) ? roleName : (s.allRoles[0] || '');
								console.log('rolePermissionsModal.init... end');
							});
						};
						
						s.init(undefined, true);
					}
				})
				.result.then(function (data) {
					AccessModel.setPermissionRoleIndex(data.resource, data.data);
				})
				.catch(function (err) {
				});
			});
		}
	};
})
.directive('tmplPermissionsGear', function () {
	return {
		restrict: 'E',
		templateUrl: 'modules/core/client/views/role-permissions-gear.html',
		scope: {
			context: '=',
			object: '='
		},
		controller: function($scope, Authentication, _) {
			var permCtrl = this;
			permCtrl.showGear = !_.isEmpty(Authentication.user);
			if ($scope.context) {
				// not sure if this is correct, but go with it for now.
				// do we need to check against the object?
				permCtrl.showGear = permCtrl.showGear && $scope.context.userCan.managePermissions;
			}
		},
		controllerAs: 'permCtrl'
	};
})
// -------------------------------------------------------------------------
//
// a modal directive with isolated scope for viewing and
// interacting with a list of roles and users for a given context
//
// -------------------------------------------------------------------------
.directive('roleUsersModal', function ($modal, Authentication, Application, AccessModel, _) {
	return {
		restrict: 'A',
		scope: {
			context: '=',
			role: '='
		},
		link: function (scope, element, attrs) {
			element.on('click', function () {
				$modal.open({
					animation: true,
					templateUrl: 'modules/core/client/views/role-users-modal.html',
					controllerAs: 's',
					windowClass: 'permissions-modal',
					size: 'lg',
					resolve: {},
					controller: function ($scope, $modalInstance) {
						var s = this;
						
						var allRoles, roleUsers, userRoleIndex;
						
						$scope.$on('NEW_ROLE_ADDED', function (e, data) {
							s.init(data.roleName, s.currentUser, s.userView);
						});
						
						$scope.$on('NEW_USER_ADDED_TO_CONTEXT', function (e, data) {
							s.init(s.currentRole, data.user, s.userView);
						});
						
						var setUserRole = function (system, user, role, value) {
							if (!system.user[user]) system.user[user] = {};
							if (!system.role[role]) system.role[role] = {};
							system.user[user][role] = value;
							system.role[role][user] = value;
						};
						
						s.clickUser = function (user, role, value) {
							setUserRole(s.userRoleIndex, user, role, value);
						};
						s.clickRole = function (user, role, value) {
							setUserRole(s.userRoleIndex, user, role, value);
						};
						s.cancel = function () {
							$modalInstance.dismiss('cancel');
						};
						s.ok = function () {
							$modalInstance.close({context: s.context._id, data: s.userRoleIndex});
						};
						
						s.init = function (currentRoleName, currentUserName, showUserView) {
							console.log('roleUsersModal.init... start');
							AccessModel.allRoles(scope.context._id)
							.then(function (ar) {
								allRoles = ar;
								console.log('roleUsersModal.init... allRoles');
								return AccessModel.roleUserIndex(scope.context._id);
							}).then(function (rui) {
								userRoleIndex = rui;
								console.log('roleUsersModal.init... userRoleIndex');
								//
								// all the base data
								//
								s.userRoleIndex = userRoleIndex;
								s.allRoles = allRoles;
								s.allUsers = _.keys(userRoleIndex.user);
								//
								// TBD: This needs to be set according to the current user.
								// if its the admin, then default to eao-member, if not, then
								// see if this user is an eao-admin or a pro-admin, then
								// default to either eao-member or pro-member
								//
								s.defaultRole = 'eao-member';
								// console.log ('userRoleIndex', userRoleIndex);
								// console.log ('allRoles', allRoles);
								// console.log ('allUsers', s.allUsers);
								//
								// expose the inputs
								//
								s.context = scope.context;
								s.name = scope.context.name || scope.context.code || scope.context.code;
								//
								// these deal with setting the roles by user
								//
								s.userView = showUserView;
								s.currentUser = (currentUserName) ? currentUserName: (s.allUsers[0] || '');
								
								//
								// these deal with setting the users by role
								//
								s.currentRole = (currentRoleName) ? currentRoleName : (s.allRoles[0] || '');
								console.log('roleUsersModal.init... end');
							});
						};
						
						s.init(undefined, undefined, true);
					}
				})
				.result.then(function (data) {
					AccessModel.setRoleUserIndex(data.context, data.data);
				})
				.catch(function (err) {
				});
			});
		}
	};
})
.directive('tmplRolesGear', function () {
	return {
		restrict: 'E',
		templateUrl: 'modules/core/client/views/role-users-gear.html',
		scope: {
			context: '=',
			role: '='
		}
	};
})
// -------------------------------------------------------------------------
//
// A simple modal and its little icon thingsy for adding roles to a context
//
// -------------------------------------------------------------------------
.directive('addUserToContextModal', function ($modal, Authentication, Application, AccessModel, UserModel, _) {
	return {
		restrict: 'A',
		scope: {
			context: '=',
			role: '='
		},
		link: function (scope, element, attrs) {
			element.on('click', function () {
				$modal.open({
					animation: true,
					templateUrl: 'modules/core/client/views/add-user-context-modal.html',
					controllerAs: 's',
					size: 'md',
					resolve: {
						allUsers: function (UserModel) {
							return UserModel.allUsers();
						}
					},
					controller: function ($rootScope, $scope, $modalInstance, allUsers) {
						var s = this;
						//
						// all the base data
						//
						s.defaultRole = scope.role;
						s.context = scope.context;
						s.name = scope.context.name || scope.context.code || scope.context.code;
						s.allUsers = allUsers;
						s.currentUser = '';
						// console.log ('defaultRole:', s.defaultRole);
						// console.log ('allusers:', s.allUsers);
						//
						// expose the inputs
						//
						s.cancel = function () {
							$modalInstance.dismiss('cancel');
						};
						s.ok = function () {
							// console.log ('new user is ', s.currentUser);
							// console.log ('default role is ', s.defaultRole);
							// console.log ('context is  ', s.context.code);
							$rootScope.$broadcast('NEW_USER_ADDED_TO_CONTEXT', {user: s.currentUser});
							AccessModel.addRoleUser({
								context: s.context._id,
								role: s.defaultRole,
								user: s.currentUser
							})
							.then($modalInstance.close());
						};
					}
				})
				.result.then(function () {
				})
				.catch(function (err) {
				});
			});
		}
	};
})
.directive('tmplAddUserToContext', function () {
	return {
		restrict: 'E',
		templateUrl: 'modules/core/client/views/add-user-context-gear.html',
		scope: {
			context: '=',
			role: '='
		}
	};
})

// -------------------------------------------------------------------------
//
// A simple modal and its little icon thingsy for adding roles to a context
//
// -------------------------------------------------------------------------
.directive('roleNewModal', function ($modal, Authentication, Application, AccessModel, _) {
	return {
		restrict: 'A',
		scope: {
			context: '='
		},
		link: function (scope, element, attrs) {
			element.on('click', function () {
				$modal.open({
					animation: true,
					templateUrl: 'modules/core/client/views/role-new-modal.html',
					controllerAs: 's',
					size: 'md',
					controller: function ($rootScope, $scope, $modalInstance) {
						var s = this;
						//
						// all the base data
						//
						s.newRole = '';
						s.isOK = true;
						//
						// expose the inputs
						//
						s.context = scope.context;
						s.name = scope.context.name || scope.context.code || scope.context.code;
						s.cancel = function () {
							$modalInstance.dismiss('cancel');
						};
						s.ok = function () {
							if (s.newRole === '') return $modalInstance.dismiss('cancel');
							else {
								AccessModel.addRoleIfUnique(s.context._id, s.newRole)
								.then(function (isOk) {
									if (isOk) {
										$rootScope.$broadcast('NEW_ROLE_ADDED', {roleName: s.newRole});
										$modalInstance.close();
									}
									else {
										s.isOK = false;
										$scope.$apply();
									}
								});
							}
						};
					}
				})
				.result.then(function () {
				})
				.catch(function (err) {
				});
			});
		}
	};
})
.directive('tmplRoleNew', function () {
	return {
		restrict: 'E',
		templateUrl: 'modules/core/client/views/role-new-gear.html',
		scope: {
			context: '='
		}
	};
})
// -------------------------------------------------------------------------
//
// a modal role chooser (multiple)
//
// -------------------------------------------------------------------------
.directive('roleChooser', function ($modal, AccessModel, _) {
	return {
		restrict: 'A',
		scope: {
			context: '=',
			current: '='
		},
		link: function (scope, element, attrs) {
			element.on('click', function () {
				$modal.open({
					animation: true,
					templateUrl: 'modules/core/client/views/role-chooser.html',
					controllerAs: 's',
					size: 'md',
					resolve: {
						allRoles: function (AccessModel) {
							return AccessModel.allRoles(scope.context._id);
						}
					},
					controller: function ($scope, $modalInstance, allRoles) {
						var s = this;
						s.selected = scope.current;
						s.allRoles = allRoles;
						var index = allRoles.reduce(function (prev, next) {
							prev[next] = next;
							return prev;
						}, {});
						s.cancel = function () {
							$modalInstance.dismiss('cancel');
						};
						s.ok = function () {
							$modalInstance.close(s.selected);
						};
						s.dealwith = function (id) {
							var i = s.selected.indexOf(id);
							if (i !== -1) {
								s.selected.splice(i, 1);
							}
							else {
								s.selected.push(id);
							}
						};
					}
				})
				.result.then(function (data) {
					// console.log ('selected = ', data);
				})
				.catch(function (err) {
				});
			});
		}
	};
})

;

