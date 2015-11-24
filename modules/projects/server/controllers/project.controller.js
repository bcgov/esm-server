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
var _ = require ('lodash');


// -------------------------------------------------------------------------
//
// this is used to flesh out a project to include all its config children
//
// -------------------------------------------------------------------------
var fillProject = function (project, callback) {
	helpers.fillConfigObject (project.toObject (), { project: project._id}, callback);
};



var crud = new CRUD (Project);
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
var setProjectMilestone = function (phase, milestone, cb) {
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
var setProjectActivity = function (phase, activity, cb) {
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
var setProjectTask = function (activity, task, cb) {
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
var setProjectRequirement = function (task, requirement, cb) {
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
	var BucketRequirement = mongoose.model ('BucketRequirement');
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
	streamcontroller.fillStream (req.Stream, function (err, stream) {
		if (err) {
			helpers.sendError (res, err);
			return;
		}
		//
		// remove all ids to make copies, add the project id to each one so it will
		// now reside under this project, essentially copy the entire tree over to
		// this project (we leave the stream id for future reference though)
		//
		_.each (stream.phases      , function (m) { m=m.toObject (); delete m._id; m.project = req.Project._id; });
		_.each (stream.activities  , function (m) { m=m.toObject (); delete m._id; m.project = req.Project._id; });
		_.each (stream.tasks       , function (m) { m=m.toObject (); delete m._id; m.project = req.Project._id; });
		_.each (stream.milestones  , function (m) { m=m.toObject (); delete m._id; m.project = req.Project._id; });
		_.each (stream.buckets     , function (m) { m=m.toObject (); delete m._id; m.project = req.Project._id; });
		_.each (stream.requirements, function (m) { m=m.toObject (); delete m._id; m.project = req.Project._id; });
		//
		// now insert all the 'new' objects
		//
		Activity.collection.insert (stream.activities).exec ()
		.then (function () {
			return Bucket.collection.insert (stream.buckets).exec ();
		})
		.then (function () {
			return Milestone.collection.insert (stream.milestones).exec ();
		})
		.then (function () {
			return Phase.collection.insert (stream.phases).exec ();
		})
		.then (function () {
			return Requirement.collection.insert (stream.requirements).exec ();
		})
		.then (function () {
			return Task.collection.insert (stream.tasks).exec ();
		})
		//
		// when finished, go and gather the new project up and return it
		//
		.then (function () {
			fillProject (req.Project, helpers.queryResponse (res));
			return;
		})
		.then (undefined, function (err) {
			helpers.sendError (res, err);
			return;
		});


	});
};


