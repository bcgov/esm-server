'use strict';

angular
	.module('user')
	.directive('tmplQuicklinksThumbnails', directiveQuicklinksThumbnails)
	.directive('tmplCompanyEntryForm', directiveCompanyEntryForm)
	.directive('tmplUserEntryForm', directiveUserEntryForm)
	.directive('modalSetSignature', directiveSetSignature)
	.directive('modalEditMyProfile', directiveEditMyProfile);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: User Entry Form
//
// -----------------------------------------------------------------------------------
directiveEditMyProfile.$inject = ['$modal', '_'];
/* @ngInject */
function directiveEditMyProfile($modal, _) {
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
					controllerAs: 'myProfile',
					resolve: {
						user: function (UserModel) {
							return UserModel.me();
						}
					},
					controller: function($scope, $filter, $modalInstance, SALUTATIONS, UserModel, user) {
						var myProfile = this;

						myProfile.user = user;
						myProfile.salutations = SALUTATIONS;

						// Build the signature link
						myProfile.signatureHREF = "/api/document/" + myProfile.user.signature + "/fetch";
						$scope.$on('refreshSig', function() {
							myProfile.user = UserModel.me()
							.then( function (u) {
								myProfile.user = u;
								myProfile.signatureHREF = "/api/document/" + myProfile.user.signature + "/fetch";
							});
							$scope.$apply();
						});
						myProfile.calculateName = function () {
							myProfile.user.displayName = [myProfile.user.firstName, myProfile.user.middleName, myProfile.user.lastName].join(' ');
						};

						myProfile.cancel = function () {
							$modalInstance.dismiss('cancel');
						};
						myProfile.ok = function () {
							var isValid = $scope.userForm.$valid;

							if (!isValid) {
								$scope.$broadcast('show-errors-check-validity', 'userForm');
								return false;
							}

							UserModel.save(myProfile.user).then(function (res) {
								// console.log('saved');
								$modalInstance.close();
							}).catch(function (err) {
								$modalInstance.dismiss('cancel');
							});

						};
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
directiveSetSignature.$inject = ['$modal', '$rootScope', 'ENV'];
/* @ngInject */
function directiveSetSignature($modal, $rootScope, ENV) {
	var directive = {
		restrict:'A',
		link : function(scope, element, attrs) {
			element.on('click', function() {
				var modalDocUpload = $modal.open({
					animation: true,
					templateUrl: 'modules/documents/client/views/partials/document-upload-signature.html',
					controllerAs: 'sigUp',
					controller: 'controllerSignatureUpload'
				});
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
