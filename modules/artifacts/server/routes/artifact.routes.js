'use strict';
// =========================================================================
//
// Routes for artifacts
//
// =========================================================================
var policy       = require ('../policies/artifact.policy');
var Artifact     = require ('../controllers/artifact.controller');
var ArtifactType = require ('../controllers/artifact.type.controller');
var helpers      = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'artifact', Artifact, policy);
	app.route ('/api/artifact/for/project/:projectid').all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Artifact (req.user);
			p.getForProject (req.params.projectid)
			.then (helpers.success(res), helpers.failure(res));
		});
	app.route ('/api/artifact/project/:project/from/type/:documenttype').all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Artifact (req.user);
			p.newFromType (req.params.documenttype, req.Project)
			.then (helpers.success(res), helpers.failure(res));
		});
	app.route ('/api/artifact/next/stage/:artifact').all (policy.isAllowed)
		.put (function (req, res) {
			var p = new Artifact (req.user);
			p.nextStage (req.body, req.Artifact)
			.then (helpers.success(res), helpers.failure(res));
		});
	app.route ('/api/artifact/prev/stage/:artifact').all (policy.isAllowed)
		.put (function (req, res) {
			var p = new Artifact (req.user);
			p.prevStage (req.body, req.Artifact)
			.then (helpers.success(res), helpers.failure(res));
		});
};

