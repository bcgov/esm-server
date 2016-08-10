'use strict';

module.exports = require ('../../../core/server/controllers/core.schema.controller')
('Notificationgroup', {
	//__audit				: true,
	//__access            : [],
	__codename			: 'unique',

	//
	project				: { type:'ObjectId', ref:'Project', default:null, index:true },

	// track which user groups were used to build this notification group
	groups              : [{type: 'ObjectId', ref: 'Group'}],
	// track which organizations were used to build this notification group
	organizations       : [{type: 'ObjectId', ref: 'Organization'}],

	// this is ALL users in the groups and in the organizations (at time of create) and adhoc added
	recipients: [{
		email: {type: String, default: null},
		name: {type: String, default: null}
	}],

	notifications       : [{type: 'ObjectId', ref: 'Notification'}]

});
