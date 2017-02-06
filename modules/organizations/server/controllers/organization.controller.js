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
	populate: 'primaryContact',
	preprocessAdd: function (org) {
		if (!org.code) {
			if (org.orgCode) {
				org.code = org.orgCode.toLowerCase ();
			} else {
				org.code = org.name.toLowerCase ();
			}
			org.code = org.code.replace (/\W/g,'-');
			org.code = org.code.replace (/^-+|-+(?=-|$)/g, '');
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
	}
});

