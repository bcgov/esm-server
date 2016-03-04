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
};

