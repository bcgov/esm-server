'use strict';
// =========================================================================
//
// Model for comments
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('CommentPeriod', {
	__audit      : true,
	__access     : true,
	project      : { type:'ObjectId', ref:'Project', default:null, index:true },
	targetType   : { type:String, default: '' },
	target       : { type:'ObjectId' },
	roles        : { type: String },
	instructions : { type:String, default: '' }
},
{
	roles: 1
}
);


