'use strict';
// =========================================================================
//
// Routes for Projects
//
// =========================================================================
var Project     = require ('../controllers/project.controller');
var projectLoad = require ('../controllers/project.load.controller');
var _           = require ('lodash');
var routes = require ('../../../core/server/controllers/cc.routes.controller');
var policy = require ('../../../core/server/controllers/cc.policy.controller');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'project', Project, policy);
	//
	// set a project up from a stream
	//
	app.route ('/api/project/:project/set/stream/:stream')
		.all (policy ('user'))
		.put (routes.setAndRun (Project, function (model, req) {
			return model.setStream (req.Project, req.Stream);
		}));
	//
	// add a phase to a project (from base phase)
	//
	app.route ('/api/project/:project/add/phase/:phasebasecode')
		.all (policy ('user'))
		.put (routes.setAndRun (Project, function (model, req) {
			return model.addPhase (req.Project, req.params.phasebasecode);
		}));
	//
	// set current phase
	//
	app.route ('/api/project/:project/set/phase/:phase')
		.all (policy ('user'))
		.put (routes.setAndRun (Project, function (model, req) {
			return model.setPhase (req.Project, req.Phase);
		}));
	//
	// set current phase
	//
	app.route ('/api/project/:project/complete/current/phase')
		.all (policy ('user'))
		.put (routes.setAndRun (Project, function (model, req) {
			return model.completeCurrentPhase (req.Project);
		}));
	//
	// set current phase
	//
	app.route ('/api/project/:project/start/next/phase')
		.all (policy ('user'))
		.put (routes.setAndRun (Project, function (model, req) {
			return model.startNextPhase (req.Project);
		}));
	//
	// get all projects in certain statuses
	//
	app.route ('/api/projects/with/status/:statustoken')
		.all (policy ('user'))
		.get (routes.setAndRun (Project, function (model, req) {
			var opts = {
				initiated      : 'Initiated',
				submitted      : 'Submitted',
				inprogress     : 'In Progress',
				certified      : 'Certified',
				decommissioned : 'Decommissioned'
			};
			var stat = opts[req.params.statustoken] || 'none';
			return model.list ({
				status : stat
			});
		}));
	//
	// publish or unpublish a project
	//
	app.route ('/api/project/:project/publish')
		.all (policy ('user'))
		.put (routes.setAndRun (Project, function (model, req) {
			return model.publish (req.Project, true);
		}));
	app.route ('/api/project/:project/unpublish')
		.all (policy ('user'))
		.put (routes.setAndRun (Project, function (model, req) {
			return model.publish (req.Project, false);
		}));
	app.route ('/api/project/:project/submit')
		.all (policy ('user'))
		.put (routes.setAndRun (Project, function (model, req) {
			return model.submit (req.Project);
		}));
	app.route ('/api/project/bycode/:projectcode')
		.all (policy ('guest'))
		.get (routes.setAndRun (Project, function (model, req) {
			return model.one ({code:req.params.projectcode});
		}));
	// app.route ('/api/')
	// 	.all (policy ('user'))
	// 	.get (function (req, res) {
	// 	var p = new Project (req.user);
	// 	p.list ().then (routes.success(res), routes.failure(res));
	// });

	app.route ('/api/projects/published')
		.get (routes.setAndRun (Project, function (model, req) {
			return model.published ();
		}));

	app.route ('/api/projects/mine')
		.get (routes.setAndRun (Project, function (model, req) {
			return model.mine ();
		}));


	app.route ('/api/projects/lookup')
		.all (policy ('guest'))
		.get (routes.setAndRun (Project, function (model, req) {
			return model.list ({},{_id: 1, code: 1, name: 1, region: 1, status: 1, memPermitID: 1})
			.then ( function(res) {
				var obj = {};
				_.each( res, function(item) {
					obj[item._id] = item;
				});
				return obj;
			});
		}));

	app.route ('/api/projects/regions')
		.all (policy ('user'))
		.get (routes.setAndRun (Project, function (model, req) {
			return model.list ({},{region: 1})
			.then ( function(res) {
				var obj = {};
				_.each( res, function(item) {
					obj[item.region] = item.region;
				});
				return obj;
			});
		}));

	app.route ('/api/projects/import/eao')
		.all (policy ('user'))
		.post (function (req, res) {
			var file = req.files.file;
			if (file) {
				// console.log("Received contact import file:",file);
				projectLoad (file, req, res)
				.then (routes.success(res), routes.failure(res));
			}
		});
	app.route ('/api/projects/import/mem')
		.all (policy ('user'))
		.post (function (req, res) {
			var file = req.files.file;
			if (file) {
				// console.log("Received contact import file:",file);
				projectLoad (file, req, res)
				.then (routes.success(res), routes.failure(res));
			}
		});
};

