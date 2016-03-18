'use strict';
// =========================================================================
//
// Model for orgs
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('RecentActivity', {
	__audit   	: true,
	__access  	: true,
	headline		: { type: String, default:'' },
	content		: { type: String, default:'' },
	project 		: { type: 'ObjectId', ref:'Project', index:true, default:null },
	dateAdded 	: { type: Date, default: Date.now },
	active		: { type: Boolean, default: true },
	priority		: { type: Number, default: 2, index:true },
	type 		: { type: String, default:'' }
});

