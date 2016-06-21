'use strict';
// =========================================================================
//
// Controller for inspectionreport
//
// =========================================================================
var path     = require('path');
var DBModel  = require (path.resolve('./modules/core/server/controllers/cc.dbmodel.controller'));

module.exports = DBModel.extend ({
	name : 'Inspectionreportdetail',
	plural : 'inspectionreportdetails'
});

