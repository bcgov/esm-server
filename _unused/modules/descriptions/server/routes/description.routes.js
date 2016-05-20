'use strict';
// =========================================================================
//
// Routes for descriptions
//
// =========================================================================
var policy  = require ('../policies/description.policy');
var Description  = require ('../controllers/description.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'description', Description, policy);
	app.route ('/api/description/for/project/:projectid').all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Description (req.user);
			p.getForProject (req.params.projectid)
			.then (helpers.success(res), helpers.failure(res));
		});
};

