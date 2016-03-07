'use strict';
// =========================================================================
//
// Model for orgs
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('Org', {
	__audit     : true,
	__access    : true,
	__tracking  : true,
	project     : { type:'ObjectId', ref:'Project', default:null, index:true },
	stage       : { type:String, enum:['Pre-Construction', 'Construction', 'Operations', 'Decommissioning'], default:'Operations' },
	org   : { type:String, default: ''},
	complainant : { type:String, default: '' },
	vcs         : [ { type:String } ]
});

