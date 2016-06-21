'use strict';
// =========================================================================
//
// Model for tasks
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('TaskBase', {
	name          : { type:String, default:'New task' },
	description   : { type:String, default:'New task' },
	isRequired    : { type:Boolean, default:true }
});
