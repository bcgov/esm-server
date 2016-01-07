'use strict';

angular.module('user')
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
controllerCompanyEntryForm.$inject = ['$scope'];
/* @ngInject */
function controllerCompanyEntryForm($scope) {
	var uco = this;

	$scope.$watch('project', function(newValue) {
		if (newValue) {
			uco.project = newValue;
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
