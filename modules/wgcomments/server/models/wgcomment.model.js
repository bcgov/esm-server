'use strict';
// =========================================================================
//
// Model for wgcomments
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('WGComment', {
	__access    : true,
	period      : { type:'ObjectId', ref:'WGCommentPeriod', default:null, index:true},
	parent      : { type:'ObjectId', ref:'WGComment', default:null, index:true},
	user        : { type:'ObjectId', ref:'User', default:null, index:true},
	userName    : { type:String },
	displayName : { type:String },
	isProponent : { type:Boolean, default:false },
	project     : { type:'ObjectId', ref:'Project', default:null, index:true},
	comment     : { type:String, default:'' },
	documents   : [ {type:'ObjectId', ref:'Document'} ]
});

