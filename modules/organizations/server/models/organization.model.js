'use strict';
// =========================================================================
//
// Model for tasks
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.schema.controller')('Organization', {
	//__audit       : true,
	__codename    : 'unique',
	legalName     : { type: String, default:'' },
	orgCode       : { type: String, default:'' },
	orgType       : { type: String, default:'' },
	website       : { type: String, default:'' },
	address1      : { type: String, default:'' },
	address2      : { type: String, default:'' },
	city          : { type: String, default:'' },
	province      : { type: String, default:'' },
	postal        : { type: String, default:'' },
	country       : { type: String, default:'' }
});

