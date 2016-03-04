'use strict';
// =========================================================================
//
// Routes for orgs
//
// =========================================================================
var policy  = require ('../policies/org.policy');
var Org  = require ('../controllers/org.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'org', Org, policy);
};

