'use strict';
// =========================================================================
//
// Controller for system stuff
//
// =========================================================================
var path     = require ('path');
var mongoose = require ('mongoose');
var helpers  = require (path.resolve('./modules/core/server/controllers/core.helpers.controller'));

var Activity    = mongoose.model ('Activity');
var Bucket      = mongoose.model ('Bucket');
var Milestone   = mongoose.model ('Milestone');
var Phase       = mongoose.model ('Phase');
var Requirement = mongoose.model ('Requirement');
var Task        = mongoose.model ('Task');

exports.configs = function (req, res) {
	helpers.fillConfigObject ({}, { stream: null, project: null}, helpers.queryResponse (res));
};
