'use strict';
// =========================================================================
//
// Routes for milestones
//
// =========================================================================
var Activitybase = require ('../controllers/activitybase.controller');
var Activity     = require ('../controllers/activity.controller');
var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'activitybase', Activitybase, policy);
	routes.setCRUDRoutes (app, 'activity', Activity, policy);
	//
	// start an activity
	//
	app.route ('/api/start/activity/:activity')
		.all (policy ('user'))
		.put (routes.setAndRun (Activity, function (model, req) {
			return model.startActivity (req.Activity, req.body);
		}));
	//
	// complete an activity
	//
	app.route ('/api/complete/activity/:activity')
		.all (policy ('user'))
		.put (routes.setAndRun (Activity, function (model, req) {
			return model.completeActivity (req.Activity, req.body);
		}));
	//
	// all activities for a milestone
	//
	app.route ('/api/activity/for/milestone/:milestone')
		.all (policy ('user'))
		.put (routes.setAndRun (Activity, function (model, req) {
			return model.activitiesForMilestone (req.Milestone._id);
		}));
	//
	// activity base
	//
	app.route ('/api/activitybase/:activitybase/add/task/:taskbase')
		.all (policy ('user'))
		.put (routes.setAndRun (Activitybase, function (model, req) {
			return model.addTaskToActivity (req.ActivityBase, req.TaskBase);
		}));
	//
	// add a task form a base to a real activity
	//
	app.route ('/api/activity/:activity/add/task/:taskbase')
		.all (policy ('user'))
		.put (routes.setAndRun (Activity, function (model, req) {
			return model.addTaskFromBase (req.Activity, req.TaskBase);
		}));
	//
	// all activities for this project that the user can read
	//
	app.route ('/api/activity/in/project/:project')
		.all (policy ('user'))
		.get (routes.setAndRun (Activity, function (model, req) {
			return model.userActivities (req.Project.code, 'read');
		}));
	//
	// all activities for this project that the user can write
	//
	app.route ('/api/write/activity/in/project/:project')
		.all (policy ('user'))
		.get (routes.setAndRun (Activity, function (model, req) {
			return model.userActivities (req.Project.code, 'write');
		}));
};

