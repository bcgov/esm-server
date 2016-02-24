'use strict';
// =========================================================================
//
// Controller for projectdescriptions
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _         = require ('lodash');

module.exports = DBModel.extend ({
	name : 'ProjectDescription',
	sort : {versionNumber: -1}
});

