'use strict';
// =========================================================================
//
// Model for orgs
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.schema.controller')
('RecentActivity', {
	__audit  : true,
	headline : { type: String, default:'' },
	content  : { type: String, default:'' },
	project  : { type: 'ObjectId', ref:'Project', index:true, default:null },
	active   : { type: Boolean, default: true },
	priority : { type: Number, default: 2, index:true },
	type     : { type: String, default:'' } // news | public comment period
});

