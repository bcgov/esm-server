'use strict';
// =========================================================================
//
// Controller for streams
//
// =========================================================================
var path     = require('path');
var mongoose = require ('mongoose');
var CRUD     = require (path.resolve('./modules/core/server/controllers/core.crud.controller'));
var helpers  = require (path.resolve('./modules/core/server/controllers/core.helpers.controller'));

var Model    = mongoose.model ('Stream');
var _        = require ('lodash');
var Activity    = mongoose.model ('Activity');
var Bucket      = mongoose.model ('Bucket');
var Milestone   = mongoose.model ('Milestone');
var Phase       = mongoose.model ('Phase');
var Requirement = mongoose.model ('Requirement');
var Task        = mongoose.model ('Task');

// -------------------------------------------------------------------------
//
// this fills out a stream with all of its config objects
//
// -------------------------------------------------------------------------
var fillStream = function (stream, callback) {
	helpers.fillConfigObject (stream.toObject (), { stream: stream._id, project: null}, callback);
};

var crud = new CRUD (Model);
// -------------------------------------------------------------------------
//
// Basic CRUD that uses the CRUD shortcuts
//
// -------------------------------------------------------------------------
exports.read      = crud.read      ( fillStream );
exports.new       = crud.new       ( fillStream );
exports.getObject = crud.getObject ( );
exports.update    = crud.update ();
exports.delete    = crud.delete ();
exports.list      = crud.list   ();
exports.create    = crud.create ();

exports.fillStream = fillStream;


