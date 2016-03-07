'use strict';
// =========================================================================
//
// Controller for templates
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _         = require ('lodash');

module.exports = DBModel.extend ({
	name : 'Template',
	plural : 'templates',
	getCurrent: function (code) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findFirst ({code:code},null,{versionNumber:-1})
			.then (function (docs) {
				if (docs[0]) return docs[0];
				else return {};
			})
			.then (resolve, reject);
		});
	},
});

