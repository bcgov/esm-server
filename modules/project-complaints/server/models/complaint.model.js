'use strict';
// =========================================================================
//
// Model for complaints
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.schema.controller')
('Complaint', {
	__audit     : true,
	__access    : [],
	__tracking  : true,
	project     : { type:'ObjectId', ref:'Project', default:null, index:true },
	stage       : { type:String, enum:['Pre-Construction', 'Construction', 'Operations', 'Decommissioning'], default:'Operations' },
	complaint   : { type:String, default: ''},
	complainant : { type:String, default: '' },
	vcs         : [ { type:String } ]
});

