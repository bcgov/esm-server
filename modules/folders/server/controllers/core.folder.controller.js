'use strict';
// =========================================================================
//
// Controller for Folders
//
// =========================================================================
var path 		= require('path');
var DBModel 	= require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _ 			= require ('lodash');
var CSVParse 	= require ('csv-parse');
var Project 	= require (path.resolve('./modules/projects/server/controllers/project.controller'));
var mongoose 	= require ('mongoose');
var FolderModel = mongoose.model ('Folder');

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
	getFolderObject: function (projectid, folderid) {
		return this.findOne ({
			project: projectid,
			directoryID: folderid
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
	},


	sortFolders: function (projectId, parentId, idList) {
		var self = this;
		return this.list ({project: projectId, parentID: parentId},{order:1})
		.then(function (folders) {
			if (!idList || !Array.isArray(idList) || idList.length === 0) { throw new Error('Missing id list'); }
			if (folders.length === 0) { throw new Error('No subfolders in parent ' + parentId); }
			// shallow copy array
			var toSortList = folders.slice();
			var document, index = 0;
			idList.forEach(function (id) {
				var foundIndex = toSortList.findIndex(function (item) {
					return item._id.toString() === id;
				});
				if (foundIndex > -1) {
					document = toSortList[foundIndex];
					// update the document
					document.order = index++;
					document.save();
					// remove the found item from the temporary list
					toSortList.splice(foundIndex, 1);
				}
			});
			if (toSortList.length > 0) {
				/*
						Handle items not in the passed in list of ids.  E.g. Two users working on collection.
						One is sorting the other is adding or removing documents. Both start from the same list but the second
						user submits the new document list before the first user finishes sorting.  We make sure the newly added
						documents are at the bottom of the new list.
				 */
				toSortList.forEach(function (document) {
					document.order = index++;
					document.save();
				});
			}
		});
	},

});

