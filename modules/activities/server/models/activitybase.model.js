'use strict';
// =========================================================================
//
// Model for activities base
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('ActivityBase', {
	__access     : true,
	__codename  : true,
	processCode : { type:String    , default:'' },
	tasks       : [ {type: 'ObjectId', ref:'TaskBase'} ],
});
