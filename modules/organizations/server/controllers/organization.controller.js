'use strict';
// =========================================================================
//
// Controller for organization
//
// =========================================================================
var path     = require('path');
var DBModel  = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));

module.exports = DBModel.extend ({
	name : 'Organization',
	plural : 'organizations'
});

