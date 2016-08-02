'use strict';
// =========================================================================
//
// Model for activity set Base
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.schema.controller')('PhaseBase', {
	__codename  : true,
	//
	// milestones as codes
	//
	milestones  : [ {type:String} ],
	//
	// default days this phase is set to take
	//
	duration       : { type:Number, default:90 },
	//
	// just for display purposes. useless
	//
	order	  : { type: Number, default:0 },

	description		: { type:String, default:'' },
});
