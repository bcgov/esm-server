'use strict';

angular.module('organizations')
	.directive('orgSearchChooser', function ($filter, $modal, NgTableParams, ProjectGroupModel, OrganizationModel, _) {
		return {
			restrict: 'A',
			scope: {
				project: '=',
				destination: '=',
				title: '='
			},
			link: function (scope, element, attrs) {
				element.on('click', function () {
					$modal.open({
						animation: true,
						templateUrl: 'modules/organizations/client/views/org-search-chooser.html',
						size: 'lg',
						controllerAs: 's',
						controller: function ($filter, $scope, $modalInstance, _) {
							var s = this;
							s.title = scope.title;
							$scope.cur = scope.destination;

							OrganizationModel.getCollection()
							.then( function (data) {
								if ($scope.cur) {
									_.each(data, function (i) {
										if (i._id === $scope.cur._id) {
											i.Selected = true;
										}
									});
								}
								$scope.orgList = data;
								$scope.tableParams = new NgTableParams ({count:10}, {dataset: $scope.orgList});
								$scope.$apply();
							});

							$scope.toggleItem = function (item) {
								$scope.cur = item;
							};

							$scope.isChecked = function (i) {
								if ($scope.cur && $scope.cur._id === i._id) {
									return true;
								}
							};

							s.cancel = function () {
								$modalInstance.dismiss('cancel');
							};

							s.ok = function () {
								$modalInstance.close($scope.cur);
							};
						}
					}).result.then(function (data) {
						scope.destination = data;
					}).catch(function (err) {
						console.log("err:", err);
					});
				});
			}
		};
	})

	.directive('tmplOrganizationsDisplayEdit', directiveOrganizationsDisplayEdit)
	//.directive('tmplOrganizationsUsersByOrg', directiveOrganizationsUsersByOrg)
;
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Activity Listing
//
// -----------------------------------------------------------------------------------
directiveOrganizationsDisplayEdit.$inject = [];
/* @ngInject */
function directiveOrganizationsDisplayEdit() {
	var directive = {
		restrict: 'E',
		replace: true,
		templateUrl: 'modules/organizations/client/views/organizations-partials/organization-display-edit-form.html',
		controller: 'controllerOrganizationsDisplayEdit',
		controllerAs: 'displayEdit',
		scope: {
			organizationId: '@'
		}
	};
	return directive;
}
/*
function directiveOrganizationsUsersByOrg() {
	var directive = {
		restrict: 'E',
		replace: true,
		templateUrl: 'modules/organizations/client/views/organizations-partials/organization-user-list.html',
		controller: 'controllerOrganizationUsersByOrg',
		controllerAs: 'usersByOrg',
		scope: {
			organizationId: '@',
			mode: '@'
		}
	};
	return directive;
}
*/


	/*
	.directive('tmplOrganizations', directiveOrganizations)
	.directive('tmplOrganizationsList', directiveOrganizationsList)
	.directive('tmplOrganizationsSchedule', directiveOrganizationsSchedule)
	// .directive('tmplOrganizationsPanels', directiveOrganizationsPanels)
	.directive('tmplOrganizationsMap', directiveOrganizationsMap);
	// .directive('tmplOrganizationsFilterBar', directiveOrganizationsFilterBar);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Public Organizations Main
//
// -----------------------------------------------------------------------------------
directiveOrganizations.$inject = [];
// @ngInject
function directiveOrganizations() {
	var directive = {
		restrict: 'E',
		replace: true,
		templateUrl: 'modules/organizations/client/views/organizations.html',
		controller: 'controllerOrganizations',
		controllerAs: 'organizations'
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Organizations List
//
// -----------------------------------------------------------------------------------
// @ngInject
function directiveOrganizationsList() {
	var directive = {
		restrict: 'E',
		replace: true,
		templateUrl: 'modules/organizations/client/views/organizations-partials/organizations-list.html',
		controller: 'controllerOrganizationsList',
		controllerAs: 'organizationList',
		scope: {
			organizations: '='
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Organizations Schedule
//
// -----------------------------------------------------------------------------------
directiveOrganizationsSchedule.$inject = [];
// @ngInject
function directiveOrganizationsSchedule() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/organizations/client/views/organizations-partials/organizations-schedule.html',
		controller: 'controllerOrganizationsList',
		controllerAs: 'organizationList',
		scope: {
			organizations: '='
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Organizations Panels
//
// -----------------------------------------------------------------------------------
// directiveOrganizationsPanels.$inject = [];
// // @ngInject
// function directiveOrganizationsPanels() {
// 	var directive = {
// 		restrict: 'E',
// 		templateUrl: 'modules/organizations/client/views/organizations-partials/organizations-panels.html',
// 		controller: 'controllerOrganizationsList',
// 		controllerAs: 'organizationList',
// 		scope: {
// 			organizations: '='
// 		}
// 	};
// 	return directive;
// }
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Organizations Map
//
// -----------------------------------------------------------------------------------
directiveOrganizationsMap.$inject = ['google'];
// @ngInject
function directiveOrganizationsMap(google) {
	var directive = {
		restrict: 'E',
		replace: true,
		templateUrl: 'modules/organizations/client/views/organizations-partials/organizations-map.html',
		controller: 'controllerOrganizationsList',
		controllerAs: 'organizationList',
		scope: {
			organizations: '='
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Organizations Filter Bar
//
// -----------------------------------------------------------------------------------
// directiveOrganizationsFilterBar.$inject = [];
// // @ngInject
// function directiveOrganizationsFilterBar() {
// 	var directive = {
// 		restrict: 'E',
// 		replace: true,
// 		scope: {
// 			data: '='
// 		},
// 		templateUrl: 'modules/organizations/client/views/organizations-partials/organizations-filter-bar.html',
// 		controller: 'controllerOrganizationsFilterBar',
// 		controllerAs: 'fbc'
// 	};
// 	return directive;
// }
		*/
