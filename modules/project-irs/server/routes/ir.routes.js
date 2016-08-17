'use strict';
// =========================================================================
//
// Routes for irs
//
// =========================================================================
var Ir  = require ('../controllers/ir.controller');
var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'ir', Ir, policy);
	app.route ('/api/ir/for/project/:projectid').all (policy ('guest'))
		.get (routes.setAndRun (Ir, function (model, req) {
			return model.getForProject (req.params.projectid);
		}));
	app.route ('/api/conditions/for/ir/:irid').all (policy ('guest'))
		.get (routes.setAndRun (Ir, function (model, req) {
			return model.conditionsForIr (req.params.irid);
		}));
	app.route ('/api/publish/ir/:ir').all (policy ('user'))
		.put (routes.setAndRun (Ir, function (model, req) {
		return model.publish (req.Ir);
	}));
	app.route ('/api/unpublish/ir/:ir').all (policy ('user'))
		.put (routes.setAndRun (Ir, function (model, req) {
		return model.unpublish (req.Ir);
	}));
};

