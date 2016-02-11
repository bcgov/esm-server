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
};

