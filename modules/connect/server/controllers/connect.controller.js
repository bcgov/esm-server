'use strict';
// =========================================================================
//
// Controller for Documents
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _         = require ('lodash');
var mongoose 	= require ('mongoose');
var ConnectComment 	= mongoose.model ('ConnectComment');

module.exports = DBModel.extend ({
	name : 'ConnectComment',
	plural : 'connectComments'
});

