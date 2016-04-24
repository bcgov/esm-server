'use strict';
// =========================================================================
//
// Routes for templates
//
// =========================================================================
var policy  = require ('../policies/template.policy');
var Template  = require ('../controllers/template.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'template', Template, policy);
	app.route ('/api/template/for/project/:projectid').all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Template (req.user);
			p.getForProject (req.params.projectid)
			.then (helpers.success(res), helpers.failure(res));
		});
	app.route ('/api/template/for/document/:documenttype').all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Template (req.user);
			p.getCurrentType (req.params.documenttype)
			.then (helpers.success(res), helpers.failure(res));
		});
	app.route ('/api/template/for/code/:code').all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Template (req.user);
			p.getCurrentCode (req.params.code)
			.then (helpers.success(res), helpers.failure(res));
		});
	app.route ('/api/new/template/section').all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Template (req.user);
			p.newSection ()
			.then (helpers.success(res), helpers.failure(res));
		});
	app.route ('/api/new/template/meta').all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Template (req.user);
			p.newMeta ()
			.then (helpers.success(res), helpers.failure(res));
		});
	app.route ('/api/current/templates').all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Template (req.user);
			p.currentTemplates ()
			.then (helpers.success(res), helpers.failure(res));
		});
};

