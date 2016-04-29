'use strict';

angular.module('roles')
	.directive ('modalSetObjectPermissions', function ($modal, _, RoleModel, ProjectModel) {
	return {
		restrict: 'A',
		scope: {
			project: '=',
			targetObject: '=',
			targetObjectType: '='
		},
		link : function(scope, element, attrs) {
			element.on('click', function() {
				var modalDocView = $modal.open({
					animation: true,
					templateUrl: 'modules/roles/client/views/partials/modal-object-permissions.html',
					scope: scope,
					resolve: {
						projectRoles: function(RoleModel) {
							return RoleModel.getRolesInProject(scope.project._id);
						}
					},
					controllerAs: 'self',
					controller: function ($scope, $filter, $modalInstance, _, projectRoles, RoleModel) {
						var self = this;

						self.objectRoles = {
							method: 'set',
							objects: [scope.targetObject],
							type: scope.targetObjectType,
							permissions: {}
						};

						this.ok = function() {
							RoleModel.setPermissions(self.objectRoles)
								.then(function(res) {
									// what do we do here?
									// TODO: show error or show success?
									// we've got the updated target object back...
									scope.targetObject = res;
									$modalInstance.dismiss('ok');
								});
						};
						this.cancel = function() {
							$modalInstance.dismiss('cancel');
						};

						this.togglePermission = function(role, key) {
							if (_.indexOf( self.objectRoles.permissions[key], role ) > -1) {
								// it's here so remove it.
								_.pull(self.objectRoles.permissions[key], role);
							} else {
								// it's not here, add it.
								self.objectRoles.permissions[key].push(role);
							}
						};

						this.init = function () {
							self.keys = ['read', 'write', 'submit'];

							_.each(self.keys, function(key) {
								self.objectRoles.permissions[key] = self.objectRoles.objects[0][key];
							});

							// load up the roles... (should be all roles...)
							self.roles = projectRoles;
						};
						this.init ();
					},
					size: 'lg'
				});
				modalDocView.result.then(function (data) {
					console.log(data);
				}, function () {});
			});
		}
	};
})
	.directive('modalPermissionMatrix', directiveModalPermissionMatrix);
    
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: General User Permissions
//
// -----------------------------------------------------------------------------------
directiveModalPermissionMatrix.$inject = ['$modal'];
/* @ngInject */
function directiveModalPermissionMatrix($modal) {
	var directive = {
		restrict:'A',
		scope : {
			targetObject: '='
		},
		link : function(scope, element, attrs) {
			element.on('click', function() {
				var modalPermissionMatrix = $modal.open({
					animation: true,
					templateUrl: 'modules/roles/client/views/partials/modal-permission-matrix.html',
					controller: 'controllerPermissionMatrix',
					controllerAs: 'permMatrix',
					scope: scope,
					size: 'lg',
					resolve: {
						rTargetObject: function() { return scope.targetObject; },					
					}
				});
				modalPermissionMatrix.result.then(function () {}, function () {});
			});
		}
    };
    return directive;
}

