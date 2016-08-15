'use strict';
// =========================================================================
//
// Routes for enforcements
//
// =========================================================================
var Enforcement  = require ('../controllers/enforcement.controller');
var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'enforcement', Enforcement, policy);
	app.route ('/api/enforcement/for/project/:projectid').all (policy ('guest'))
		.get (routes.setAndRun (Enforcement, function (model, req) {
			return model.getForProject (req.params.projectid);
		}));
};

