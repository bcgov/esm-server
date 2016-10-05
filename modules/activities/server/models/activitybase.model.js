'use strict';
// =========================================================================
//
// Model for activities base
//
// An activity base is just a template used for creating activities that
// can occur multiple times under any number of milestones
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.schema.controller')
('ActivityBase', {
	//
	// unique code. name, and description
	//
	__codename    : true,
	//
	// default roles to use., one set for eao and one for proponent side
	//
	default_eao_read   : [ {type:String} ],
	default_eao_write  : [ {type:String} ],
	default_eao_submit : [ {type:String} ],
	default_eao_watch  : [ {type:String} ],
	default_pro_read   : [ {type:String} ],
	default_pro_write  : [ {type:String} ],
	default_pro_submit : [ {type:String} ],
	default_pro_watch  : [ {type:String} ],
	//
	// begin immediately upon creation ?
	//
	startOnCreate : { type:Boolean, default:false },
	//
	// the order that this should appear in lists
	//
	order         : { type:Number, default:0 },
	//
	// the default duration to use when setting estimated completion date
	//
	duration      : { type:Number, default:14 },
	//
	// the name of the state to transition to in the user interface
	// this will be a key that gets matched in the ui, just in case the
	// ui states change over time and the front and back get out of sync
	//
	state         : { type:String, default:'' },

	processCode		: { type:String, default:'' }

});
