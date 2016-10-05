'use strict';
// =========================================================================
//
// Routes for inspectionreports
//
// =========================================================================
var policy = require ('../../../core/server/controllers/core.policy.controller');
var Inspectionreport = require ('../controllers/inspectionReport.controller');
var routes = require ('../../../core/server/controllers/core.routes.controller');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'inspectionreport', Inspectionreport, policy);
	app.route ('/api/inspectionreport/for/project/:projectid')
		.all (policy ('user'))
		.get (routes.setAndRun (Inspectionreport, function (model, req) {
			return model.getForProject (req.params.project);
		}));
};
