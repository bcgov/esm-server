'use strict';
// =========================================================================
//
// Routes for Projects
//
// =========================================================================
var Project     = require ('../controllers/project.controller');
var projectLoad = require ('../controllers/project.load.controller');
var _           = require ('lodash');
var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'project', Project, policy);
	//
	// add a phase to a project (from base phase)
	//
	app.route ('/api/project/:project/add/phase/:phaseBaseCode')
		.all (policy ('user'))
		.put (routes.setAndRun (Project, function (model, req) {
			return model.addPhaseWithId (req.params.project, req.params.phaseBaseCode);
		}));
	// remove a phase from a project
	app.route ('/api/project/:project/remove/phase/:phase')
		.all (policy ('user'))
		.put (routes.setAndRun (Project, function (model, req) {
			return model.removePhase (req.params.project, req.params.phase);
		}));
	//
	// start phase
	//
	app.route ('/api/project/:project/start/next/phase')
		.all (policy ('user'))
		.put (routes.setAndRun (Project, function (model, req) {
			return model.startNextPhase (req.params.project);
		}));
	//
	// complete phase
	//
	app.route ('/api/project/:project/complete/phase/:phase')
		.all (policy ('user'))
		.put (routes.setAndRun (Project, function (model, req) {
			return model.completePhase (req.params.project, req.params.phase);
		}));
	//
	// uncomplete phase
	//
	app.route ('/api/project/:project/uncomplete/phase/:phase')
		.all (policy ('user'))
		.put (routes.setAndRun (Project, function (model, req) {
			return model.uncompletePhase (req.params.project, req.params.phase);
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
		.get (routes.setAndRun(Project, function (model, req) {
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
				routes.setSessionContext(req)
				.then( function (opts) {
					// console.log("opts generated.");
					return projectLoad (file, req, res, opts);
				})
				.then (function (data) {
					// console.log("finished");
					res.json (data);
				});
			}
		});
	app.route ('/api/projects/import/mem')
		.all (policy ('user'))
		.post (function (req, res) {
			var file = req.files.file;
			if (file) {
				// console.log("Received contact import file:",file);
				routes.setSessionContext(req)
				.then( function (opts) {
					// console.log("opts generated.");
					return projectLoad (file, req, res, opts);
				})
				.then (function (data) {
					// console.log("finished");
					res.json (data);
				});
			}
		});
};

