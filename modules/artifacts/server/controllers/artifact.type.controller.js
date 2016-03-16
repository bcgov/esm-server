'use strict';
// =========================================================================
//
// Controller for projects
//
// =========================================================================
var path               = require('path');
var DBModel            = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _                  = require ('lodash');
var mongoose = require('mongoose');

module.exports = DBModel.extend ({
	name : 'ArtifactType',
	plural : 'artifacttypes'
});
