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

	app.route('/api/project/byEpicProjectID/:epicprojectid')
		.all(policy ('guest'))
		.get(routes.setAndRun(Project, function (model, req) {
			return model.one({epicProjectID: req.params.epicprojectid}, "-directoryStructure");
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
	// special delete method, purge an unpublished project and all associated data/files
	app.route ('/api/project/:project/remove')
		.all (policy ('user'))
		.delete (routes.setAndRun (Project, function (model, req) {
			return model.removeProject (req.Project);
		}));
	app.route ('/api/project/bycode/:projectcode')
		.all (policy ('guest'))
		.get (function (req, res) {
			routes.setSessionContext(req)
				.then( function (opts) {
					var ctrl = new Project(opts);
					return ctrl.one ({code:req.params.projectcode}, "-directoryStructure");
				})
				.then(function(proj) {
					if (!proj)  {
						return res.status(404).send ({message: 'Project Not Found'});
					}
					return res.json (proj);
				});
		});
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
			return model.mine ({}, "-directoryStructure");
		}));

	app.route ('/api/projects/proponent/:id')
		.get (routes.setAndRun (Project, function (model, req) {
			return model.forProponent (req.params.id);
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

	app.route ('/api/projects/picklist')
		.all (policy ('guest'))
		.get (routes.setAndRun (Project, function (model, req) {
			return model.list ({},{_id: 1, code: 1, name: 1});
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
	app.route ('/api/project/:project/directory/add/:parentid')
		.all (policy ('user'))
		.put (routes.setAndRun (Project, function (model, req) {
			return model.addDirectory (req.Project, req.body.foldername, req.params.parentid);
		}));
	app.route ('/api/project/:project/directory/remove/:folderid')
		.all (policy ('user'))
		.put (routes.setAndRun (Project, function (model, req) {
			return model.removeDirectory (req.Project, req.params.folderid);
		}));
	app.route ('/api/project/:project/directory/rename/:folderid')
		.all (policy ('user'))
		.put (routes.setAndRun (Project, function (model, req) {
			return model.renameDirectory (req.Project, req.params.folderid, req.body.foldername);
		}));
	app.route ('/api/project/:project/directory/move/:folderid/:newparentid')
		.all (policy ('user'))
		.put (routes.setAndRun (Project, function (model, req) {
			return model.moveDirectory (req.Project, req.params.folderid, req.params.newparentid);
		}));
	app.route ('/api/project/:project/directory/publish/:folderid')
		.all (policy ('user'))
		.put (routes.setAndRun (Project, function (model, req) {
			return model.publishDirectory (req.Project, req.params.folderid);
		}));
	app.route ('/api/project/:project/directory/unpublish/:folderid')
		.all (policy ('user'))
		.put (routes.setAndRun (Project, function (model, req) {
			return model.unPublishDirectory (req.Project, req.params.folderid);
		}));
	app.route ('/api/project/:project/directory/list')
		.all (policy ('guest'))
		.get (routes.setAndRun (Project, function (model, req) {
			return model.getDirectoryStructure (req.Project);
		}));
};

