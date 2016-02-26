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
	},
	getCurrent: function (projectId) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findFirst ({project:projectId},null,{versionNumber:-1})
			.then (function (docs) {
				console.log('here', docs);
				if (docs[0]) return docs[0];
				else return {};
			})
			.then (resolve, reject);
		});
	},
	getVersions: function (projectId) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findMany ({project:projectId},{version:1, versionNumber:1})
			.then (resolve, reject);
		});
	},
	getCurrentInfo: function (projectId) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findFirst ({project:projectId},{version:1, versionNumber:1},{versionNumber:-1})
			.then (resolve, reject);
		});
	},
	getVersionList: function (projectId) {
		return new Promise (function (resolve, reject) {
			resolve ([
				'Submission',
				'Draft',
				'Final',
				'Draft for Draft AIR',
				'Final for Draft AIR',
				'Draft for AIR',
				'Final for AIR',
				'Draft for Application',
				'Certified (Schedule A)'
			]);
		});
	}
});

