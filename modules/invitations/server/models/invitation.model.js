'use strict';
// =========================================================================
//
// Model for invitations
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.schema.controller')
('Invitation', {
	__audit  : true,
	user     : { type:'ObjectId', ref:'User', default:null, index:true},
	accepted : { type: Date }
});

