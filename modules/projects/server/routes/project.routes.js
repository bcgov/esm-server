'use strict';
// =========================================================================
//
// Routes for Projects
//
// =========================================================================
var policy     = require ('../policies/project.policy');
var controller = require ('../controllers/project.controller');

module.exports = function (app) {
	app.route ('/api/projects')
		// .all (policy.isAllowed)
		.get (controller.getUserProjects);
	app.route ('/api/projects/write')
		// .all (policy.isAllowed)
		.get (controller.getUserProjectsWrite);
	app.route ('/api/project/:project/set/permissions')
		// .all (policy.isAllowed)
		.put (controller.saveProjectPermissions);
	//
	// collection routes
	//
	app.route ('/api/project').all (policy.isAllowed)
		.get  (controller.list)
		.post (controller.create);
	//
	// model routes
	//
	app.route ('/api/project/:project').all (policy.isAllowed)
		.get    (controller.read)
		.put    (controller.update)
		.delete (controller.delete);
	app.route ('/api/new/project').all (policy.isAllowed)
		.get (controller.new);
	//
	// actions actions actions
	//
	//project set up new stream
	app.route ('/api/project/:project/set/stream/:stream')
		.all (policy.isAllowed)
		.put (controller.setStream);

	// project -> bucket
	app.route ('/api/project/:project/add/bucket/:bucket')
		.all (policy.isAllowed)
		.put (controller.addBucketToProject);

	// project -> phase
	app.route ('/api/project/:project/add/phase/:phase')
		.all (policy.isAllowed)
		.put (controller.addPhaseToProject);

	// project phase -> milestone
	app.route ('/api/project/phase/:phase/add/milestone/:milestone')
		.all (policy.isAllowed)
		.put (controller.addMilestoneToPhase);

	// project phase -> activity
	app.route ('/api/project/phase/:phase/add/activity/:activity')
		.all (policy.isAllowed)
		.put (controller.addActivityToPhase);

	// project activity -> task
	app.route ('/api/project/activity/:activity/add/task/:task')
		.all (policy.isAllowed)
		.put (controller.addTaskToActivity);

	// project task -> requirement
	app.route ('/api/project/task/:task/add/requirement/:requirement')
		.all (policy.isAllowed)
		.put (controller.addRequirementToTask);

	// project milestone -> project requirement
	app.route ('/api/project/milestone/:milestone/add/project/requirement/:requirement')
		.all (policy.isAllowed)
		.put (controller.addRequirementToMilestone);

	// project bucket -> project requirement
	app.route ('/api/project/bucket/:bucket/add/project/requirement/:requirement')
		.all (policy.isAllowed)
		.put (controller.addRequirementToBucket);
	//
	// middleware to auto-fetch parameter
	//
	app.param ('project', controller.getObject);
	// app.param ('projectId', controller.getId);
};

