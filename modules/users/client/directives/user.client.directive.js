'use strict';

angular
	.module('user')
	.directive('tmplQuicklinksThumbnails', directiveQuicklinksThumbnails)
	.directive('tmplCompanyEntryForm', directiveCompanyEntryForm)
	.directive('tmplUserEntryForm', directiveUserEntryForm)
	.directive('modalEditMyProfile', directiveEditMyProfile);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: User Entry Form
//
// -----------------------------------------------------------------------------------
directiveEditMyProfile.$inject = ['$modal', 'UserModel'];
/* @ngInject */
function directiveEditMyProfile($modal, UserModel) {
	var directive = {
		restrict:'A',
		scope : {
			project: '='
		},
		link : function(scope, element, attrs) {
			element.on('click', function() {
				var modalDocView = $modal.open({
					animation: true,
					templateUrl: 'modules/users/client/views/settings/modal-edit-profile.client.view.html',
					controller: 'controllerModalMyProfile',
					controllerAs: 'myProfile',
					resolve: {
						user: function () {
							return UserModel.me();
						}
					},
					size: 'lg'
				});
				modalDocView.result.then(function (data) {
					scope.user = data;
				}, function () {});
			});
		}
	};
	return directive;
}

// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Modal Project Schedule
//
// -----------------------------------------------------------------------------------
directiveQuicklinksThumbnails.$inject = [];
/* @ngInject */
function directiveQuicklinksThumbnails() {

	var directive = {
		restrict: 'E',
		templateUrl: 'modules/users/client/views/user-partials/user-quicklinks.html',
		controller: 'controllerUsersQuicklinks',
		controllerAs: 'uql'
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Company Entry Form
//
// -----------------------------------------------------------------------------------
directiveCompanyEntryForm.$inject = [];
/* @ngInject */
function directiveCompanyEntryForm() {

	var directive = {
		restrict: 'E',
		templateUrl: 'modules/users/client/views/user-partials/user-company.html',
		controller: 'controllerCompanyEntryForm',
		controllerAs: 'uco',
		scope: {
			company: '='
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: User Entry Form
//
// -----------------------------------------------------------------------------------
directiveUserEntryForm.$inject = [];
/* @ngInject */
function directiveUserEntryForm() {

	var directive = {
		restrict: 'E',
		templateUrl: 'modules/users/client/views/user-partials/user-user.html',
		controller: 'controllerUserEntryForm',
		controllerAs: 'uu',
		scope: {
			project: '=',
			company: '=',
			user: '='
		}
	};
	return directive;
}

// -----------------------------------------------------------------------------------
//
// DIRECTIVE: List Users by Organization
//
// -----------------------------------------------------------------------------------
//directiveUsersByOrg.$inject = [];
function directiveUsersByOrg() {
	var directive = {
		restrict: 'E',
		replace: true,
		templateUrl: 'modules/users/client/views/users-partials/users-by-org-list.html',
		controller: 'controllerUsersByOrg',
		controllerAs: 'usersByOrg',
		scope: {
			organizationId: '@',
			mode: '@'
		}
	};
	return directive;
}
