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
	app.route ('/api/org/for/project/:projectid').all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Org (req.user);
			p.getForProject (req.params.projectid)
			.then (helpers.success(res), helpers.failure(res));
		});
};

