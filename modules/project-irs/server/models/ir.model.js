'use strict';
// =========================================================================
//
// Model for irs
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.schema.controller')('Ir', {
	__audit     : true,
	__access    : ['createInspectionReport'],
	__tracking  : true,
	project     : { type:'ObjectId', ref:'Project', default:null, index:true },
	stage       : { type:String, enum:['Pre-Construction', 'Construction', 'Operations', 'Decommissioning'], default:'Operations' },
	ir 			: { type:String, default: ''},
	complainant : { type:String, default: '' },
	artifact 	: { type:'ObjectId', ref:'Artifact'},
    conditions          : [ { type:'ObjectId', ref:'ProjectCondition' } ],
	conditionArtifacts  : [ { type:'ObjectId', ref:'Artifact'} ],
    enforcementActions  : [ { type:'ObjectId', ref:'Enforcements'} ]
});

