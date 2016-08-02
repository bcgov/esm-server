'use strict';
// =========================================================================
//
// Model for streams
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.schema.controller')
('Stream', {
	__codename  : 'unique',
	//
	// the list of phases, by code since they are abstract
	//
	phases       : [ {type:String} ],
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
	// the order that this should appear in lists
	//
	order         : { type:Number, default:0 }
});

