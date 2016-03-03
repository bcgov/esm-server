'use strict';

angular.module ('conditions')

// -------------------------------------------------------------------------
//
// directive for listing conditions
//
// -------------------------------------------------------------------------
.directive ('tmplConditionList', function () {
	return {
		restrict: 'E',
		templateUrl: 'modules/conditions/client/views/condition-list.html',
		controller: 'controllerConditionList',
		controllerAs: 'data'
	};
})

// -------------------------------------------------------------------------
//
// directive for adding or editing a condition
//
// -------------------------------------------------------------------------
.directive ('editConditionModal', ['$modal','$rootScope', function ($modal, $rootScope) {
	return {
		restrict: 'A',
		scope: {
			collection: '=',
			condition: '=',
			mode: '@'
		},
		link : function (scope, element, attrs) {
			console.log('condition modal is running');
			element.on ('click', function () {
				var modalView = $modal.open ({
					animation    : true,
					templateUrl  : 'modules/conditions/client/views/condition-edit.html',
					controller   : 'controllerEditConditionModal',
					controllerAs : 'd',
					scope        : scope,
					size         : 'lg'
				});
				modalView.result.then (function (model) {
					$rootScope.$broadcast('refreshConditionList');
				}, function () {});
			});
		}
	};
}])

;
