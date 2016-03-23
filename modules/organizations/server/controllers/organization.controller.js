'use strict';
// =========================================================================
//
// Controller for organization
//
// =========================================================================
var path     = require('path');
var DBModel  = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));

module.exports = DBModel.extend ({
	name : 'Organization',
	plural : 'organizations',
	preprocessAdd: function (org) {
		if (!org.name && !org.company) {
			org.name = org.company = 'No Name';
		} else if (!org.name && org.company) {
			org.name = org.company;
		} else if (!org.company && org.name) {
			org.company = org.name;
		}
		return org;
	},
});

