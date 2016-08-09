'use strict';
// =========================================================================
//
// Routes for vcs
//
// =========================================================================
var Vc  = require ('../controllers/vc.controller');
var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'vc', Vc, policy, ['getall', 'get', 'post', 'put', 'new', 'query']);
	app.route ('/api/vc/for/project/:projectid').all (policy ('guest'))
		.get (routes.setAndRun (Vc, function (model, req) {
			return model.getForProject (req.params.projectid);
		}));
	app.route ('/api/vclist')
		.all (policy ('guest'))
		.put (routes.setAndRun (Vc, function (model, req) {
			return model.getList (req.body);
		}));
	app.route ('/api/publish/vc/:vc')
	.all (policy ('user'))
	.put (routes.setAndRun (Vc, function (model, req) {
		return model.publish (req.Vc);
	}));
	app.route ('/api/unpublish/vc/:vc')
	.all (policy ('user'))
	.put (routes.setAndRun (Vc, function (model, req) {
		return model.unpublish (req.Vc);
	}));
	
	
	app.route('/api/deletecheck/vc/:vc')
	.all (policy ('user'))
	.get (routes.setAndRun (Vc, function (model, req) {
		return model.deleteCheck(req.Vc);
	}));

	app.route('/api/vc/:vc')
	.all (policy ('user'))
	.delete (routes.setAndRun (Vc, function (model, req) {
		return model.deleteWithCheck(req.Vc);
	}));
	
};

