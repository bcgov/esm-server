'use strict';
// =========================================================================
//
// Routes for streams
//
// =========================================================================
var policy     = require ('../policies/stream.policy');
var controller = require ('../controllers/stream.controller');
var projectcontroller = require ('../../../projects/server/controllers/project.controller');

module.exports = function (app) {
	//
	// collection routes
	//
	app.route ('/api/stream').all (policy.isAllowed)
		.get  (controller.list)
		.post (controller.create);
	//
	// model routes
	//
	app.route ('/api/stream/:stream').all (policy.isAllowed)
		.get    (controller.read)
		.put    (controller.update)
		.delete (controller.delete);
	app.route ('/api/new/stream').all (policy.isAllowed)
		.get (controller.new);
	//
	// actions
	//
	// these are identical to the project actions, except that they
	// are linking a stream all together instead of a project
	//
	// stream -> bucket
	app.route ('/api/stream/:stream/add/bucket/:bucket')
		.all (policy.isAllowed)
		.put (projectcontroller.addBucketToStream);

	// stream -> phase
	app.route ('/api/stream/:stream/add/phase/:phase')
		.all (policy.isAllowed)
		.put (projectcontroller.addPhaseToStream);

	// stream phase -> milestone
	app.route ('/api/stream/phase/:phase/add/milestone/:milestone')
		.all (policy.isAllowed)
		.put (projectcontroller.addMilestoneToPhase);

	// stream phase -> activity
	app.route ('/api/stream/phase/:phase/add/activity/:activity')
		.all (policy.isAllowed)
		.put (projectcontroller.addActivityToPhase);

	// stream activity -> task
	app.route ('/api/stream/activity/:activity/add/task/:task')
		.all (policy.isAllowed)
		.put (projectcontroller.addTaskToActivity);

	// stream task -> requirement
	app.route ('/api/stream/task/:task/add/requirement/:requirement')
		.all (policy.isAllowed)
		.put (projectcontroller.addRequirementToTask);

	// stream milestone -> stream requirement
	app.route ('/api/stream/milestone/:milestone/add/stream/requirement/:requirement')
		.all (policy.isAllowed)
		.put (projectcontroller.addRequirementToMilestone);

	// stream bucket -> stream requirement
	app.route ('/api/stream/bucket/:bucket/add/stream/requirement/:requirement')
		.all (policy.isAllowed)
		.put (projectcontroller.addRequirementToBucket);
	//
	// middleware to auto-fetch parameter
	//
	app.param ('stream', controller.getObject);
	// app.param ('streamId', controller.getId);
};

