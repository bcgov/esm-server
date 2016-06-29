'use strict';
// =========================================================================
//
// Model for features
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('Feature', {
	__access           : true,
	__codename         : true,
	project            : { type:'ObjectId', default:null, ref:'Project' },
	isBase             : { type:Boolean, default:false },
	path               : { type:String, default:'' }
});

