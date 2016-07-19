'use strict';
// =========================================================================
//
// Routes for orgs
//
// =========================================================================
var EmailTemplate  = require ('../controllers/email-template.controller');
var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'emailTemplate', EmailTemplate, policy);
};
