'use strict';
// =========================================================================
//
// Controller for streams
//
// =========================================================================
var path     = require('path');
var mongoose = require ('mongoose');
var CRUD     = require (path.resolve('./modules/core/server/controllers/core.crud.controller'));
var Model    = mongoose.model ('Stream');

var crud = new CRUD (Model);
// -------------------------------------------------------------------------
//
// Basic CRUD that uses the CRUD shortcuts
//
// -------------------------------------------------------------------------
exports.read   = crud.read   ();
exports.update = crud.update ();
exports.delete = crud.delete ();
exports.list   = crud.list   ();
exports.byId   = crud.byId   ();

// -------------------------------------------------------------------------
//
// New, generate a complex new stream object with all sub-objects also new
//
// -------------------------------------------------------------------------
exports.new    = function (req, res) {
	var stream      = new Model ();
	var phase       = new ( mongoose.model ('Phase')) ();
	var activity    = new ( mongoose.model ('Activity') ) ();
	var task        = new ( mongoose.model ('Task') ) ();
	var milestone   = new ( mongoose.model ('Milestone') ) ();
	var bucket      = new ( mongoose.model ('Bucket') ) ();
	var requirement = new ( mongoose.model ('Requirement') ) ();
	//
	// flatten this out
	//
	stream = stream.toObject();
	//
	// insert them all wherever form the bottom up
	//
	requirement.stream      = stream._id;
	requirement.phase       = phase._id;
	requirement.activity    = activity._id;
	requirement.task        = task._id;
	requirement.milestone   = milestone._id;
	requirement.bucket      = bucket._id;

	bucket.stream           = stream._id;
	bucket.visibleAtPhase   = phase._id;

	milestone.phase         = phase._id;
	milestone.requirements  = [requirement._id];

	task.requirement        = requirement._id;
	task.activity           = activity._id;

	activity.phase          = phase._id;
	activity.visibleAtPhase = phase._id;

	phase.stream            = stream._id;

	stream.phases       = [ phase ];
	stream.activities   = [ activity ];
	stream.tasks        = [ task ];
	stream.milestones   = [ milestone ];
	stream.buckets      = [ bucket ];
	stream.requirements = [ requirement ];

	res.json (stream);
};

exports.create = crud.create ();

