'use strict';
// =========================================================================
//
// Routes for phases
//
// =========================================================================
var PhaseBase = require ('../controllers/phasebase.controller');
var Phase     = require ('../controllers/phase.controller');
var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'phasebase', PhaseBase, policy);
	routes.setCRUDRoutes (app, 'phase', Phase, policy);
	//
	// all phases for a project
	//
	app.route ('/api/phase/for/project/:project')
		.all (policy ('guest'))
		.get (routes.setAndRun (Phase, function (model, req) {
			return model.phasesForProject (req.Project._id);
		}));
	//
	// phase base
	//
	app.route ('/api/phasebase/:phasebase/add/milestone/:milestonebasecode')
		.all (policy ('user'))
		.put (routes.setAndRun (PhaseBase, function (model, req) {
			return model.addMilestoneToPhase (req.PhaseBase, req.params.milestonebasecode);
		}));
	//
	// add a milestone to a phase from a base
	//
	app.route ('/api/phase/:phase/add/milestone/:milestonebasecode')
		.all (policy ('user'))
		.put (routes.setAndRun (Phase, function (model, req) {
			return model.addMilestone (req.Phase, req.params.milestonebasecode);
		}));
	//
	// all phases for this project that the user can read
	//
	app.route ('/api/phase/in/project/:project')
		.all (policy ('user'))
		.get (routes.setAndRun (Phase, function (model, req) {
			return model.userPhases (req.Project.code, 'read');
		}));
	//
	// all phases for this project that the user can write
	//
	app.route ('/api/write/phase/in/project/:project')
		.all (policy ('user'))
		.get (routes.setAndRun (Phase, function (model, req) {
			return model.userPhases (req.Project.code, 'write');
		}));
};

