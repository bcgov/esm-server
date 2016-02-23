'use strict';
// =========================================================================
//
// Model for streams
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('Stream', {
	__access : true,
	__codename  : 'unique',
	phases       : [ {type: 'ObjectId', ref:'PhaseBase'} ],
	roles : [ { type:String} ],
	order	  : { type: Number, default:0 }
});


