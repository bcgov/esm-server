'use strict';
// =========================================================================
//
// Controller for phase bases
//
// =========================================================================
var path     = require('path');
var DBModel  = require (path.resolve('./modules/core/server/controllers/cc.dbmodel.controller'));


module.exports = DBModel.extend ({
	name     : 'PhaseBase',
	plural   : 'phasebases',
});


