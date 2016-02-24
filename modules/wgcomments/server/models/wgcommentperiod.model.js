'use strict';
// =========================================================================
//
// Model for wgcomment period
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('WGCommentPeriod', {
	__audit              : true,
	__access             : true,
	__tracking           : true,
	__status             : ['Not Started', 'In Progress', 'Complete'],
	project              : { type:'ObjectId', ref:'Project', default:null, index:true},
	content              : {type:String, default: ''},
	contentVersionNumber : {type:Number, default:0},
	roles                : { type: String },
	instructions         : {type:String, default: ''}
},
{
	roles: 1
}
);

