'use strict';
// =========================================================================
//
// Model for activity set Base
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('Group', {
	__access     : true,
	__codename  : false,
	groupId     : { type:Number, default: 0 }, // From ePIC
	groupName 	: { type:String, default: '' },
	groupType 	: { type:String, default: '' },
	personId    : { type:Number, default: 0 },
	epicProjectID : { type:Number, default: 0},  // Used to relate ePIC imports
	project     : { type:'ObjectId', ref:'Project', default:null, index:true }
});
