'use strict';
// =========================================================================
//
// Routes for inspectionreports
//
// =========================================================================
var policy = require ('../../../core/server/controllers/core.policy.controller');
var InspectionController = require ('../controllers/inspections.controller');
var routes = require ('../../../core/server/controllers/core.routes.controller');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'inspections', InspectionController, policy, [ 'get']);
	app.route ('/api/inspections/for/project/:projectid')
		.all (policy ('guest'))
		.get (routes.setAndRun (InspectionController, function (model, req) {
			return model.getForProject (req.params.projectid);
		}));
};
