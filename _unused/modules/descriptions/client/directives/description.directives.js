'use strict';

angular.module ('descriptions')

// -------------------------------------------------------------------------
//
// directive for listing descriptions
//
// -------------------------------------------------------------------------
.directive ('tmplDescriptionList', function () {
	return {
		restrict: 'E',
		templateUrl: 'modules/descriptions/client/views/description-list.html',
		controller: 'controllerDescriptionList',
		controllerAs: 'data'
	};
})

// -------------------------------------------------------------------------
//
// directive for adding or editing a description
//
// -------------------------------------------------------------------------
.directive ('editDescriptionModal', ['$modal','$rootScope', function ($modal, $rootScope) {
	return {
		restrict: 'A',
		scope: {
			collection: '=',
			description: '=',
			mode: '@'
		},
		link : function (scope, element, attrs) {
			// console.log('editDescriptionModal is running');
			element.on ('click', function () {
				var modalView = $modal.open ({
					animation    : true,
					templateUrl  : 'modules/descriptions/client/views/description-edit.html',
					controller   : 'controllerEditDescriptionModal',
					controllerAs : 'd',
					scope        : scope,
					size         : 'lg'
				});
				modalView.result.then (function (model) {
					$rootScope.$broadcast('refreshDescriptionList');
				}, function () {});
			});
		}
	};
}])

;
