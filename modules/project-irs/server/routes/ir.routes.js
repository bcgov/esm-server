'use strict';
// =========================================================================
//
// Routes for irs
//
// =========================================================================
var policy  = require ('../policies/ir.policy');
var Ir  = require ('../controllers/ir.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'ir', Ir, policy);
	app.route ('/api/ir/for/project/:projectid').all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Ir (req.user);
			p.getForProject (req.params.projectid)
			.then (helpers.success(res), helpers.failure(res));
		});
};

