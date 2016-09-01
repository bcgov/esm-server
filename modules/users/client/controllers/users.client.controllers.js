'use strict';

angular.module('users')
	// General
	.controller('controllerUsersQuicklinks', controllerUsersQuicklinks)
	.controller('controllerCompanyEntryForm', controllerCompanyEntryForm)
	.controller('controllerUserEntryForm', controllerUserEntryForm)
	.controller('controllerModalUserList', controllerModalUserList);


// -----------------------------------------------------------------------------------
//
// CONTROLLER: user Quicklinks
//
// -----------------------------------------------------------------------------------
controllerUsersQuicklinks.$inject = ['Users'];
/* @ngInject */
function controllerUsersQuicklinks(Users) {
	var uql = this;

	// Users.getQuicklinks().then( function(res) {
	// 	uql.quicklinks = res.data;
	// });

}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: company entry form
//
// -----------------------------------------------------------------------------------
controllerCompanyEntryForm.$inject = ['$scope', 'PROVINCES'];
/* @ngInject */
function controllerCompanyEntryForm($scope, PROVINCES) {
	var uco = this;
	uco.provs = PROVINCES;

	$scope.$watch('company', function(newValue) {
		if (newValue) {
			uco.proponent = newValue;
			// console.log ('uco.proponent = ',uco.proponent);
		}
	});

}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: user entry form
//
// -----------------------------------------------------------------------------------
controllerUserEntryForm.$inject = ['$scope'];
/* @ngInject */
function controllerUserEntryForm($scope) {
	var uu = this;

	$scope.$watch('user', function(newValue) {
		if (newValue) {
			uu.user = newValue;
			// console.log (uu.user);
		}
	});
	$scope.$watch('project', function(newValue) {
		if (newValue) {
			uu.project = newValue;
		}
	});

}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: user entry form
//
// -----------------------------------------------------------------------------------
controllerModalUserList.$inject = ['$scope', 'rUsers'];
/* @ngInject */
function controllerModalUserList($scope, rUsers) {
	var userList = this;

	userList.users = rUsers;

}
