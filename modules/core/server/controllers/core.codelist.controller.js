'use strict';

var path      = require('path');
var _         = require ('lodash');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var CodeList  = require('mongoose').model('CodeList');

module.exports = DBModel.extend ({
	name: 'CodeList',
	plural: 'codelists'

});