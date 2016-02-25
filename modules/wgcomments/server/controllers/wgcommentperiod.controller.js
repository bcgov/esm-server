'use strict';
// =========================================================================
//
// Controller for wgcomments
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _         = require ('lodash');
var ProjectDescription  = require (path.resolve('./modules/projectdescriptions/server/controllers/projectdescription.controller'));

module.exports = DBModel.extend ({
	name : 'WGCommentPeriod',
	newForProject : function (project) {
		var self = this;
		return new Promise (function (resolve, reject) {
			var doc;
			self.newDocument ()
			.then (function (newdoc) {
				doc = newdoc.toObject ();
				doc.project = project._id;
				doc.projectRoles = project.roles;
				doc.currentDocuments = [];
				var pd = new ProjectDescription (self.user);
				return pd.getCurrentInfo (project._id);
			})
			.then (function (info) {
				if (info) {
					info.type = 'Project Description';
					doc.currentDocuments.push (info);
				}
				return doc;
			})
			.then (resolve, reject);
		});
	}
});

