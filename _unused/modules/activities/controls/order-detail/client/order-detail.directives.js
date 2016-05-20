'use strict';

angular.module('control')
	.directive('modalOrderDetail',  directiveControlOrderDetail);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Control, Order Detail
//
// -----------------------------------------------------------------------------------
directiveControlOrderDetail.$inject = ['$modal'];
/* @ngInject */
function directiveControlOrderDetail($modal) {
	var directive = {
		restrict: 'A',
		scope: {
			project: '=',
			context: '@'
		},
		link : function(scope, element, attrs) {
			// console.log('this thing');
			element.on('click', function() {
				var modalOrderDetail = $modal.open({
					animation: true,
					templateUrl: 'modules/activities/controls/order-detail/client/order-detail.html',
					controller: 'controllerControlOrderDetail',
					controllerAs: 'ctrlOrderDetail',
					scope: scope,
					size: 'md',
					resolve: {
						rProject: function() { return scope.project; },
						rContext: function() { return scope.context; }
					}
				});
				modalOrderDetail.result.then(function () {}, function () {});
			});
		}
    };
	return directive;
}
