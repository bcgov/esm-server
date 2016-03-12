'use strict';
// =========================================================================
//
// Routes for complaints
//
// =========================================================================
var policy  = require ('../policies/complaint.policy');
var Complaint  = require ('../controllers/complaint.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'complaint', Complaint, policy);
	app.route ('/api/complaint/for/project/:projectid').all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Complaint (req.user);
			p.getForProject (req.params.projectid)
			.then (helpers.success(res), helpers.failure(res));
		});
};

