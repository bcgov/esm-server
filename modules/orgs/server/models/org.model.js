'use strict';
// =========================================================================
//
// Model for orgs
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('Org', {
	__audit       : true,
	__access      : true,
	__codename    : 'unique',
	companyDba    : { type: String, default:'' },
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

