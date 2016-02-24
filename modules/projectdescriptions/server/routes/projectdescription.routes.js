'use strict';
// =========================================================================
//
// Routes for projectdescriptions
//
// =========================================================================
var policy  = require ('../policies/projectdescription.policy');
var ProjectDescription  = require ('../controllers/projectdescription.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'projectdescription', ProjectDescription, policy);
	app.route ('/api/projectdescription/for/project/:project')
		.all (policy.isAllowed)
		.get (function (req, res) {
			var p = new ProjectDescription (req.user);
			p.list ({
				project : project._id
			})
			.then (helpers.success(res), helpers.failure(res));
		});
};

