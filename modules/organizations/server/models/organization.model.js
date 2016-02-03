'use strict';
// =========================================================================
//
// Model for tasks
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('Organization', {
	__audit       : true,
	__access      : true,
	__codename    : 'unique',
	website       : { type: String, default:'' },
	companyLegal  : { type: String, default:'' },
	registeredIn  : { type: String, default:'' },
	parentCompany : { type: String, default:'' },
	companyType   : { type: String, default:'' },
	address1      : { type: String, default:'' },
	address2      : { type: String, default:'' },
	city          : { type: String, default:'' },
	province      : { type: String, default:'' },
	postal        : { type: String, default:'' }
});

