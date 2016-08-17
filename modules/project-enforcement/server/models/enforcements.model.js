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
	condition			: { type:'ObjectId', 	default: null },
	status				: { type:String, 		default: 'Open' },
	date				: { type:Date, 		default: null }
});
