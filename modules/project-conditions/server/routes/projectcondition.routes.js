'use strict';
// =========================================================================
//
// Routes for projectconditions
//
// =========================================================================
var policy  = require ('../policies/projectcondition.policy');
var ProjectCondition  = require ('../controllers/projectcondition.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'projectcondition', ProjectCondition, policy);
};

