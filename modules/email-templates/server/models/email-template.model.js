'use strict';
// =========================================================================
//
// Model for orgs
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('EmailTemplate', {
	__audit  : true,
	__codename: true,
	content  : { type: String, default:'' },
	group  : { type: String, default:'General' }
});

