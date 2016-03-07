'use strict';

angular.module ('orgs')

// -------------------------------------------------------------------------
//
// directive for listing orgs
//
// -------------------------------------------------------------------------
.directive ('tmplOrgList', function () {
	return {
		restrict: 'E',
		templateUrl: 'modules/orgs/client/views/org-list.html',
		controller: 'controllerOrgList',
		controllerAs: 'data'
	};
})

// -------------------------------------------------------------------------
//
// directive for adding or editing a org
//
// -------------------------------------------------------------------------
.directive ('editOrgModal', ['$modal','$rootScope', function ($modal, $rootScope) {
	return {
		restrict: 'A',
		scope: {
			collection: '=',
			org: '=',
			mode: '@'
		},
		link : function (scope, element, attrs) {
			console.log('editOrgModal is running');
			element.on ('click', function () {
				var modalView = $modal.open ({
					animation    : true,
					templateUrl  : 'modules/orgs/client/views/org-edit.html',
					controller   : 'controllerEditOrgModal',
					controllerAs : 'd',
					scope        : scope,
					size         : 'lg'
				});
				modalView.result.then (function (model) {
					$rootScope.$broadcast('refreshOrgList');
				}, function () {});
			});
		}
	};
}])

;
