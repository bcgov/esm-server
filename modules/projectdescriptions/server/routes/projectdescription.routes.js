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
	app.route ('/api/projectdescription/for/project/:projectid')
		.all (policy.isAllowed)
		.get (function (req, res) {
			var p = new ProjectDescription (req.user);
			p.list ({
				project : req.params.projectid
			})
			.then (helpers.success(res), helpers.failure(res));
		});
	app.route ('/api/projectdescription/save/as/:type')
		.all (policy.isAllowed)
		.post (function (req, res) {
			var p = new ProjectDescription (req.user);
			p.saveAs (req.params.type, req.body)
			.then (helpers.success(res), helpers.failure(res));
		});
};

