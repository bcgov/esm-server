'use strict';
// =========================================================================
//
// Routes for templates
//
// =========================================================================
var policy  = require ('../policies/template.policy');
var Template  = require ('../controllers/template.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'template', Template, policy);
	app.route ('/api/template/for/project/:projectid').all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Template (req.user);
			p.getForProject (req.params.projectid)
			.then (helpers.success(res), helpers.failure(res));
		});
};

