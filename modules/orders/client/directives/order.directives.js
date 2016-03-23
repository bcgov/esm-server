'use strict';

angular.module ('orders')

// -------------------------------------------------------------------------
//
// directive for listing orders
//
// -------------------------------------------------------------------------
.directive ('tmplOrderList', function () {
	return {
		restrict: 'E',
		templateUrl: 'modules/orders/client/views/order-list.html',
		controller: 'controllerOrderList',
		controllerAs: 'data'
	};
})

// -------------------------------------------------------------------------
//
// directive for adding or editing a order
//
// -------------------------------------------------------------------------
.directive ('editOrderModal', ['$modal','$rootScope', function ($modal, $rootScope) {
	return {
		restrict: 'A',
		scope: {
			collection: '=',
			order: '=',
			mode: '@'
		},
		link : function (scope, element, attrs) {
			// console.log('editOrderModal is running');
			element.on ('click', function () {
				var modalView = $modal.open ({
					animation    : true,
					templateUrl  : 'modules/orders/client/views/order-edit.html',
					controller   : 'controllerEditOrderModal',
					controllerAs : 'd',
					scope        : scope,
					size         : 'lg'
				});
				modalView.result.then (function (model) {
					$rootScope.$broadcast('refreshOrderList');
				}, function () {});
			});
		}
	};
}])

;
