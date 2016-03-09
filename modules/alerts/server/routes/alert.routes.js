'use strict';
// =========================================================================
//
// Routes for alerts
//
// =========================================================================
var policy  = require ('../policies/alert.policy');
var Alert   = require ('../controllers/alert.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	// helpers.setCRUDRoutes (app, 'alert', Alert, policy);
};
