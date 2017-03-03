'use strict';

var path      = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var mongoose	= require ('mongoose');
var Model			= mongoose.model ('CodeList');

module.exports = DBModel.extend ({
	name: 'CodeList',
	plural: 'codelists'

});