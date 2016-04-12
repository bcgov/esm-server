'use strict';
// =========================================================================
//
// Routes for orgs
//
// =========================================================================
var policy  = require ('../policies/email-template.policy');
var EmailTemplate  = require ('../controllers/email-template.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'emailTemplate', EmailTemplate, policy);
};
