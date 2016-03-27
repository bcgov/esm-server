'use strict';
// =========================================================================
//
// Routes for milestones
//
// =========================================================================
var policy        = require ('../policies/milestone.policy');
var MilestoneBase = require ('../controllers/milestonebase.controller');
var Milestone     = require ('../controllers/milestone.controller');
var helpers       = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'milestonebase', MilestoneBase, policy);
	helpers.setCRUDRoutes (app, 'milestone', Milestone, policy);
	//
	// all milestones for a phase
	//
	app.route ('/api/milestone/for/phase/:phase')
		.all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Milestone (req.user);
			p.milestonesForPhase (req.Phase._id)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// milestone base
	//
	app.route ('/api/milestonebase/:milestonebase/add/activity/:activitybase')
		.all (policy.isAllowed)
		.put (function (req,res) {
			var p = new MilestoneBase (req.user);
			p.addActivityToMilestone (req.MilestoneBase, req.ActivityBase)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// add activity base to real milestone
	//
	app.route ('/api/milestone/:milestone/add/activity/:activitybase')
		.all (policy.isAllowed)
		.put (function (req,res) {
			var p = new Milestone (req.user);
			p.addActivityFromBase (req.Milestone, req.ActivityBase)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// get a milestonewith all of its activities filled out
	//
	app.route ('/api/milestone/:milestone/with/activites')
		.all (policy.isAllowed)
		.put (function (req, res) {
			var p = new Milestone (req.user);
			p.getMilestoneWithActivities (req.Milestone)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// all milestones for this project that the user can read
	//
	app.route ('/api/milestone/in/project/:project')
		.all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Milestone (req.user);
			p.userMilestones (req.Project.code, 'read')
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// all milestones for this project that the user can write
	//
	app.route ('/api/write/milestone/in/project/:project')
		.all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Milestone (req.user);
			p.userMilestones (req.Project.code, 'write')
			.then (helpers.success(res), helpers.failure(res));
		});
//test-activity 56f53c787eb8ce680e26baf8
//test-milestone 56f59e4654863a4e1333ea9a
// phase : ObjectId("56f29176e01d1212d6a3c139")
// phase base 42 56f60b5b6266face16cb43fb
// project ObjectId("56f2916de01d1212d6a3c135")
// stream42: 56f61017737169bc18c52c8d
	app.route ('/api/test/activities').get (function (req, res) {
		var path      = require('path');
		var Phase = require (path.resolve('./modules/phases/server/controllers/phase.controller'));
		var Project = require (path.resolve('./modules/projects/server/controllers/project.controller'));
		var pr = new Project (req.user);
		var p = new Phase (req.user);
		var m = new Milestone (req.user);
		pr.findById ('56f2916de01d1212d6a3c135')
		// .then (function (project) {
		// 	return pr.addPhase (project, 'phase-42');
		// })
		// p.findById ('56f29176e01d1212d6a3c139')
		// .then (function (project) {
		// 	return p.fromBase ('phase-42', project);
		// })
		.then (helpers.success(res), helpers.failure(res));
	});
};

