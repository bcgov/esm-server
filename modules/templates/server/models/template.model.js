'use strict';
// =========================================================================
//
// Model for order tempaltes
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('Template', {
	__audit       : true,
	__codename    : true,
	version       : { type:String },
	versionNumber : { type:Number, default:0 },
	template      : { type:String, default: '' }
});

