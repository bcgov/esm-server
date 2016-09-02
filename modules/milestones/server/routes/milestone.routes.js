'use strict';
// =========================================================================
//
// Routes for milestones
//
// =========================================================================
var MilestoneBase = require ('../controllers/milestonebase.controller');
var Milestone     = require ('../controllers/milestone.controller');
var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'milestonebase', MilestoneBase, policy);
	routes.setCRUDRoutes (app, 'milestone', Milestone, policy);
	//
	// all milestones for a phase
	//
	app.route ('/api/milestone/for/phase/:phaseId')
		.all (policy ('user'))
		.get (routes.setAndRun (Milestone, function (model, req) {
			return model.milestonesForPhase (req.params.phaseId);
		}));
	//
	// milestone base
	//
	app.route ('/api/milestonebase/:milestonebase/add/activity/:activitybasecode')
		.all (policy ('user'))
		.put (routes.setAndRun (MilestoneBase, function (model, req) {
			return model.addActivityToMilestone (req.MilestoneBase, req.params.activitybasecode);
		}));
	//
	// add activity base to real milestone
	//
	app.route ('/api/milestone/:milestone/add/activity/:activitybasecode')
		.all (policy ('user'))
		.put (routes.setAndRun (Milestone, function (model, req) {
			return model.addActivity (req.Milestone, req.params.activitybasecode);
		}));
	//
	// get a milestone with all of its activities filled out
	//
	app.route ('/api/milestone/:milestone/with/activites')
		.all (policy ('user'))
		.put (routes.setAndRun (Milestone, function (model, req) {
			return model.getMilestoneWithActivities (req.Milestone);
		}));
	//
	// all milestones for this project that the user can read
	//
	app.route ('/api/milestone/in/project/:projectId')
		.all (policy ('guest'))
		.get (routes.setAndRun (Milestone, function (model, req) {
			return model.userMilestones (req.params.projectId, 'read');
		}));
	//
	// start a specific milestone
	//
	app.route ('/api/milestone/complete/:milestoneId')
		.all (policy ('user'))
		.all (routes.setModel (Milestone))
		.put (routes.setAndRun (Milestone, function (model, req) {
			return model.findById (req.params.milestoneId)
			.then (function (milestone) {
				return model.complete (milestone);
			});
		}));
	//
	// complete a specific milestone
	//
	app.route ('/api/milestone/start/:milestoneId')
		.all (policy ('user'))
		.all (routes.setModel (Milestone))
		.put (routes.setAndRun (Milestone, function (model, req) {
			return model.findById (req.params.milestoneId)
			.then (function (milestone) {
				return model.start (milestone);
			});
		}));
	//
	// all milestones for this project that the user can write
	//
	app.route ('/api/write/milestone/in/project/:projectId')
		.all (policy ('user'))
		.get (routes.setAndRun (Milestone, function (model, req) {
			return model.userMilestones (req.params.projectId, 'write');
		}));
};

