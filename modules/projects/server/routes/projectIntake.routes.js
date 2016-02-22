'use strict';
// =========================================================================
//
// Routes for Projects
//
// =========================================================================
var policy        = require ('../policies/projectIntake.policy');
var ProjectIntake = require ('../controllers/projectIntake.controller');
var helpers       = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'projectintake', ProjectIntake, policy);
	//
	// set a project up from a stream
	//
	app.route ('/api/projectintake/list/for/project/:project')
		.all (policy.isAllowed)
		.get (function (req,res) {
			var p = new ProjectIntake (req.user);
			p.listForProject (req.Project)
			.then (helpers.success(res), helpers.failure(res));
		});
};

