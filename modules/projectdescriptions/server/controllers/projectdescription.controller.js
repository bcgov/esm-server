'use strict';
// =========================================================================
//
// Controller for projectdescriptions
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _         = require ('lodash');

module.exports = DBModel.extend ({
	name : 'ProjectDescription',
	sort : {versionNumber: -1},
	saveAs: function (type, desc) {
		var self = this;
		delete desc._id;
		desc.versionNumber++;
		desc.version = type;
		return new Promise (function (resolve, reject) {
			self.newDocument (desc)
			.then (self.saveDocument)
			.then (resolve, reject);
		});
	}
});

