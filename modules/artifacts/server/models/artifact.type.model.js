'use strict';
// =========================================================================
//
// model for artifact type
//
// =========================================================================

var mongoose = require ('mongoose');

module.exports = mongoose.model ('ArtifactType', new mongoose.Schema ({
	code            : { type:String, default:'' , unique:true },
	name            : { type:String, default:''},
	initiator       : { type:String, default:'EAO', enum:['EAO','Proponent'] },
	isTemplate      : { type:Boolean, default:true },
	isArtifactCollection : { type:Boolean, default: false },
	isDocument      : { type:Boolean, default:false },
	multiple        : { type:Boolean, default:false },
	versions        : [{ type:String }],
	stages          : [{
		name: { type:String },
		next: { type:String },
		prev: { type:String },
		labelNext: { type:String },
		labelPrev: { type:String },
		role: { type:String },
		roles: {
			default_eao_read   : [ {type:String} ],
			default_eao_write  : [ {type:String} ],
			default_eao_submit : [ {type:String} ],
			default_eao_watch  : [ {type:String} ],
			default_pro_read   : [ {type:String} ],
			default_pro_write  : [ {type:String} ],
			default_pro_submit : [ {type:String} ],
			default_pro_watch  : [ {type:String} ]
		} ,
		activity: { type:'String' }
	}],
	milestone       : { type:'String' },
	phase           : { type:'String' }
}));
