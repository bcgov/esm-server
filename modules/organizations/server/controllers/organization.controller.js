'use strict';
// =========================================================================
//
// Controller for organization
//
// =========================================================================
var path     = require('path');
var DBModel  = require (path.resolve('./modules/core/server/controllers/cc.dbmodel.controller'));

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
		if (!org.code) {
			org.code = org.name.toLowerCase ();
			org.code = org.code.replace (/\W/g,'-');
			org.code = org.code.replace (/-+/,'-');
			//
			// this does the work of that and returns a promise
			//
			var self = this;
			return new Promise (function (resolve, reject) {
				self.guaranteeUniqueCode (org.code)
				.then (function (cd) {
					org.code = cd;
					return org;
				})
				.then (resolve, reject);
			});
		}
		else {
			return org;
		}
	},
});

