'use strict';
// =========================================================================
//
// Routes for inspectionreports
//
// =========================================================================
var policy       = require ('../policies/inspectionReport.policy');
var Inspectionreport = require ('../controllers/inspectionReport.controller');
var helpers      = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'inspectionreport', Inspectionreport, policy);
	app.route ('/api/inspectionreport/for/project/:projectid').all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Inspectionreport (req.user);
			p.getForProject (req.params.projectid)
			.then (helpers.success(res), helpers.failure(res));
		});
};
