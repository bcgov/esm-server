'use strict';
// =========================================================================
//
// Controller for streams
//
// =========================================================================
var path     = require('path');
var DBModel  = require (path.resolve('./modules/core/server/controllers/cc.dbmodel.controller'));


module.exports = DBModel.extend ({
	name : 'Stream',
	plural : 'streams',
});


