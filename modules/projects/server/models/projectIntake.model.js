'use strict';
// =========================================================================
//
// Model for Project
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('ProjectIntake', {
	project  : { type:'ObjectId', ref:'Project', index:true, default:null },
	question : { type:String, default:''},
	response : { type:String, default:''}
});
