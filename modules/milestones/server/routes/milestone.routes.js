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
	app.route ('/api/milestone/for/phase/:phase')
		.all (policy ('user'))
		.get (routes.setAndRun (Milestone, function (model, req) {
			return model.milestonesForPhase (req.Phase._id);
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
	app.route ('/api/milestone/in/project/:project')
		.all (policy ('user'))
		.get (routes.setAndRun (Milestone, function (model, req) {
			return model.userMilestones (req.Project.code, 'read');
		}));
	//
	// start a specific milestone
	//
	app.route ('/api/milestone/complete/:milestoneid')
		.all (policy ('user'))
		.all (routes.setModel (Milestone))
		.put (routes.setAndRun (Milestone, function (model, req) {
			return model.findById (req.params.milestoneid)
			.then (function (milestone) {
				return model.complete (milestone);
			});
		}));
	//
	// complete a specific milestone
	//
	app.route ('/api/milestone/start/:milestoneid')
		.all (policy ('user'))
		.all (routes.setModel (Milestone))
		.put (routes.setAndRun (Milestone, function (model, req) {
			return model.findById (req.params.milestoneid)
			.then (function (milestone) {
				return model.start (milestone);
			});
		}));
	//
	// all milestones for this project that the user can write
	//
	app.route ('/api/write/milestone/in/project/:project')
		.all (policy ('user'))
		.get (routes.setAndRun (Milestone, function (model, req) {
			return model.userMilestones (req.Project.code, 'write');
		}));
};

