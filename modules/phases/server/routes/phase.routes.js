'use strict';
// =========================================================================
//
// Routes for phases
//
// =========================================================================
var policy    = require ('../policies/phase.policy');
var PhaseBase = require ('../controllers/phasebase.controller');
var Phase     = require ('../controllers/phase.controller');
var helpers   = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'phasebase', PhaseBase, policy);
	helpers.setCRUDRoutes (app, 'phase', Phase, policy);
	//
	// all phases for a project
	//
	app.route ('/api/phase/for/project/:project')
		.all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Phase (req.user);
			p.phasesForProject (req.Project._id)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// phase base
	//
	app.route ('/api/phasebase/:phasebase/add/milestone/:milestonebasecode')
		.all (policy.isAllowed)
		.put (function (req,res) {
			var p = new PhaseBase (req.user);
			p.addMilestoneToPhase (req.PhaseBase, req.params.milestonebasecode)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// add a milestone to a phase from a base
	//
	app.route ('/api/phase/:phase/add/milestone/:milestonebasecode')
		.all (policy.isAllowed)
		.put (function (req,res) {
			var p = new Phase (req.user);
			p.addMilestone (req.Phase, req.params.milestonebasecode)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// all phases for this project that the user can read
	//
	app.route ('/api/phase/in/project/:project')
		.all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Phase (req.user);
			p.userPhases (req.Project.code, 'read')
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// all phases for this project that the user can write
	//
	app.route ('/api/write/phase/in/project/:project')
		.all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Phase (req.user);
			p.userPhases (req.Project.code, 'write')
			.then (helpers.success(res), helpers.failure(res));
		});
};

