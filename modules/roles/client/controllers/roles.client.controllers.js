'use strict';

angular.module('roles')
    .controller('controllerPermissionMatrix', controllerPermissionMatrix)
    .controller('controllerUsersByRoles', controllerUsersByRoles)    
    .filter('accessHasRole', filterAccessHasRole)
    .filter('accessInferredRole', filterAccessInferredRole);
    
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Permission Matrix
//
// -----------------------------------------------------------------------------------
controllerPermissionMatrix.$inject = ['sRoles', 'rTargetObject', '_', '$modalInstance', 'PROJECT_ROLES'];
/* @ngInject */
function controllerPermissionMatrix(sRoles, rTargetObject, _, $modalInstance, PROJECT_ROLES) {
	var permMatrix = this;

	permMatrix.permissions = {};
	permMatrix.keys = ['read', 'write', 'submit'];

	_.each(permMatrix.keys, function(key) {
		permMatrix.permissions[key] = rTargetObject[key];
	});

	// get system roles
 	permMatrix.roles = PROJECT_ROLES;

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
// CONTROLLER: Permission Matrix
//
// -----------------------------------------------------------------------------------
controllerUsersByRoles.$inject = ['rSourceObject', '_', '$modalInstance'];
/* @ngInject */
function controllerUsersByRoles(rSourceObject, _, $modalInstance) {
	var usersByRoles = this;
	
	usersByRoles.roles = ['admin', 'project-team', 'working-group', 'first-nations', 'consultant'];

	// on save, pass complete permission structure to the server
	usersByRoles.ok = function () {
		$modalInstance.close();
	};
	usersByRoles.cancel = function () { $modalInstance.dismiss('cancel'); };
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
	};
}
// -----------------------------------------------------------------------------------
//
// FILTER: Has inferred role.
//
// -----------------------------------------------------------------------------------
filterAccessInferredRole.$inject = ['_'];
/* @ngInject */
function filterAccessInferredRole(_) {
	return function(perms, role, key) {

		switch(key) {
			case 'read':
				// yes if in write or submit
				return (_.indexOf(perms.write, role) > -1) || (_.indexOf(perms.submit, role) > -1);
			case 'write':
				// yes if in submit
				return (_.indexOf(perms.submit, role) > -1);
			case 'submit':
				// yes if in submit
				return false;
		}
	};
}