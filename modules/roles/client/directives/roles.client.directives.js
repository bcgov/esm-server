'use strict';

angular.module('roles')
    .directive('modalPermissionMatrix', directiveModalPermissionMatrix)
    .directive('modalUsersByRoles', directiveUsersByRoles);
    
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
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Users by Roles
//
// -----------------------------------------------------------------------------------
directiveUsersByRoles.$inject = ['$modal'];
/* @ngInject */
function directiveUsersByRoles($modal) {
	var directive = {
		restrict:'A',
		scope : {
			sourceObject: '='
		},
		link : function(scope, element, attrs) {
			element.on('click', function() {
				var modalUsersByRoles = $modal.open({
					animation: true,
					templateUrl: 'modules/roles/client/views/partials/modal-users-by-roles.html',
					controller: 'controllerUsersByRoles',
					controllerAs: 'usersByRoles',
					scope: scope,
					size: 'lg',
					resolve: {
						rSourceObject: function() { return scope.sourceObject; }
					}
				});
				modalUsersByRoles.result.then(function () {}, function () {});
			});
		}
    };
    return directive;
}

