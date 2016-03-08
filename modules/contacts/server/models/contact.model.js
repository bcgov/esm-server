'use strict';
// =========================================================================
//
// Model for contacts
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('Contact', {
	__audit     : true,
	__access    : true,
	__tracking  : true,
	project     : { type:'ObjectId', ref:'Project', default:null, index:true },
	groupId     : { type:String, default: '' },
	contactName : { type:String, default: '' },
	org     	: { type:'ObjectId', ref:'Org', default:null, index:true },
	title     	: { type:String, default: '' },
	firstName   : { type:String, default: '' },
	middleName  : { type:String, default: '' },
	lastName    : { type:String, default: '' },
	phoneNumber : { type:String, default: '' },
	email       : { type:String, default: '' }
});