'use strict';
// =========================================================================
//
// Routes for vcs
//
// =========================================================================
var Vc  = require ('../controllers/vc.controller');
var routes = require ('../../../core/server/controllers/cc.routes.controller');
var policy = require ('../../../core/server/controllers/cc.policy.controller');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'vc', Vc, policy);
	app.route ('/api/vc/for/project/:projectid').all (policy ('guest'))
		.get (routes.setAndRun (Vc, function (model, req) {
			return model.getForProject (req.params.projectid);
		}));
};

