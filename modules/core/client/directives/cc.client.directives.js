'use strict';

angular.module('core')



// -------------------------------------------------------------------------
//
// a modal directive with isolated scope for viewing and
// interacting with a list of roles and permissions for a given context
// and thingamajig
//
// -------------------------------------------------------------------------
.directive ('rolePermissionsModal', function ($modal, Authentication, Application, AccessModel, _) {
	return {
		restrict: 'A',
		scope: {
			context: '=',
			object: '='
		},
		link : function(scope, element, attrs) {
			element.on('click', function () {
				$modal.open ({
					animation: true,
					templateUrl: 'modules/core/client/views/role-permissions-modal.html',
					controllerAs: 's',
					size: 'md',
					resolve: {
						allRoles: function (AccessModel) {
							return AccessModel.allRoles (scope.context.code);
						},
						roleUsers: function (AccessModel) {
							return AccessModel.roleUsers (scope.context.code);
						},
						permissionRoleIndex: function (AccessModel) {
							return AccessModel.permissionRoleIndex (scope.object._id);
						}
					},
					controller: function ($scope, $modalInstance, allRoles, roleUsers, permissionRoleIndex) {
						var s = this;
						var setPermissionRole = function (system, permission, role, value) {
							if (!system.permission[permission]) system.permission[permission] = {};
							if (!system.role[role]) system.role[role] = {};
							system.permission[permission][role] = value;
							system.role[role][permission] = value;
						};
						//
						// all the base data
						//
						s.permissionRoleIndex = permissionRoleIndex;
						s.allRoles        = allRoles;
						s.roleUsers       = roleUsers;
						s.allPermissions  = _.keys (scope.object.userCan);
						s.allRoles = s.allRoles.concat (['public', '*']);
						console.log ('permissionRoleIndex', permissionRoleIndex);
						console.log ('allRoles', allRoles);
						console.log ('roleUsers', roleUsers);
						console.log ('allPermissions', s.allPermissions);
						//
						// expose the inputs
						//
						s.context         = scope.context;
						s.object          = scope.object;
						s.name            = scope.object.name || scope.object.code || scope.object._id;
						//
						// these deal with setting the roles by permission
						//
						s.permissionView  = true;
						s.currentPermission = s.allPermissions[0] || '';
						s.clickRole = function (permission, role, value) {
							setPermissionRole (s.permissionRoleIndex, permission, role, value);
						};
						//
						// these deal with setting the permissions by role
						//
						s.currentRole = s.allRoles[0] || '';
						s.clickPermission = function (permission, role, value) {
							setPermissionRole (s.permissionRoleIndex, permission, role, value);
						};
						s.cancel = function () { $modalInstance.dismiss ('cancel'); };
						s.ok = function () {
							$modalInstance.close ({resource:s.object._id, data:s.permissionRoleIndex});
						};
					}
				})
				.result.then (function (data) {
					AccessModel.setPermissionRoleIndex (data.resource, data.data);
				})
				.catch (function (err) {});
			});
		}
	};
})
.directive ('tmplPermissionsGear', function () {
	return {
		restrict: 'E',
		templateUrl: 'modules/core/client/views/role-permissions-gear.html',
		scope: {
			context: '=',
			object: '='
		}
	};
})
// -------------------------------------------------------------------------
//
// a modal directive with isolated scope for viewing and
// interacting with a list of roles and users for a given context
//
// -------------------------------------------------------------------------
.directive ('roleUsersModal', function ($modal, Authentication, Application, AccessModel, _) {
	return {
		restrict: 'A',
		scope: {
			context: '=',
			role: '='
		},
		link : function(scope, element, attrs) {
			element.on('click', function () {
				$modal.open ({
					animation: true,
					templateUrl: 'modules/core/client/views/role-users-modal.html',
					controllerAs: 's',
					size: 'md',
					resolve: {
						allRoles: function (AccessModel) {
							return AccessModel.allRoles (scope.context.code);
						},
						userRoleIndex: function (AccessModel) {
							return AccessModel.roleUserIndex (scope.context.code);
						}
					},
					controller: function ($scope, $modalInstance, allRoles, userRoleIndex) {
						var s = this;
						var setUserRole = function (system, user, role, value) {
							if (!system.user[user]) system.user[user] = {};
							if (!system.role[role]) system.role[role] = {};
							system.user[user][role] = value;
							system.role[role][user] = value;
						};
						//
						// all the base data
						//
						s.userRoleIndex = userRoleIndex;
						s.allRoles      = allRoles;
						s.allUsers      = _.keys (userRoleIndex.user);
						//
						// TBD: This needs to be set according to the current user.
						// if its the admin, then default to eao-member, if not, then
						// see if this user is an eao-admin or a pro-admin, then
						// default to either eao-member or pro-member
						//
						s.defaultRole   = 'eao-member';
						console.log ('userRoleIndex', userRoleIndex);
						console.log ('allRoles', allRoles);
						console.log ('allUsers', s.allUsers);
						//
						// expose the inputs
						//
						s.context         = scope.context;
						s.name            = scope.context.name || scope.context.code || scope.context.code;
						//
						// these deal with setting the roles by user
						//
						s.userView  = true;
						s.currentUser = s.allUsers[0] || '';
						s.clickRole = function (user, role, value) {
							setUserRole (s.userRoleIndex, user, role, value);
						};
						//
						// these deal with setting the users by role
						//
						s.currentRole = s.allRoles[0] || '';
						s.clickUser = function (user, role, value) {
							setUserRole (s.userRoleIndex, user, role, value);
						};
						s.cancel = function () { $modalInstance.dismiss ('cancel'); };
						s.ok = function () {
							$modalInstance.close ({context:s.context.code, data:s.userRoleIndex});
						};
					}
				})
				.result.then (function (data) {
					AccessModel.setRoleUserIndex (data.context, data.data);
				})
				.catch (function (err) {});
			});
		}
	};
})
.directive ('tmplRolesGear', function () {
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
.directive ('addUserToContextModal', function ($modal, Authentication, Application, AccessModel, UserModel, _) {
	return {
		restrict: 'A',
		scope: {
			context: '=',
			role: '='
		},
		link : function(scope, element, attrs) {
			element.on('click', function () {
				$modal.open ({
					animation: true,
					templateUrl: 'modules/core/client/views/add-user-context-modal.html',
					controllerAs: 's',
					size: 'md',
					resolve: {
						allUsers: function (UserModel) {
							return UserModel.allUsers ();
						}
					},
					controller: function ($scope, $modalInstance, allUsers) {
						var s = this;
						//
						// all the base data
						//
						s.defaultRole = scope.role;
						s.context     = scope.context;
						s.name        = scope.context.name || scope.context.code || scope.context.code;
						s.allUsers    = allUsers;
						s.currentUser = '';
						console.log ('defaultRole:', s.defaultRole);
						console.log ('allusers:', s.allUsers);
						//
						// expose the inputs
						//
						s.cancel = function () { $modalInstance.dismiss ('cancel'); };
						s.ok = function () {
							console.log ('new user is ', s.currentUser);
							console.log ('default role is ', s.defaultRole);
							console.log ('context is  ', s.context.code);
							AccessModel.addRoleUser ({
								context : s.context.code,
								role    : s.defaultRole,
								user    : s.currentUser
							})
							.then ($modalInstance.close ());
						};
					}
				})
				.result.then (function () {})
				.catch (function (err) {});
			});
		}
	};
})
.directive ('tmplAddUserToContext', function () {
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
.directive ('roleNewModal', function ($modal, Authentication, Application, AccessModel, _) {
	return {
		restrict: 'A',
		scope: {
			context: '='
		},
		link : function(scope, element, attrs) {
			element.on('click', function () {
				$modal.open ({
					animation: true,
					templateUrl: 'modules/core/client/views/role-new-modal.html',
					controllerAs: 's',
					size: 'md',
					controller: function ($scope, $modalInstance) {
						var s = this;
						//
						// all the base data
						//
						s.newRole = '';
						s.isOK = true;
						//
						// expose the inputs
						//
						s.context         = scope.context;
						s.name            = scope.context.name || scope.context.code || scope.context.code;
						s.cancel = function () { $modalInstance.dismiss ('cancel'); };
						s.ok = function () {
							if (s.newRole === '') return $modalInstance.dismiss ('cancel');
							else {
								AccessModel.addRoleIfUnique (s.context.code, s.newRole)
								.then (function (isOk) {
									if (isOk) {
										$modalInstance.close ();
									}
									else {
										s.isOK = false;
										$scope.$apply ();
									}
								});
							}
						};
					}
				})
				.result.then (function () {})
				.catch (function (err) {});
			});
		}
	};
})
.directive ('tmplRoleNew', function () {
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
.directive ('roleChooser', function ($modal, AccessModel, _) {
	return {
		restrict: 'A',
		scope: {
			context: '=',
			current: '='
		},
		link : function(scope, element, attrs) {
			element.on('click', function () {
				$modal.open ({
					animation: true,
					templateUrl: 'modules/core/client/views/role-chooser.html',
					controllerAs: 's',
					size: 'md',
					resolve: {
						allRoles: function (AccessModel) {
							return AccessModel.allRoles (scope.context.code);
						}
					},
					controller: function ($scope, $modalInstance, allRoles) {
						var s = this;
						s.selected = scope.current;
						s.allRoles = allRoles;
						var index = allRoles.reduce (function (prev, next) {
							prev[next] = next;
							return prev;
						}, {});
						s.cancel = function () { $modalInstance.dismiss ('cancel'); };
						s.ok = function () {
							$modalInstance.close (s.selected);
						};
						s.dealwith = function (id) {
							var i = s.selected.indexOf (id);
							if (i !== -1) {
								s.selected.splice (i, 1);
							}
							else {
								s.selected.push (id);
							}
						};
					}
				})
				.result.then (function (data) {
					// console.log ('selected = ', data);
				})
				.catch (function (err) {});
			});
		}
	};
})

;

// // -------------------------------------------------------------------------
// //
// // a template style directive with isolated scope for viewing and
// // interacting with a list of artifacts
// //
// // -------------------------------------------------------------------------
// .directive ('tmplArtifactList', function ($state, ArtifactModel) {
// 	return {
// 		restrict: 'E',
// 		templateUrl: 'modules/artifacts/client/views/artifact-list.html',
// 		scope: {
// 			project: '='
// 		},
// 		controller: function ($scope, NgTableParams, Authentication) {
// 			var s = this;
// 			s.public = (!Authentication.user);
// 			this.selectType = function (typeobject) {
// 				this.addtype = typeobject;
// 				this.addTypeName = typeobject.name;
// 			};
// 			this.addType = function () {
// 				if (s.addtype) {
// 					// console.log ('adding new artifact of type '+s.addtype);
// 					ArtifactModel.newFromType (s.addtype.code, $scope.project._id)
// 					.then (function () {
// 						s.init ();
// 					});
// 				}
// 			};
// 			this.init = function () {
// 				// In this view we don't want individual VC's to show up, instead they will
// 				// show up in the VC page.
// 				ArtifactModel.forProjectFilterType ($scope.project._id, "valued-component").then (function (c) {
// 					s.tableParams = new NgTableParams ({count:10}, {dataset: c});
// 					// console.log ("artifacts = ", c);
// 					$scope.$apply ();
// 				});
// 				if (!s.public) {
// 					ArtifactModel.availableTypes ($scope.project._id).then (function (c) {
// 						// console.log("available types:",c);
// 						s.availableTypes = c;
// 						s.addtype = null;
// 						s.addTypeName = "";
// 						$scope.$apply ();
// 					});
// 				}
// 			};
// 			this.init ();
// 		},
// 		controllerAs: 's'
// 	};
// })
// // -------------------------------------------------------------------------
// //
// // this wraps up the complete display of an artifact, either a template or
// // a document type, in either edit or view mode for each
// //
// // -------------------------------------------------------------------------
// .directive ('tmplArtifactDisplay', function () {
// 	return {
// 		restrict: 'E',
// 		templateUrl: 'modules/artifacts/client/views/artifact-display.html',
// 		scope: {
// 			project: '=',
// 			artifact: '=',
// 			mode: '='
// 		},
// 		controller: function ($scope, ArtifactModel, VcModel, _) {
// 			$scope.removeVCArtifact = function (obj) {
// 				// We've been asked to remove this VC artifact from the VC artifact collection
// 				var mainArtifact = obj.mainArtifact;
// 				var vcArtifact = obj.vcArtifact;
// 				// Remove it from the main
// 				ArtifactModel.lookup(mainArtifact)
// 				.then( function (item) {
// 					var index = _.findIndex(item.valuedComponents, function(o) {
// 					    return vcArtifact === o._id;
// 					});
// 					if (index !== -1) {
// 						// Remove it from the main
// 						// console.log("index:", index);
// 						item.valuedComponents.splice(index, 1);
// 						$scope.artifact = item;
// 						$scope.$apply();
// 					}
// 				});
// 			};
// 		}
// 	};
// })
// .directive ('tmplArtifactVcList', function () {
// 	return {
// 		restrict: 'E',
// 		templateUrl: 'modules/artifacts/client/views/artifact-display-vc-list.html',
// 		scope: {
// 			project: '=',
// 			artifact: '=',
// 			mode: '='
// 		}
// 	};
// })
// .directive ('tmplArtifactVcEdit', function () {
// 	return {
// 		restrict: 'E',
// 		templateUrl: 'modules/artifacts/client/views/artifact-display-vc-edit.html',
// 		scope: {
// 			project: '=',
// 			artifact: '=',
// 			mode: '='
// 		},
// 		controller: function ($scope, $state, VcModel, ArtifactModel) {
// 			// Set the other fields to the VC model
// 			VcModel.lookup($scope.artifact.valuedComponents[0]._id)
// 			.then( function (vc) {
// 				$scope.vc = vc;
// 				$scope.$apply();
// 			});
// 			$scope.save = function () {
// 				if ($scope.artifact) {
// 					VcModel.saveModel($scope.vc)
// 					.then ( function (vc) {
// 						return ArtifactModel.lookup($scope.artifact._id);
// 					})
// 					.then ( function (art) {
// 						// console.log("art: ", art);
// 						// Update the name of the artifact appropriately
// 						art.name = $scope.vc.title;
// 						return ArtifactModel.saveModel(art);
// 					})
// 					.then( function () {
// 						$state.go ('p.vc.list', {reload: true});
// 					});
// 				}
// 			};
// 		}
// 	};
// })
// // -------------------------------------------------------------------------
// //
// // this wraps up the complete display of an artifact, either a template or
// // a document type, in either edit or view mode for each
// //
// // -------------------------------------------------------------------------
// .directive ('artifactDisplayModal', function ($modal) {
// 	return {
// 		restrict    : 'A',
// 		scope       : {
// 			project  : '=',
// 			artifact : '=',
// 			mode     : '='
// 		},
// 		link : function (scope, element, attrs) {
// 			element.on('click', function () {
// 				$modal.open ({
// 					animation   : true,
// 					templateUrl : 'modules/artifacts/client/views/artifact-display-modal.html',
// 					size        : 'lg',
// 					controller  : function ($scope, $modalInstance) {
// 						$scope.project  = scope.project;
// 						$scope.artifact = scope.artifact;
// 						$scope.mode     = scope.mode;
// 						$scope.cancel   = function () { $modalInstance.dismiss ('cancel'); };
// 					}
// 				});
// 			});
// 		}
// 	};
// })
// .directive ('artifactVc', function ($modal, ArtifactModel, _, VcModel) {
// 	return {
// 		restrict: 'A',
// 		scope: {
// 			project: '=',
// 			artifact: '=',
// 			current: '='
// 		},
// 		link : function(scope, element, attrs) {
// 			element.on('click', function () {
// 				$modal.open ({
// 					animation: true,
// 					templateUrl: 'modules/artifacts/client/views/artifact-vc.html',
// 					controllerAs: 's',
// 					size: 'md',
// 					resolve: {
// 						artifacts: function (ArtifactModel) {
// 							// console.log("resolving artifacts");
// 							return ArtifactModel.forProjectGetType (scope.project._id, "valued-component");
// 						}
// 					},
// 					controller: function ($scope, $modalInstance, artifacts) {
// 						var s = this;
// 						s.artifacts = artifacts;
// 						// console.log("current:",scope.current);
// 						s.cancel = function () { $modalInstance.dismiss ('cancel'); };
// 						s.ok = function () {
// 							// Selected artifact is:
// 							// console.log("Selected:",s.selected);
// 							$modalInstance.close (s.selected);
// 						};
// 					}
// 				})
// 				.result.then (function (data) {
// 					// References the selected id of the VC artifact to add to the VC package
// 					// console.log("vc id:",data);
// 					ArtifactModel.lookup(data)
// 					.then( function (vcartifact) {
// 						// console.log("artifactvc:",vcartifact);
// 						var vc = vcartifact.valuedComponents[0];
// 						var found = _.find(scope.current.valuedComponents, function (item) {
// 							return item.artifact === data;
// 						});
// 						if (!found) {
// 							scope.current.valuedComponents.push(vc);
// 						}
// 					});
// 				})
// 				.catch (function (err) {});
// 			});
// 		}
// 	};
// })

