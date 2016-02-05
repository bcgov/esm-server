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
	// phase base
	//
	app.route ('/api/phasebase/:phasebase/add/milestone/:milestonebase')
		.all (policy.isAllowed)
		.put (function (req,res) {
			var p = new PhaseBase (req.user);
			p.addMilestoneToPhase (req.PhaseBase, req.MilestoneBase)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// add a milestone to a phase from a base
	//
	app.route ('/api/phase/:phase/add/milestone/:milestonebase')
		.all (policy.isAllowed)
		.put (function (req,res) {
			var p = new Phase (req.user);
			p.addMilestoneFromBase (req.Phase, req.MilestoneBase)
			.then (helpers.success(res), helpers.failure(res));
		});
};

