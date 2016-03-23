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
	order	  : { type:Number, default:0 },
	duration  : { type:Number, default:14 },
	state     : { type:String, default:'' }
});
