'use strict';
// =========================================================================
//
// Routes for orders
//
// =========================================================================
var policy  = require ('../policies/order.policy');
var Order  = require ('../controllers/order.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'order', Order, policy);
	app.route ('/api/order/for/project/:projectid').all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Order (req.user);
			p.getForProject (req.params.projectid)
			.then (helpers.success(res), helpers.failure(res));
		});
};

