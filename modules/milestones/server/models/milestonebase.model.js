'use strict';
// =========================================================================
//
// Model for activity set Base
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('MilestoneBase', {
	__access     : true,
	__codename  : true,
	activities  : [ {type: 'ObjectId', ref:'ActivityBase'} ],
	order	  : { type: Number, default:0 }
});

