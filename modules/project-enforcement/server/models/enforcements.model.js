'use strict';
// =========================================================================
//
// Model for enforcements
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.schema.controller')('Enforcement', {
	__audit 			: true,
	// __access 			: ['listEnforcements'],
	__tracking 			: true,
	action				: { type:String, 		default: 'Warning' },
	condition			: [{ type:'ObjectId', 	default: null , ref:'ProjectCondition'}],
	conditionArtifacts	: [{ type:'ObjectId', 	default: null , ref:'Artifact'}],
	status				: { type:String, 		default: 'Open' },
	notes				: { type:String, 		default: '' },
	orderArtifact		: { type:'ObjectId', 	default: null, ref: 'Artifact' },
	date				: { type:Date, 		default: null }
});
