'use strict';
// =========================================================================
//
// Routes for features
//
// =========================================================================
var policy  = require ('../policies/feature.policy');
var Feature  = require ('../controllers/feature.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'feature', Feature, policy);
	app.route ('/api/feature/for/project/:projectid').all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Feature (req.user);
			p.getForProject (req.params.projectid)
			.then (helpers.success(res), helpers.failure(res));
		});
	app.route ('/api/base/feature').all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Feature (req.user);
			p.getBase ()
			.then (helpers.success(res), helpers.failure(res));
		});
};

