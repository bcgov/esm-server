'use strict';
// =========================================================================
//
// Routes for vcs
//
// =========================================================================
var policy  = require ('../policies/vc.policy');
var Vc  = require ('../controllers/vc.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'vc', Vc, policy);
	app.route ('/api/vc/for/project/:projectid').all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Vc (req.user);
			p.getForProject (req.params.projectid)
			.then (helpers.success(res), helpers.failure(res));
		});
};

