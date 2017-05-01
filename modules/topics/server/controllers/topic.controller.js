'use strict';
// =========================================================================
//
// Controller for topics
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _         = require ('lodash');

module.exports = DBModel.extend ({
	name : 'Topic',
	plural : 'topics',
	sort: 'name'
});

