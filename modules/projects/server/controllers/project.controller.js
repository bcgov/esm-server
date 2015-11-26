'use strict';
// =========================================================================
//
// Controller for projects
//
// =========================================================================
var path        = require('path');
var mongoose    = require ('mongoose');
var CRUD        = require (path.resolve('./modules/core/server/controllers/core.crud.controller'));
var helpers     = require (path.resolve('./modules/core/server/controllers/core.helpers.controller'));
var streamcontroller  = require (path.resolve('./modules/streams/server/controllers/stream.controller'));
var Project     = mongoose.model ('Project');
var Phase       = mongoose.model ('Phase')       ;
var Activity    = mongoose.model ('Activity')    ;
var Task        = mongoose.model ('Task')        ;
var Milestone   = mongoose.model ('Milestone')   ;
var Bucket      = mongoose.model ('Bucket')      ;
var Requirement = mongoose.model ('Requirement') ;
var BucketRequirement = mongoose.model ('BucketRequirement');
var ProjectRole = mongoose.model ('ProjectRole');
var _ = require ('lodash');


// -------------------------------------------------------------------------
//
// this is used to flesh out a project to include all its config children
//
// -------------------------------------------------------------------------
var fillProject = function (project, callback) {
	project = project.toObject ();
	// project.roles = [];
	// ProjectRole.find ({project:project._id})
	// .exec ()
	// .then (function (roles) {
	// 	project.roles = roles;
		helpers.fillConfigObject (project, { project: project._id}, callback);
	// })
	// .then (null, function (err) {
	// 	callback (err, null);
	// });
};



var crud = new CRUD (Project);//, {
// 	populate: [
// 		{path:'stream',       select:'code name description'},
// 		{path:'proponent',    select:'name type'},
// 		{path:'currentPhase', select:'code name description'},
// 		{path:'nextPhase',    select:'code name description'}
// 	]
// });

// -------------------------------------------------------------------------
//
// Basic CRUD
//
// -------------------------------------------------------------------------
exports.new       = crud.new       ( fillProject );
exports.read      = crud.read      ( fillProject );
exports.getObject = crud.getObject ( );
exports.create    = crud.create ();
exports.update    = crud.update ();
exports.delete    = crud.delete ();
exports.list      = crud.list   ();

// -------------------------------------------------------------------------
//
// add a phase to a stream
// cb is function (err, model)
//
// -------------------------------------------------------------------------
var addStreamPhase = function (stream, phase, cb) {
	phase = phase.toObject ();
	delete phase._id;
	phase        = new Phase (phase);
	phase.stream = stream._id;
	phase.save (cb);
};
exports.addStreamPhase = addStreamPhase;
exports.addPhaseToStream = function (req, res) {
	addStreamPhase (req.Stream, req.Phase, helpers.queryResponse (res));
};

// -------------------------------------------------------------------------
//
// add a bucket to a stream
// cb is function (err, model)
//
// -------------------------------------------------------------------------
var addStreamBucket = function (stream, bucket, cb) {
	bucket        = bucket.toObject ();
	delete bucket._id ;
	bucket        = new Bucket (bucket);
	bucket.stream = stream._id;
	bucket.save (cb);
};
exports.addStreamBucket = addStreamBucket;
exports.addBucketToStream = function (req, res) {
	addStreamBucket (req.Stream, req.Bucket, helpers.queryResponse (res));
};

// -------------------------------------------------------------------------
//
// add a phase to a project
// cb is function (err, model)
//
// -------------------------------------------------------------------------
var setProjectPhase = function (project, phase) {
	phase = phase.toObject ();
	delete phase._id ;
	phase         = new Phase (phase);
	phase.project = project._id;
	phase.stream  = project.stream;
	return phase;
};
exports.addPhaseToProject = function (req, res) {
	setProjectPhase (req.Project, req.Phase).save (helpers.queryResponse (res));
};

// -------------------------------------------------------------------------
//
// add a bucket to a project
// cb is function (err, model)
//
// -------------------------------------------------------------------------
var setProjectBucket = function (project, bucket) {
	bucket = bucket.toObject ();
	delete bucket._id ;
	bucket         = new Bucket (bucket);
	bucket.project = project._id;
	bucket.stream  = project.stream;
	return bucket;
};
exports.addBucketToProject = function (req, res) {
	setProjectBucket (req.Project, req.Bucket).save (helpers.queryResponse (res));
};

// -------------------------------------------------------------------------
//
// add a milestone to a phase
// cb is function (err, model)
//
// -------------------------------------------------------------------------
var setProjectMilestone = function (phase, milestone) {
	milestone = milestone.toObject ();
	delete milestone._id ;
	milestone         = new Milestone (milestone);
	milestone.phase   = phase._id;
	milestone.project = phase.project;
	milestone.stream  = phase.stream;
	return milestone;
};
exports.addMilestoneToPhase = function (req, res) {
	setProjectMilestone (req.Phase, req.Milestone).save (helpers.queryResponse (res));
};

// -------------------------------------------------------------------------
//
// add an activity to a phase
//
// -------------------------------------------------------------------------
var setProjectActivity = function (phase, activity) {
	activity = activity.toObject ();
	delete activity._id ;
	activity         = new Activity (activity);
	activity.phase   = phase._id;
	activity.project = phase.project;
	activity.stream  = phase.stream;
	return activity;
};
exports.addActivityToPhase = function (req, res) {
	setProjectActivity (req.Phase, req.Activity).save (helpers.queryResponse (res));
};

// -------------------------------------------------------------------------
//
// add a task to an activity
//
// -------------------------------------------------------------------------
var setProjectTask = function (activity, task) {
	task = task.toObject ();
	delete task._id ;
	task          = new Task (task);
	task.activity = activity._id;
	task.phase    = activity.phase;
	task.project  = activity.project;
	task.stream   = activity.stream;
	return task;
};
exports.addTaskToActivity = function (req, res) {
	setProjectTask (req.Activity, req.Task).save (helpers.queryResponse (res));
};

// -------------------------------------------------------------------------
//
// add a requirement to a task
//
// -------------------------------------------------------------------------
var setProjectRequirement = function (task, requirement) {
	requirement = requirement.toObject ();
	delete requirement._id ;
	requirement          = new Requirement (requirement);
	requirement.task     = task._id;
	requirement.activity = task.activity;
	requirement.phase    = task.phase;
	requirement.project  = task.project;
	requirement.stream   = task.stream;
	return requirement;
};
exports.addRequirementToTask = function (req, res) {
	setProjectRequirement (req.Task, req.Requirement).save (helpers.queryResponse (res));
};

// -------------------------------------------------------------------------
//
// add an existing project requirement to a project milestone
//
// -------------------------------------------------------------------------
var setMilestoneRequirement = function (milestone, requirement, cb) {
	if ((milestone.project !== requirement.project) && (milestone.stream !== requirement.stream)) {
		cb ({
			message: 'Requirement must already exist in same project or stream as milestone'
		}, null);
		return;
	}
	requirement.milestone = milestone._id;
	requirement.project   = milestone.project;
	requirement.stream    = milestone.stream;
	return requirement;
};
exports.addRequirementToMilestone = function (req, res) {
	setMilestoneRequirement (req.Milestone, req.Requirement).save (helpers.queryResponse (res));
};

// -------------------------------------------------------------------------
//
// add an existing project requirement to a project bucket
//
// -------------------------------------------------------------------------
var setBucketRequirement = function (bucket, requirement, cb) {
	if ((bucket.project !== requirement.project) && (bucket.stream !== requirement.stream)) {
		cb ({
			message: 'Requirement must already exist in same project or stream as bucket'
		}, null);
		return;
	}

	var br                = new BucketRequirement ();
	br.bucket             = bucket._id;
	br.project            = bucket.project;
	br.stream             = bucket.stream;
	br.requirement        = requirement._id;
	return br;
};
exports.addRequirementToBucket = function (req, res) {
	setBucketRequirement (req.Bucket, req.Requirement).save (helpers.queryResponse (res));
};


// -------------------------------------------------------------------------
//
// this copies the entire stream into the project. It can be destructive so
// it should only be called once
//
// -------------------------------------------------------------------------
exports.setStream = function (req, res) {
	//
	// go get the entire set of stuff that makes up the stream
	//
	req.Project.stream = req.Stream._id;
	streamcontroller.fillStream (req.Stream, function (err, stream) {
		if (err) {
			helpers.sendError (res, err);
			return;
		}
		//
		// first we need to adjust everything to new ids, must be done
		// in the right order mapping everytihng back to the original
		// in the end, all the stream arrays will hold new models ready
		// to be saved
		//
		var phasemap = {};
		var bucketmap = {};
		var milestonemap = {};
		var activitymap = {};
		var taskmap = {};
		var requirementmap = {};
		stream.phases = stream.phases.map (function (phase) {
			var oldPhaseId        = phase._id;
			phasemap [oldPhaseId] = setProjectPhase (req.Project, phase);
			return phasemap [oldPhaseId];
		});
		stream.buckets = stream.buckets.map (function (bucket) {
			var oldBucketId         = bucket._id;
			bucketmap [oldBucketId] = setProjectBucket (req.Project, bucket);
			return bucketmap [oldBucketId];
		});
		stream.milestones = stream.milestones.map (function (milestone) {
			var oldMilestoneId            = milestone._id;
			var newPhase                  = phasemap [milestone.phase];
			milestonemap [oldMilestoneId] = setProjectMilestone (newPhase, milestone);
			return milestonemap [oldMilestoneId];
		});
		stream.activities = stream.activities.map (function (activity) {
			var oldActivityId           = activity._id;
			var newPhase                = phasemap [activity.phase];
			activitymap [oldActivityId] = setProjectActivity (newPhase, activity);
			return activitymap [oldActivityId];
		});
		stream.tasks = stream.tasks.map (function (task) {
			var oldTaskId       = task._id;
			var newActivity     = activitymap [task.activity];
			taskmap [oldTaskId] = setProjectTask (newActivity, task);
			return taskmap [oldTaskId];
		});
		stream.requirements = stream.requirements.map (function (requirement) {
			var oldRequirementId              = requirement._id;
			var newTask                       = taskmap [requirement.task];
			var newMilestone                  = milestonemap [requirement.milestone];
			if (newMilestone) requirement.milestone = newMilestone._id;
			requirementmap [oldRequirementId] = setProjectRequirement (newTask, requirement);
			return requirementmap [oldRequirementId];
		});
		stream.bucketrequirements = stream.bucketrequirements.map (function (bucketrequirement) {
			return new BucketRequirement ({
				project     : req.Project._id,
				stream      : req.Stream._id,
				requirement : requirementmap [bucketrequirement.requirement]._id,
				bucket      : bucketmap [bucketrequirement.bucket]._id
			});
		});
		// console.log ('got here with stream ', stream);
		// fillProject (req.Project, helpers.queryResponse (res));
		//
		// now the saving bit
		//
		// this is going to be weird. we must do all of this in a big
		// chain of promises, but that isnt easy so we do a map reduce
		// becuase its all open ended. dont forget to save the project too!
		//
		var mf = function (model) { return model.save (); };
		var rf = function (p, c) { return p.then (function () {return c;}); };

		stream.phases.concat (
			stream.buckets,
			stream.milestones,
			stream.activities,
			stream.tasks,
			stream.requirements,
			stream.bucketrequirements
		)
		.map (mf).reduce (rf)
		.then (function (result) {
			return req.Project.save();
		})
		.then (function () {
			fillProject (req.Project, helpers.queryResponse (res));
		})
		.then (null, function (err) {
			console.log ('errors abound!');
			helpers.sendError (res, err);
		});
	});
};


