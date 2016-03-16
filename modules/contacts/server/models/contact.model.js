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
	contactName : { type:String, default: '' },
	code: 		{type:String, default: ''},
	org     	: { type:'ObjectId', ref:'Org', default:null, index:true },
	orgName    	: { type:String, default: '' },
	personId 	: { type:Number, default: null }, // From ePIC
	title     	: { type:String, default: '' },
	firstName   : { type:String, default: '' },
	middleName  : { type:String, default: '' },
	lastName    : { type:String, default: '' },
	phoneNumber : { type:String, default: '' },
	homePhoneNumber : { type:String, default: '' },
	email       : { type:String, default: '' },

	// if groupId == null, then this is a person (hack)
	eaoStaffFlag : { type:Boolean, default: false },
	proponentFlag : { type:Boolean, default: false },
	salutation  : { type:String, default: '' },
	department  : { type:String, default: '' },
	faxNumber   : { type:String, default: '' },
	cellPhoneNumber : { type:String, default: '' },
	address1    : { type:String, default: '' },
	address2    : { type:String, default: '' },
	city        : { type:String, default: '' },
	province    : { type:String, default: '' },
	country     : { type:String, default: '' },
	postalCode  : { type:String, default: '' },
	notes       : { type:String, default: '' }
});