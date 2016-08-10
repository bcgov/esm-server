'use strict';

module.exports = require ('../../../core/server/controllers/core.schema.controller')
('Notification', {
	//__audit				: true,
	//__access            : [],
	__codename			: 'unique',

	//
	project				: { type:'ObjectId', ref:'Project', default:null, index:true },
	//
	type				: { type:String, default:'Content', enum:['Content', 'Invitation'] },

	// which group did we use (if any)?
	notificationGroup   : { type:'ObjectId', ref:'NotificationGroup', default:null, index:true },

	// store which email template we started with (if any)...
	emailTemplate       : { type:'ObjectId', ref:'EmailTemplate', default:null},
	// store overridden email template properties...
	templateSubject     : { type: String, default:null },
	templateContent     : { type: String, default:null },
	templateData        : {},
	// is this template to be applied per person?
	// ie. contains personal substitutions from the recipient list?
	personalized        : {type: Boolean, default: false},

	artifacts           : [{type:'ObjectId', ref:'Artifact'}],

	// list of recipients, does not have to match up with the users found in the notification group
	// could have adhocs added, group could have changed...
	recipients: [{
		email: {type: String, default: null},
		name: {type: String, default: null},
		// this would be data returned from the email delivery attempt
		accepted: {type: Boolean, default: false},
		rejected: {type: Boolean, default: false},
		messageId: {type: String, default: null}
	}]
});
