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
	
	app.route ('/api/org/for/project/:projectid').all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Organization (req.user);
			p.getForProject (req.params.projectid)
			.then (helpers.success(res), helpers.failure(res));
	});
};