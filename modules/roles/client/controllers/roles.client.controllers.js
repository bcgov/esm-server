'use strict';

angular.module('roles')
    .controller('controllerPermissionMatrix', controllerPermissionMatrix)
    .filter('accessHasRole', filterAccessHasRole);
    
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Permission Matrix
//
// -----------------------------------------------------------------------------------
controllerPermissionMatrix.$inject = ['sRoles', 'rTargetObject', 'rTargetObjectType', '_', '$modalInstance'];
/* @ngInject */
function controllerPermissionMatrix(sRoles, rTargetObject, rTargetObjectType, _, $modalInstance) {
	var permMatrix = this;

	permMatrix.permissions = {}; //rTargetObject.access;
	permMatrix.keys = ['read', 'write', 'watch'];

	_.each(permMatrix.keys, function(key) {
		permMatrix.permissions[key] = [];
	});

	// get system roles
	sRoles.getRoles().then( function(res) {
	 	permMatrix.roles = res.data;
	});

	// on save, pass complete permission structure to the server
	permMatrix.ok = function () { 
		$modalInstance.close();
	};
	permMatrix.cancel = function () { $modalInstance.dismiss('cancel'); };


	permMatrix.togglePermission = function(role, key) {
		if (_.indexOf( permMatrix.permissions[key], role ) > -1) {
			// it's here so remove it.
			_.pull(permMatrix.permissions[key], role);
		} else {
			// it's not here, add it.
			permMatrix.permissions[key].push(role);
		} 
	};

}
// -----------------------------------------------------------------------------------
//
// FILTER: Has role.
//
// -----------------------------------------------------------------------------------
filterAccessHasRole.$inject = ['_'];
/* @ngInject */
function filterAccessHasRole(_) {
	return function(perms, role, key) {
		return _.indexOf(perms[key], role) > -1;
	}
}