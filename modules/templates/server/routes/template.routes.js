'use strict';
// =========================================================================
//
// Routes for templates
//
// =========================================================================
var Template  = require ('../controllers/template.controller');
var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'template', Template, policy);
	app.route ('/api/template/for/project/:projectid')
		.all (policy ('user'))
		.get (routes.setAndRun (Template, function (model, req) {
			return model.getForProject (req.params.projectid);
		}));
	app.route ('/api/template/for/document/:documenttype')
		.all (policy ('user'))
		.get (routes.setAndRun (Template, function (model, req) {
			return model.getCurrentType (req.params.documenttype);
		}));
	app.route ('/api/template/for/code/:code')
		.all (policy ('guest'))
		.get (routes.setAndRun (Template, function (model, req) {
			return model.getCurrentCode (req.params.code);
		}));
	app.route ('/api/new/template/section')
		.all (policy ('user'))
		.get (routes.setAndRun (Template, function (model, req) {
			return model.newSection ();
		}));
	app.route ('/api/new/template/meta')
		.all (policy ('user'))
		.get (routes.setAndRun (Template, function (model, req) {
			return model.newMeta ();
		}));
	app.route ('/api/current/templates')
		.all (policy ('user'))
		.get (routes.setAndRun (Template, function (model, req) {
			return model.currentTemplates ();
		}));
};

