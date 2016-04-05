'use strict';
// =========================================================================
//
// order routes
//
// =========================================================================
angular.module('core').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
	// -------------------------------------------------------------------------
	//
	// this is the abstract, top level view for orders.
	// since it is a child of p (project), the project injection has already
	// been resolved and is available to subsequent child states as 'project'
	// here we will resolve the list of orders for this project, which will
	// also become available to child states as 'orders'
	//
	// -------------------------------------------------------------------------
	.state('p.order', {
		abstract:true,
		url: '/order',
		template: '<ui-view></ui-view>',
		resolve: {
			orders: function ($stateParams, OrderModel, project) {
				// console.log ('order abstract resolving orders');
				// console.log ('project id = ', project._id);
				return OrderModel.forProject (project._id);
			},
		},
        onEnter: function (MenuControl, project) {
            MenuControl.routeAccess (project.code, 'eao','edit-orders');
        }

	})
	// -------------------------------------------------------------------------
	//
	// the list state for orders and project are guaranteed to
	// already be resolved
	//
	// -------------------------------------------------------------------------
	.state('p.order.list', {
		url: '/list',
		templateUrl: 'modules/orders/client/views/order-list.html',
		controller: function ($scope, NgTableParams, orders, project) {
			$scope.tableParams = new NgTableParams ({count:10}, {dataset: orders});
			$scope.project = project;
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the add, or create state. it is defined before the others so that
	// it does not conflict
	//
	// -------------------------------------------------------------------------
	.state('p.order.create', {
		url: '/create',
		templateUrl: 'modules/orders/client/views/order-edit.html',
		resolve: {
			order: function (OrderModel) {
				return OrderModel.getNew ();
			}
		},
		controller: function ($scope, $state, project, order, OrderModel) {
			$scope.order = order;
			$scope.project = project;
			$scope.save = function () {
				OrderModel.add ($scope.order)
				.then (function (model) {
					$state.transitionTo('p.order.list', {projectid:project.code}, {
			  			reload: true, inherit: false, notify: true
					});
				})
				.catch (function (err) {
					console.error (err);
					// alert (err.message);
				});
			};
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the edit state
	//
	// -------------------------------------------------------------------------
	.state('p.order.edit', {
		url: '/:orderId/edit',
		templateUrl: 'modules/orders/client/views/order-edit.html',
		resolve: {
			order: function ($stateParams, OrderModel) {
				// console.log ('editing orderId = ', $stateParams.orderId);
				return OrderModel.getModel ($stateParams.orderId);
			}
		},
		controller: function ($scope, $state, order, project, OrderModel) {
			// console.log ('order = ', order);
			$scope.order = order;
			$scope.project = project;
			$scope.save = function () {
				OrderModel.save ($scope.order)
				.then (function (model) {
					// console.log ('order was saved',model);
					// console.log ('now going to reload state');
					$state.transitionTo('p.order.list', {projectid:project.code}, {
			  			reload: true, inherit: false, notify: true
					});
				})
				.catch (function (err) {
					console.error (err);
					// alert (err.message);
				});
			};
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the 'view' mode of a order. here we are just simply
	// looking at the information for this specific object
	//
	// -------------------------------------------------------------------------
	.state('p.order.detail', {
		url: '/:orderId',
		templateUrl: 'modules/orders/client/views/order-view.html',
		resolve: {
			order: function ($stateParams, OrderModel) {
				// console.log ('orderId = ', $stateParams.orderId);
				return OrderModel.getModel ($stateParams.orderId);
			}
		},
		controller: function ($scope, order, project) {
			// console.log ('order = ', order);
			$scope.order = order;
			$scope.project = project;
		}
	})

	;

}]);

