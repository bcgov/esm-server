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
.directive('rolePermissionsModal', function ($state, $modal, Authentication, Application, AccessModel, _, ArtifactModel, VcModel) {
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
					resolve: {
						allRoles: function() {
							return AccessModel.allRoles(scope.context._id);
						},
						roleUsers: function() {
							return AccessModel.roleUsers(scope.context._id);
						},
						permissionRoleIndex: function() {
							return AccessModel.permissionRoleIndex(scope.object._id);
						},
						globalProjectRoles: function() {
							return AccessModel.globalProjectRoles();
						}
					},
					controller: function ($scope, $modalInstance, allRoles, roleUsers, globalProjectRoles, permissionRoleIndex) {
						var s = this;

						var setPermissionRole = function (system, permission, role, value) {
							if (!system.permission[permission]) system.permission[permission] = {};
							if (!system.role[role]) system.role[role] = {};
							system.permission[permission][role] = value;
							system.role[role][permission] = value;
						};

						s.init = function (roleName, showPermissionView) {
							console.log('rolePermissionsModal.init... start');
							// add in 'permissions' from the object...
							// should come from the server, but this is a whole lot quicker...
							if (_.has(scope.object, 'read')){
								_.forEach(scope.object.read, function(v) {
									setPermissionRole(permissionRoleIndex, 'read', v, true);
								});
							}
							if (_.has(scope.object, 'write')){
								_.forEach(scope.object.write, function(v) {
									setPermissionRole(permissionRoleIndex, 'write', v, true);
								});
							}
							if (_.has(scope.object, 'delete')){
								_.forEach(scope.object.delete, function(v) {
									setPermissionRole(permissionRoleIndex, 'delete', v, true);
								});
							}
							s.permissionRoleIndex = permissionRoleIndex;
							s.permissionRoleIndex.schemaName = scope.object._schemaName;
							s.allRoles = allRoles;
							s.roleUsers = roleUsers;
							//scope.object.userCan gets public added in core.menus.service shouldRender, but we don't want it to be in our settable permissions list...
							s.allPermissions = _.keys(scope.object.userCan).filter(function(e) { return e !== 'public'; });
							if (scope.context._id === 'application') {
								// jsherman - 2016-09-01
								// roles and permissions lock down...
								// we only want certain permissions to be set at run time, ones that do not require model defaults for read/write/delete
								// application / system should not expose createRole either...
								s.allPermissions  = _.difference(s.allPermissions, ['read', 'write', 'delete', 'createRole', 'createProject']);
								s.allRoles = _.difference(s.allRoles, globalProjectRoles); // we don't add permissions to 'project' roles at the application level.
							} else if (scope.context._id === scope.object._id) {
								// jsherman - 2016-09-01
								// roles and permissions lock down...
								// we only want certain permissions to be set at run time, ones that do not require model defaults for read/write/delete
								// project should only allow setting of list* permissions./*
								//
								var writePerms = [
									'editTombstone',
									'editSchedule',
									'createArtifact',
									'createValuedComponent',
									'createInspectionReport',
									'createProjectCondition',
									'createProjectComplaint',
									'createProjectInvitation',
									'createDocument',
									'createCommentPeriod',
									'createEnforcement',
									'createProjectUpdate',
									'createProjectGroup'];
								s.allPermissions  = _.difference(s.allPermissions, writePerms);
							}
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
							if (scope.object._schemaName === 'Document') {
								s.name = scope.object.internalOriginalName;
							}
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
						};

						s.init(undefined, true);
						
						$scope.$on('NEW_ROLE_ADDED', function (e, data) {
							if (!_.isEmpty(data.roleName)) {
								if (_.isArray(data.roleName)) {
									_.forEach(data.roleName, function(o) {
										var u = _.find(s.allRoles, function(x) { return x === o; });
										if (!u) {
											s.allRoles.push(o);
										}
										s.currentRole = data.roleName[0];
									});
								} else {
									var u = _.find(s.allRoles, function(x) { return x === data.roleName; });
									if (!u) {
										s.allRoles.push(data.roleName);
									}
									s.currentRole = data.roleName;
								}
							}
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
					}
				})
				.result.then(function (data) {
					AccessModel.setPermissionRoleIndex(data.resource, data.data)
					.then( function () {
						// Need to persist to conaining element in some cases.  e.g.: This is so that
						// when a user clicks on a Vc gear, they are actually changing both the Vc
						// permission as well as the underlying artifact permission.
						if (data.data.schemaName === 'Vc') {
							VcModel.lookup(data.resource)
							.then(function (vc) {
								return ArtifactModel.lookup(vc.artifact);
							})
							.then( function (art) {
								// Change the schemaName or else it won't match.
								data.data.schemaName = 'Artifact';
								AccessModel.setPermissionRoleIndex(art._id, data.data);
							});
						}
					}, function(e) {
						console.log('Error on AccessModel.setPermissionRoleIndex(' + data.resource + ', ' + JSON.stringify(data.data) + ') = ', JSON.stringify(e));
					})
					.then(function() {
						//console.log('> permissions reloading...');
						return;
					})
					.then(function() {
						return Application.reload(Authentication.user ? Authentication.user._id : 0, true);
					}, function(e) {
						//console.log('Error on Application.reload(' + (Authentication.user ? Authentication.user._id : 0) + ', true) = ', JSON.stringify(e));
					})
					.then(function() {
						return AccessModel.resetSessionContext();
					}, function(e) {
						//console.log('Error on AccessModel.resetSessionContext() = ', JSON.stringify(e));
					})
					.then(function() {
						return $state.reload();
					}, function(e) {
						//console.log('Error on state.reload() = ', JSON.stringify(e));
					})
					.then(function() {
						//console.log('< permissions reloaded.');
						return;
					});
				})
				.catch(function (err) {
					//
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
.directive('roleUsersModal', function ($state, $modal, Authentication, Application, AccessModel, _) {
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
					resolve: {
						allRoles: function() {
							return AccessModel.allRoles(scope.context._id);
						},
						userRoleIndex: function() {
							return AccessModel.roleUserIndex(scope.context._id);
						},
						userList: function() {
							return AccessModel.getContextUsers(scope.context._id);
						},
						globalProjectRoles: function() {
							return AccessModel.globalProjectRoles();
						}
					},
					controller: function ($scope, $modalInstance, allRoles, userRoleIndex, userList, globalProjectRoles) {
						var s = this;

						$scope.contacts = [];
						/*
						This stopped working in some environments and setups.
						Very strange, so added in the USER_SEARCH_CHOOSER_SELECTED handler instead.

						$scope.$watch(function(scope) { return scope.contacts; },
							function(data) {
								if (data && data.length > 0) {
									_.forEach(data, function(user) {
										var item =  _.find(s.allUsers, function(o) { return o._id === user._id; });
										if (!item) {
											s.allUsers.push(user);
										}
									});
									if (data.length === 1) {
										s.init(s.allUsers, s.currentRole, data[0].username, s.userView);
									}
									$scope.contacts = [];
								}
							}
						);
						*/

						$scope.$on('USER_SEARCH_CHOOSER_SELECTED', function (e, data) {
							if (data && data.users && data.users.length > 0) {
								_.forEach(data.users, function(user) {
									var item =  _.find(s.allUsers, function(o) { return o._id === user._id; });
									if (!item) {
										s.allUsers.push(user);
									}
								});
								if (data.users.length === 1) {
									s.init(s.allUsers, s.currentRole, data.users[0].username, s.userView, false);
								}
								$scope.contacts = [];
							}
						});

						s.init = function (users, currentRoleName, currentUserName, showUserView, filterGlobalUsers) {
							console.log('roleUsersModal.init... start');
							//
							// all the base data
							//
							var unassignableRoles = [];
							if (scope.context._id !== 'application') {
								unassignableRoles = globalProjectRoles; // only assign to these roles at the application level, not project.
							}
							unassignableRoles.push('public'); // never assign users to public role...

							var globalUsers = [];
							if (filterGlobalUsers) {
								// really only want this done on initial screen load..
								globalUsers = _.transform(userRoleIndex.user, function (result, roles, username) {
									// get only the roles that are marked true...
									var userInRoles = _.transform(roles, function(r, v, k) {
										if (v) {
											r.push(k);
										}
									}, []);
									// see if they have anything assignable...
									var assignableRoles = _.difference(userInRoles, unassignableRoles);
									if (assignableRoles.length === 0) {
										// no assignable roles, so drop from the list...
										result.push(username);
									}
								}, []);
							}

							s.userRoleIndex = userRoleIndex;
							s.allRoles = _.difference(allRoles, unassignableRoles);
							s.allUsers = _.filter(users, function(u) { return globalUsers.indexOf(u.username) < 0; });
							//
							// expose the inputs
							////
							s.context = scope.context;
							s.name = scope.context.name || scope.context.code;
							//
							// these deal with setting the roles by user
							//
							s.userView = showUserView;
							var selectedUser = _.find(s.allUsers, function(o) { return o.username === currentUserName; });
							s.currentUser = (selectedUser) ? selectedUser : (!_.isEmpty(s.allUsers) ? s.allUsers[0] : undefined);

							//
							// these deal with setting the users by role
							//
							s.currentRole = (currentRoleName) ? currentRoleName : (s.allRoles[0] || '');
							console.log('roleUsersModal.init... end');
						};

						s.init(userList, undefined, undefined, true, true);

						$scope.$on('NEW_ROLE_ADDED', function (e, data) {
							if (!_.isEmpty(data.roleName)) {
								if (_.isArray(data.roleName)) {
									_.forEach(data.roleName, function(o) {
										var u = _.find(s.allRoles, function(x) { return x === o; });
										if (!u) {
											s.allRoles.push(o);
										}
										s.currentRole = data.roleName[0];
									});
								} else {
									var u = _.find(s.allRoles, function(x) { return x === data.roleName; });
									if (!u) {
										s.allRoles.push(data.roleName);
									}
									s.currentRole = data.roleName;
								}
							}
						});

						var setUserRole = function (system, user, role, value) {
							if (!system.user[user]) system.user[user] = {};
							if (!system.role[role]) system.role[role] = {};
							system.user[user][role] = value;
							system.role[role][user] = value;
						};
						
						s.clickUser = function (user, role, value) {
							setUserRole(s.userRoleIndex, user.username, role, value);
						};
						s.clickRole = function (user, role, value) {
							setUserRole(s.userRoleIndex, user.username, role, value);
						};
						s.cancel = function () {
							$modalInstance.dismiss('cancel');
						};
						s.ok = function () {
							$modalInstance.close({context: s.context._id, data: s.userRoleIndex});
						};
					}
				})
				.result.then(function (data) {
					AccessModel.setRoleUserIndex(data.context, data.data)
						.then(function() {
							//console.log('> roles reloading...');
							return;
						})
						.then(function() {
							return Application.reload(Authentication.user ? Authentication.user._id : 0, true);
						}, function(e) {
							//console.log('Error on Application.reload(' + (Authentication.user ? Authentication.user._id : 0) + ', true) = ', JSON.stringify(e));
						})
						.then(function() {
							return AccessModel.resetSessionContext();
						}, function(e) {
							//console.log('Error on AccessModel.resetSessionContext() = ', JSON.stringify(e));
						})
						.then(function() {
							return $state.reload();
						}, function(e) {
							//console.log('Error on state.reload() = ', JSON.stringify(e));
						})
						.then(function() {
							//console.log('< roles reloaded.');
							return;
						});
				})
				.catch(function (err) {
					//console.log(err);
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
					size: 'lg',
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
							$rootScope.$broadcast('NEW_USER_ADDED_TO_CONTEXT', {user: s.currentUser});
							$modalInstance.close();
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
								$rootScope.$broadcast('NEW_ROLE_ADDED', {roleName: s.newRole});
								$modalInstance.close();
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
						// don't do live updates to the target...
						s.selected = angular.copy(scope.current);

						s.allRoles = allRoles;
						var index = allRoles.reduce(function (prev, next) {
							prev[next] = next;
							return prev;
						}, {});
						s.cancel = function () {
							$modalInstance.dismiss('cancel');
						};
						s.ok = function () {
							// we have decided to use our selection, so set the target collection....
							scope.current = s.selected;
							$modalInstance.close(scope.current);
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

