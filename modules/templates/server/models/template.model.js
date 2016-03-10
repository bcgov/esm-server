'use strict';
// =========================================================================
//
// Model for order templates
//
// =========================================================================
var mongoose = require ('mongoose');

var templateMeta = new mongoose.Schema ({
	name     : { type:String, default:'' },
	type     : { type:String, default:'Text', enum:['Text', 'Html'] },
	label    : { type:String, default:'' },
	default  : { type:String, default:'' }
});
var templateSection = new mongoose.Schema ({
	name     : { type:String, default:'' },
	optional : { type:Boolean, default:false },
	multiple : { type:Boolean, default:false },
	isheader : { type:Boolean, default:false },
	isfooter : { type:Boolean, default:false },
	template : { type:String, default:'' },
	header   : { type:String, default:'' },
	footer   : { type:String, default:'' },
	meta     : [ templateMeta ]
});

module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('Template', {
	__audit       : true,
	documentType  : { type:String, default: '' , index:true},
	versionNumber : { type:Number, default:0, index:true },
	sections      : [ templateSection ]
});

