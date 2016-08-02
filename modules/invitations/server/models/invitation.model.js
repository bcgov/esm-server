'use strict';
// =========================================================================
//
// Model for invitations
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.schema.controller')
('Invitation', {
	__audit  : true,
	project  : { type:'ObjectId', ref:'Project', default:null, index:true},
	user     : { type:'ObjectId', ref:'User', default:null, index:true},
	accepted : { type: Date }
});

