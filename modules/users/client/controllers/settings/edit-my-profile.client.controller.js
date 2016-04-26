'use strict';

angular.module('project')
	// General
	.controller('controllerModalMyProfile', controllerModalMyProfile);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: View Project Schedule
//
// -----------------------------------------------------------------------------------
controllerModalMyProfile.$inject = ['$scope', '$state', '$filter', '$modalInstance', 'SALUTATIONS', 'UserModel', '_', 'user'];
/* @ngInject */
function controllerModalMyProfile($scope, $state, $filter, $modalInstance, SALUTATIONS, UserModel, _, user) {
	var myProfile = this;

	myProfile.user = user;
	myProfile.salutations = SALUTATIONS;


	myProfile.calculateName = function() {
		myProfile.user.displayName = [myProfile.user.firstName, myProfile.user.middleName, myProfile.user.lastName].join(' ');
	};

	myProfile.cancel = function () { $modalInstance.dismiss('cancel'); };
	myProfile.ok = function () {
		var isValid = $scope.userForm.$valid;
		
		if (!myProfile.user.username || myProfile.user.username === '') {
			myProfile.user.username = $filter('kebab')( myProfile.user.displayName );
		}
		if (!isValid) {
			$scope.$broadcast('show-errors-check-validity', 'userForm');
			return false;
		}
		UserModel.save (myProfile.user).then( function(res) {
				// console.log('saved');
			$modalInstance.close();
		}).catch( function(err) {
				$modalInstance.dismiss('cancel');
		});

	};
}
