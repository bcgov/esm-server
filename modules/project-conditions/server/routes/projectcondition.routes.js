'use strict';
// =========================================================================
//
// Routes for projectconditions
//
// =========================================================================
var ProjectCondition  = require ('../controllers/projectcondition.controller');
var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'projectcondition', ProjectCondition, policy);
	app.route ('/api/projectcondition/for/project/:projectId')
		.all (policy ('guest'))
		.get (routes.setAndRun (ProjectCondition, function (model, req) {
			return model.getForProject (req.params.projectId);
		}));
	
	app.route ('/api/projectcondition/publish/:pcId')
		.all (policy ('user'))
		.put (routes.setAndRun (ProjectCondition, function (model, req) {
			return model.publish (req.params.pcId);
		}));
	
	app.route ('/api/projectcondition/unpublish/:pcId')
		.all (policy ('user'))
		.put (routes.setAndRun (ProjectCondition, function (model, req) {
			return model.unpublish (req.params.pcId );
		}));
};

