'use strict';
// =========================================================================
//
// Controller for Folders
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _         = require ('lodash');
var CSVParse 	= require ('csv-parse');
var Project    = require (path.resolve('./modules/projects/server/controllers/project.controller'));
var mongoose 	= require ('mongoose');
var FolderModel 	= mongoose.model ('Folder');

module.exports = DBModel.extend ({
	name : 'Folder',
	plural : 'folders',
	populate: [{ path: 'addedBy', select: '_id displayName username email orgName' }, { path: 'updatedBy', select: '_id displayName username email orgName' }],
	// -------------------------------------------------------------------------
	//
	// this is what happens before the new folder is saved, any last minute
	// mods are performed here
	//
	// -------------------------------------------------------------------------
	preprocessAdd: function (doc) {
		return doc;
	},
	preprocessUpdate: function(doc) {
		return doc;
	},
	// -------------------------------------------------------------------------
	//
	// get documents for a project sort by name
	//
	// -------------------------------------------------------------------------
	getFoldersForProject : function (projectid, parentid) {
		return this.list ({
			project: projectid,
			parentID: parentid
		});
	},
	// -------------------------------------------------------------------------
	getList : function (list) {
		return this.list ({_id : {$in : list }});
	},
	getListIgnoreAccess : function (list) {
		return this.listforaccess ('ignore the access level', {_id : {$in : list }});
	},
	publish: function(doc) {
		if (!doc)
			return Promise.resolve();
		
		return new Promise(function (resolve, reject) {
				doc.publish();
				doc.save()
				.then(function() {
					return doc;
				})
				.then(resolve, reject);
		});
	},
	unpublish: function(doc) {
		if (!doc)
			return Promise.resolve();
		
		return new Promise(function (resolve, reject) {
			doc.unpublish();
			doc.save()
				.then(function() {
					return doc;
				})
				.then(resolve, reject);
		});
	}
});

