'use strict';
// =========================================================================
//
// Model for conditions
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('Conditions', {
	__audit        : true,
	__access       : true,
	__tracking     : true,
	__status       : ['Not Started', 'Not Required', 'In Progress', 'Complete'],
	__codename     : true,
	project        : { type:'ObjectId', ref:'Project', default:null, index:true}
});

