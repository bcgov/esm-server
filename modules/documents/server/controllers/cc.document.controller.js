'use strict';
// =========================================================================
//
// Controller for Documents
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/cc.dbmodel.controller'));
var _         = require ('lodash');

module.exports = DBModel.extend ({
	name : 'Document',
	plural : 'documents',
	// -------------------------------------------------------------------------
	//
	// because the historical conditions all are numbered, we used code for the
	// number. increment on post
	//
	// -------------------------------------------------------------------------
	preprocessAdd: function (document) {
		return document;
	},
	// -------------------------------------------------------------------------
	//
	// get documents for a project sort by name
	//
	// -------------------------------------------------------------------------
	getDocumentsForProject : function (projectid, reviewdocsonly) {
		return this.list ({
			project: projectid,
			documentIsLatestVersion: true,
			$or: [
				{existsdocumentIsInReview: reviewdocsonly || false},
				{existsdocumentIsInReview: {$exists: false }}
			]
		},
		null,
		{
			internalOriginalName : 1
		});
	},
	// -------------------------------------------------------------------------
	//
	// get document types for a project, returns an array of unique groups
	// of folder types, sub types and names
	//
	// -------------------------------------------------------------------------
	getDocumentTypesForProject : function (projectid, reviewdocsonly) {
		var memOrders = {
			'Permits & Applications'                              :1,
			'Inspection Reports'                                  :2,
			'Geotechnical Reports'                                :3,
			'Site Monitoring & Activities (including Reclamation)':4
		};
		return this.list ({
			project: projectid,
			documentIsLatestVersion: true,
			$or: [
				{existsdocumentIsInReview: reviewdocsonly || false},
				{existsdocumentIsInReview: {$exists: false }}
			]}, null, {
			projectFolderType    : 1,
			projectFolderSubType : -1,
			projectFolderName    : 1
		})
		.then (function (records) {
			//
			// build a hierarchical index of folderTypes / folderSubTypes / folderNames
			//
			// {
			// 	  <folderType>: {
			// 		 <folderSubType> : [<folderName>]
			// 	  }
			// }
			//
			// if the type or subtype are empty then do not record anything
			// if the name is empty, still record the type and subtype
			// for every record we can record up to 3 list elements. each distinct type
			// is only recorded once.
			//
			var types = {};
			var list = [];
			_.each (records, function (record) {
				//
				// get the data
				//
				var type    = record.projectFolderType;
				var subtype = record.projectFolderSubType;
				var name    = record.projectFolderName;
				var order   = memOrders[type] || 5;
				//
				// if the type or subtype are empty then take a pass
				//
				if (!_.isEmpty (type) && !_.isEmpty (subtype)) {
					//
					// create the type index if not there and take a pointer to the subtype object
					// this is also the first we have seen of the type so write out the level 1
					// (type) list record
					//
					if (!types[type]) {
						types[type] = { subTypes : {} };
						list.push ({
							order     : order,
							label     : type,
							depth     : 1,
							reference : 'projectFolderType',
							lineage   : {
								projectFolderType : type
							}
						});
					}
					var subtypes = types[type].subTypes;
					//
					// create the subtype index if not there and take a pointer to the names array
					// this is also then the first we have seen of the sub type, so put in the
					// level 2 (sub type) record
					//
					if (!subtypes[subtype]) {
						subtypes[subtype] = { names : {} };
						list.push ({
							order     : order,
							label     : subtype,
							depth     : 2,
							reference : 'projectFolderSubType',
							lineage   : {
								projectFolderSubType : subtype,
								projectFolderType    : type
							}
						});
					}
					var names = subtypes[subtype].names;
					//
					// if we have a name then do something quite similar
					//
					if (!_.isEmpty (name)) {
						//
						// create the name index, again, first time we've seen this so write the
						// level 3 (name) record
						//
						if (!names[name]) {
							names[name] = true;
							list.push ({
								order     : order,
								label     : subtype,
								depth     : 2,
								reference : 'projectFolderName',
								lineage   : {
									projectFolderName    : name,
									projectFolderSubType : subtype,
									projectFolderType    : type
								}
							});
						}
					}
				}
			}); // end of each records
			return list;
		});
	},
	// -------------------------------------------------------------------------
	//
	// return an array of all subtypes
	//
	// -------------------------------------------------------------------------
	getDocumentSubTypesForProject : function (projectid) {
		return this.distinct ('projectFolderSubType', { project: projectid });
	},
	// -------------------------------------------------------------------------
	//
	// return an array of all folder names
	//
	// -------------------------------------------------------------------------
	getDocumentFolderNamesForProject : function (projectid) {
		return this.distinct ('projectFolderName', { project: projectid });
	},
	// -------------------------------------------------------------------------
	//
	// Get all the versions of a document
	//
	// -------------------------------------------------------------------------
	getDocumentVersions : function (doc) {
		return this.list ({
			_id                  : { $ne: doc._id },
			projectFolderType    : doc.projectFolderType,
			projectFolderSubType : doc.projectFolderSubType,
			projectFolderName    : doc.projectFolderName,
			internalOriginalName : doc.internalOriginalName
		});
	},
});

