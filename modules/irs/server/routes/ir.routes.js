'use strict';
// =========================================================================
//
// Routes for irs
//
// =========================================================================
var policy  = require ('../policies/ir.policy');
var Ir  = require ('../controllers/ir.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'ir', Ir, policy);
};

