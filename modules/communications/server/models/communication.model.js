'use strict';

module.exports = require ('../../../core/server/controllers/core.schema.controller')
('Communication', {
	__audit				: true,
	__access            : [],
	__codename          : true,

	//
	project				: { type:'ObjectId', ref:'Project', default:null, index:true },
	//
	type				: { type:String, default:'Content', enum:['Content', 'Invitation'] },

	// which groups did we use (if any)?
	groups              : [{ type:'ObjectId', ref:'Group'}],

	// not all notifications will have documents, but we need to store them
	documents           : [{type:'ObjectId', ref:'Document'}],

	// store which email template we started with (if any)...
	emailTemplate       : { type:'ObjectId', ref:'EmailTemplate', default:null},
	// store overridden email template properties...
	templateSubject     : { type: String, default:null },
	templateContent     : { type: String, default:null },
	templateData        : {},

	subject             : { type: String, default:null },
	content             : { type: String, default:null },

	// is this template to be applied per person?
	// ie. contains personal substitutions from the recipient list?
	personalized        : {type: Boolean, default: false},

	status				: { type:String, enum:['Draft', 'Sent'], default:'Draft' },
	dateSent 			: {type: Date, default: null},

	// list of recipients
	recipients: [{
		// will have adhoc email recipients, not in our contact list...
		// so no user id, no name...
		email: {type: String, default: null},

		// to, cc, bcc - existing data won't have this field, but query result is initialized  = 'to', value won't exist in db until save
		// or we run a migration script to set all missing = 'to'....
		type: {type: String, default: 'to', enum:['to', 'cc', 'bcc']},

		// from user / contact data...
		userId: {type: String, default: null}, // actually the user guid, will need for mail outs...
		displayName: {type: String, default: null},
		org: {type: String, default: null},

		viaEmail : { type:Boolean, default: true }, // will set to false if email starts with "none@specified.com" from import
		viaMail : { type:Boolean, default: false }, // will set to true if email starts with "none@specified.com" from import

		// this stuff is for  mail outs, downloading csv files...
		salutation              : { type:String, default: '' },
		address1                : { type:String, default: '' },
		address2                : { type:String, default: '' },
		city                    : { type:String, default: '' },
		province                : { type:String, default: '' },
		country                 : { type:String, default: '' },
		postalCode              : { type:String, default: '' }
	}]
});
