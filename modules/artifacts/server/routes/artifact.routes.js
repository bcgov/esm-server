'use strict';
// =========================================================================
//
// Routes for artifacts
//
// =========================================================================
var Artifact = require('../controllers/artifact.controller');
var ArtifactType = require('../controllers/artifact.type.controller');
var routes = require('../../../core/server/controllers/core.routes.controller');
var policy = require('../../../core/server/controllers/core.policy.controller');

module.exports = function (app) {
	routes.setCRUDRoutes(app, 'artifact', Artifact, policy);
	routes.setCRUDRoutes(app, 'artifacttype', Artifact, policy);
	app.route('/api/artifact/kml/for/project/:projectid')
	.all(policy('guest'))
	.get(routes.setAndRun(Artifact, function (model, req) {
		return model.getForProjectKML(req.params.projectid);
	}));
	app.route('/api/artifact/for/project/:projectid')
	.all(policy('guest'))
	.get(routes.setAndRun(Artifact, function (model, req) {
		return model.getForProject(req.params.projectid);
	}));
	app.route('/api/artifact/for/project/:projectid/filter')
	.all(policy('guest'))
	.get(routes.setAndRun(Artifact, function (model, req) {
		return model.getForProjectFilterType(req.params.projectid, req.query);
	}));
	app.route('/api/artifact/for/project/:projectid/:type')
	.all(policy('guest'))
	.get(routes.setAndRun(Artifact, function (model, req) {
		return model.getForProjectType(req.params.projectid, req.params.type);
	}));
	app.route('/api/artifact/project/:project/from/type/:documenttype')
	.all(policy('user'))
	.get(routes.setAndRun(Artifact, function (model, req) {
		return model.newFromType(req.params.documenttype, req.Project);
	}));
	app.route('/api/artifact/project/:projectid/available/types')
	.all(policy('user'))
	.get(routes.setAndRun(Artifact, function (model, req) {
		return model.availableTypes(req.params.projectid);
	}));
	app.route('/api/artifacttype/template/types')
	.all(policy('user'))
	.get(routes.setAndRun(ArtifactType, function (model, req) {
		return model.templateTypes(req.params.projectid);
	}));
	app.route('/api/artifact/next/stage/:artifact')
	.all(policy('user'))
	.put(routes.setAndRun(Artifact, function (model, req) {
		return model.nextStage(req.body, req.Artifact);
	}));
	app.route('/api/artifact/prev/stage/:artifact')
	.all(policy('user'))
	.put(routes.setAndRun(Artifact, function (model, req) {
		return model.prevStage(req.body, req.Artifact);
	}));
	app.route('/api/artifacttype/code/:code')
	.all(policy('guest'))
	.get(routes.setAndRun(ArtifactType, function (model, req) {
		return model.fromCode(req.params.code);
	}));
	app.route('/api/publish/artifact/:artifact').all(policy('user'))
	.put(routes.setAndRun(Artifact, function (model, req) {
		return model.publish(req.Artifact);
	}));
	app.route('/api/unpublish/artifact/:artifact').all(policy('user'))
	.put(routes.setAndRun(Artifact, function (model, req) {
		return model.unpublish(req.Artifact);
	}));
	app.route('/api/artifact/checkPermissions/:artifactId').all(policy('guest'))
	.get(routes.setAndRun(Artifact, function (model, req) {
		return model.checkPermissions(req.params.artifactId);
	}));

	app.route ('/api/artifacts/mine')
	.get (routes.setAndRun (Artifact, function (model, req) {
		return model.mine ();
	}));

};

