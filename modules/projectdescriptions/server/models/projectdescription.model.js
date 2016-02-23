'use strict';
// =========================================================================
//
// Model for projectdescriptions
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('ProjectDescription', {
	__audit        : true,
	__access       : true,
	__tracking     : true,
	project        : { type:'ObjectId', ref:'Project', default:null, index:true},
	version        : { type:String, enum:['Draft', 'Final', 'Certified'], default:'Draft', index:true}

});

