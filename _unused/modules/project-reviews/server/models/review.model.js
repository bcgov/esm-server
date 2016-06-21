'use strict';
// =========================================================================
//
// Model for reviews
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('Review', {
	__audit    : true,
	__access   : true,
	project    : { type:'ObjectId', ref:'Project', default:null, index:true },
	period     : { type:'ObjectId', ref:'Period', default:null, index:true },
	type       : { type:String, default: '' },
	targetType : { type:String, default: '' },
	target     : { type:'ObjectId' },
	parent     : { type:'ObjectId', ref:'Review', default:null, index:true },
	ancestor   : { type:'ObjectId', ref:'Review', default:null, index:true },
	resolved   : { type:Boolean, default:false },
	published  : { type:Boolean, default:false },
	user       : { type:'ObjectId', ref:'User', default:null, index:true },
	review    : { type:String, default:'' },
	documents  : [ {type:'ObjectId', ref:'Document'} ]
});

