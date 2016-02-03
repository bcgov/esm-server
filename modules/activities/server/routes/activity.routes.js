'use strict';
// =========================================================================
//
// Routes for milestones
//
// =========================================================================
var policy       = require ('../policies/activity.policy');
var Activitybase = require ('../controllers/activitybase.controller');
var Activity     = require ('../controllers/activity.controller');
var helpers      = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'activitybase', Activitybase, policy);
	helpers.setCRUDRoutes (app, 'activity', Activity, policy);
	//
	// activity base
	//
	app.route ('/api/activitybase/:activitybase/add/task/:taskbase')
		.all (policy.isAllowed)
		.put (function (req,res) {
			var p = new Activitybase (req.user);
			p.addMilestoneToPhase (req.ActivityBase, req.TaskBase)
			.then (helpers.success(res), helpers.failure(res));
		});
};

