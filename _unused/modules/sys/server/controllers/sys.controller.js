'use strict';
// =========================================================================
//
// Controller for system stuff
//
// =========================================================================
var path     = require ('path');
var mongoose = require ('mongoose');
var helpers  = require (path.resolve('./modules/core/server/controllers/core.helpers.controller'));

var ProjectType = mongoose.model ('ProjectType');

exports.configs = function (req, res) {
	helpers.fillConfigObject ({}, { stream: null, project: null}, helpers.queryResponse (res));
};

exports.projecttypes = function (req, res) {
	ProjectType.find().exec(helpers.queryResponse (res));
};
