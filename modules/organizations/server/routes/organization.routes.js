'use strict';
// =========================================================================
//
// Routes for organizations
//
// =========================================================================
var policy       = require ('../policies/organization.policy');
var Organization = require ('../controllers/organization.controller');
var helpers      = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'organization', Organization, policy);
};
