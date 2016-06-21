'use strict';
// =========================================================================
//
// Controller for activity bases
//
// =========================================================================
var path     = require('path');
var DBModel  = require (path.resolve('./modules/core/server/controllers/cc.dbmodel.controller'));

module.exports = DBModel.extend ({
	name     : 'ActivityBase',
	plural   : 'activitybases'
});


