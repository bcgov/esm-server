'use strict';
// =========================================================================
//
// Routes for authorizations
//
// =========================================================================
var policy = require ('../../../core/server/controllers/core.policy.controller');
var AuthorizationController = require ('../controllers/authorizations.controller');
var routes = require ('../../../core/server/controllers/core.routes.controller');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'authorizations', AuthorizationController, policy, [ 'get']);
	app.route ('/api/authorizations/for/projectCode/:projectCode/agencyCode/:agencyCode')
		.all (policy ('guest'))
		.get (routes.setAndRun (AuthorizationController, function (model, req) {
			return model.getForProject (req.params.projectCode, req.params.agencyCode);
		}));
};
