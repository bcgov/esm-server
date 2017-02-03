'use strict';
// =========================================================================
//
// Routes for inspectionreports
//
// =========================================================================
var policy = require ('../../../core/server/controllers/core.policy.controller');
var ComplianceOversight = require ('../controllers/complianceOversight.controller');
var routes = require ('../../../core/server/controllers/core.routes.controller');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'compliance-oversight', ComplianceOversight, policy, [ 'get']);
	app.route ('/api/compliance-oversight/for/project/:projectid')
		.all (policy ('guest'))
		.get (routes.setAndRun (ComplianceOversight, function (model, req) {
			return model.getForProject (req.params.project);
		}));
};
