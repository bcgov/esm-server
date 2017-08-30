'use strict';
// =========================================================================
//
// Controller for Documents
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _         = require ('lodash');
var CSVParse 	= require ('csv-parse');
var Project    = require (path.resolve('./modules/projects/server/controllers/project.controller'));
var mongoose 	= require ('mongoose');
var DocumentModel 	= mongoose.model ('Document');

module.exports = DBModel.extend ({
	name     : 'Document',
	plural   : 'documents',
	populate : [{
		path   : 'addedBy',
		select : '_id displayName username email orgName'
	}, {
		path   : 'updatedBy',
		select : '_id displayName username email orgName'
	}, {
		path   : 'collections',
		select : '_id displayName type'
	}],
	// -------------------------------------------------------------------------
	//
	// this is what happens before hte new document is saved, any last minute
	// mods are performed here
	//
	// -------------------------------------------------------------------------
	preprocessAdd: function (doc) {
		// ****
		// This process is disabled if it's a comment document - there are no versions
		// ****
		if (doc.documentSource === 'COMMENT' || doc.documentSource === 'SIGNATURE' || doc.documentSource === 'DROPZONE') {
			// We force this ability to write to documents because they are public comments.
			this.setForce(true);
			// We add proponent roles for drop zone documents
			if (doc.documentSource === 'DROPZONE') {
				doc.read = _.uniq(_.concat(doc.read, ['proponent-lead','proponent-team']));
			}
			return doc;
		}
		//
		// check if there is an existing matching document
		//

		return this.findOne ({
			project 				: doc.project,
			documentIsLatestVersion: true,
			projectFolderType       : doc.projectFolderType,
			projectFolderSubType    : doc.projectFolderSubType,
			projectFolderName       : doc.projectFolderName,
			internalOriginalName    : doc.internalOriginalName
		})
		.then (function (m) {
			//
			// if there is then save this one as the new proper version
			// and set the older one to not latest
			//
			if (m) {
				doc.documentVersion = m.documentVersion + 1;
				doc.documentIsLatestVersion = true;
				m.documentIsLatestVersion = false;
				m.save ();
			}
			return doc;
		});
	},
	preprocessUpdate: function(doc) {
		// logic here if we set specific document types...
		switch(doc.documentType) {
			case 'Inspection Report':
				doc.certificate = null;
				doc.certificateAmendment = null;
				doc.permit = null;
				doc.permitAmendment = null;
				doc.mineManagerResponse  = null;
				doc.annualReport = null;
				doc.annualReclamationReport = null;
				doc.damSafetyInspection = null;
				break;
			case 'Certificate':
				doc.inspectionReport = null;
				doc.certificateAmendment = null;
				doc.permit = null;
				doc.permitAmendment = null;
				doc.mineManagerResponse  = null;
				doc.annualReport = null;
				doc.annualReclamationReport = null;
				doc.damSafetyInspection = null;
				break;
			case 'Certificate Amendment':
				doc.inspectionReport = null;
				doc.certificate = null;
				doc.permit = null;
				doc.permitAmendment = null;
				doc.mineManagerResponse  = null;
				doc.annualReport = null;
				doc.annualReclamationReport = null;
				doc.damSafetyInspection = null;
				break;
			default:
				doc.inspectionReport = null;
				doc.certificate = null;
				doc.certificateAmendment = null;
				doc.permit = null;
				doc.permitAmendment = null;
				doc.mineManagerResponse  = null;
				doc.annualReport = null;
				doc.annualReclamationReport = null;
				doc.damSafetyInspection = null;
				break;
		}
		return doc;
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
	sortDocumentsForProjectFolder : function( projectId, directoryId, idList) {
		var self = this;
		return this.list ({project: projectId, directoryID: directoryId},{order:1})
		.then(function (documents) {
			if (!idList || !Array.isArray(idList) || idList.length === 0) { throw new Error('Missing id list'); }
			if (documents.length === 0) { throw new Error('No documents in directory ' + directoryId); }
			// shallow copy array
			var toSortList = documents.slice();
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
								label     : name,
								depth     : 3,
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
				else if ('ARTIFACT' === type) {
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
	// an array of all folder types
	//
	// -------------------------------------------------------------------------
	getDocumentTypesForProjectMEM : function (projectid) {
		return this.distinct ('projectFolderType', { project: projectid });
	},
	// -------------------------------------------------------------------------
	//
	// Get all the versions of a document
	//
	// -------------------------------------------------------------------------
	getDocumentVersions : function (doc) {
		return this.list ({
			project 			 : doc.project,
			_id                  : { $ne: doc._id },
			projectFolderType    : doc.projectFolderType,
			projectFolderSubType : doc.projectFolderSubType,
			projectFolderName    : doc.projectFolderName,
			internalOriginalName : doc.internalOriginalName
		});
	},
	getEpicProjectFolderURL: function (data) {
		// console.log("looking for projectFolderURL:", data.url);
		return new Promise (function (resolve, reject) {
			DocumentModel.findOne ({projectFolderURL: data.url}, function (err, result) {
				if (result !== null) {
					// console.log("found the document:", result._id);
					resolve(result);
				} else {
					// console.log("Document not found");
					resolve(null);
				}
			});
		});
	},
	// -------------------------------------------------------------------------
	//
	// get all documents from a supplied list
	//
	// -------------------------------------------------------------------------
	getList : function (list) {
		return this.list ({_id : {$in : list }});
	},
	getListIgnoreAccess : function (list) {
		return this.listforaccess ('ignore the access level', {_id : {$in : list }});
	},
	// for documents associated with a comment
	// if the comment is published or unpublished, then we need the same permissions/access level
	// unless the document has been explicitly rejected,
	publishForComment: function(doc, publish, perms) {
		//console.log('document.publishForComment publish = ' + publish + ', perms = ' + JSON.stringify(perms, null, 4));
		//console.log('document.publishForComment doc = ' + JSON.stringify(doc, null, 4));
		var self = this;
		self.setModelPermissions(doc, perms)
			.then(function() {
				if (publish) {
					return self.publish(doc);
				} else {
					return self.unpublish(doc);
				}
			});
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
	makeLatest: function (doc) {
		if (!doc)
			return Promise.resolve();

		return new Promise(function (resolve, reject) {
			doc.documentIsLatestVersion = true;
			doc.save().then(resolve, reject);
		});
	},
	// Importing from CSV
	loadDocuments : function(file, req, res) {
		var self = this;
		return new Promise (function (resolve, reject) {
			console.log("loading documents", file);
			if (file) {
				// Now parse and go through this thing.
				var fs = require('fs');
				fs.readFile(file.path, 'utf8', function(err, data) {
					if (err) {
						reject("err:"+err);
					}
					// res.writeHead(200, {'Content-Type': 'text/plain'});
					// res.write('[ { "jobid": 0 }');
					var colArray = ['PROJECT_ID','DOCUMENT_ID','PST_DESCRIPTION','DTP_DESCRIPTION','SECTION_NUMBER','FOLDER','FILE_NAME','DOCUMENT_POINTER','FILE_TYPE','FILE_SIZE','DATE_POSTED','DATE_RECEIVED','ARCS_ORCS_FILE_NUMBER','WHO_CREATED','WHEN_CREATED','WHO_UPDATED','WHEN_UPDATED'];
					var parse = new CSVParse(data, {delimiter: ',', columns: colArray}, function(err, output){
						// Skip this many rows
						var URLPrefix = "https://a100.gov.bc.ca/appsdata/epic/documents/";
						var length = Object.keys(output).length;
						var promises = [];

						console.log("length",length);

						Object.keys(output).forEach(function(key, index) {
							if (index > 0) {
								var row = output[key];
								// console.log("row:",row);

								var newObj = {
									documentEPICProjectId 	: parseInt(row.PROJECT_ID),
									documentEPICId 			: parseInt(row.DOCUMENT_ID),
									projectFolderType 		: row.PST_DESCRIPTION,
									projectFolderSubType 	: row.DTP_DESCRIPTION,
									projectFolderName       : row.FOLDER,
									read: ["public"],
									// This could be auto-generated based on what we know now.
									projectFolderURL 		: row.FOLDER,
									projectFolderDatePosted : Date(row.DATE_POSTED),
									// // Do this on 2nd pass
									// model.projectFolderAuthor       : row.WHO_CREATED;
									documentFileName 		: row.FILE_NAME,
									documentFileURL 		: URLPrefix + row.DOCUMENT_POINTER.replace(/\\/g,"/"),
									documentFileSize 	: row.FILE_SIZE,
									documentFileFormat 	: row.FILE_TYPE,
									documentAuthor 		: row.WHO_CREATED,
									oldData 			: JSON.stringify({DATE_RECEIVED: row.DATE_RECEIVED,
																			  ARCS_ORCS_FILE_NUMBER: row.ARCS_ORCS_FILE_NUMBER,
																			  WHEN_CREATED: row.WHEN_CREATED,
																			  WHO_UPDATED: row.WHO_UPDATED,
																			  WHEN_UPDATED: row.WHEN_UPDATED}),
									displayName : row.FILE_NAME
								};
								// console.log("pushing:", newObj);
								promises.push(newObj);
							}
						});

						var doDocumentLoadWork = function(item) {
							return new Promise(function(rs, rj) {
								// console.log("item:", item);
								DocumentModel.findOne ({documentEPICId: item.documentEPICId}, function (err, result) {
									if (result === null) {
										// console.log("Creating document:", item.documentEPICId);
										// Create it
										var o = new DocumentModel(item);
										o.save()
										.then(function (obj) {
											// console.log("created:", obj);
											rs(obj);
										}, function (err) {
											console.log("err:", err);
											rj(err);
										});
									} else {
										// console.log("found the document - doing nothing:", result.documentEPICId);
										rs(result);
									}
								});
							});
						};

						var doProjectAssociationWork = function (document) {
							return new Promise(function (rs,rj) {
								var p = new Project(self.opts);
								var q  = {epicProjectID: document.documentEPICProjectId};
								p.findOne(q)
								.then( function (project) {
									// console.log("project:", project);
									if (project) {
										// console.log("found:",project.epicProjectID);
										document.project = project;
										return document.save();
									} else {
										return document;
									}
								})
								.then(rs, rj);
							});
						};

						Promise.resolve ()
						.then (function () {
							return promises.reduce (function (current, item) {
								return current.then (function () {
									return doDocumentLoadWork(item)
									.then(function (document) {
										return doProjectAssociationWork(document);
									});
								});
							}, Promise.resolve());
						})
						.then (resolve, reject);
					});
				});
			}
		});
	}
});

