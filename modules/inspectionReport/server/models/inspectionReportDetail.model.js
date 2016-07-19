'use strict';
// =========================================================================
//
// Model for tasks
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.schema.controller')
('Inspectionreportdetail', {
	__audit       : true,
	__access      : [],
	__codename    : true,
	complianceTypes						: { type: String, default:'' },
	requirementDescription				: { type: String, default:'' },
	findings							: { type: String, default:'' },
	compliance							: { type: String, default:'' } // ,
	// inspectionReport					: {type: 'ObjectId', ref: 'Inspectionreport' }
});

