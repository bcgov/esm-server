'use strict';
// =========================================================================
//
// Routes for conditions
//
// =========================================================================
var policy  = require ('../policies/condition.policy');
var Condition  = require ('../controllers/condition.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'condition', Condition, policy);
};

