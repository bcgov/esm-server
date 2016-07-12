'use strict';
// =========================================================================
//
// Controller for Documents
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/cc.dbmodel.controller'));
var _         = require ('lodash');
var CSVParse 	= require ('csv-parse');
var Project    = require (path.resolve('./modules/projects/server/controllers/project.controller'));

module.exports = DBModel.extend ({
	name : 'Document',
	plural : 'documents',
	// -------------------------------------------------------------------------
	//
	// this is what happens before hte new document is saved, any last minute
	// mods are performed here
	//
	// -------------------------------------------------------------------------
	preprocessAdd: function (doc) {
		//
		// check if there is an existing matching document
		//
		return this.findOne ({
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
			_id                  : { $ne: doc._id },
			projectFolderType    : doc.projectFolderType,
			projectFolderSubType : doc.projectFolderSubType,
			projectFolderName    : doc.projectFolderName,
			internalOriginalName : doc.internalOriginalName
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
	// Importing from CSV
	loadDocuments : function(file, req, res) {
		var self = this;
		return new Promise (function (resolve, reject) {
			// console.log("loading documents", file);
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
						var rowsProcessed = 0;
						// console.log("length",length);
						Object.keys(output).forEach(function(key, index) {
							if (index > 0) {
								var row = output[key];
								// console.log("row:",row);
								rowsProcessed++;
								self.model.findOne({documentEPICId: parseInt(row.DOCUMENT_ID)}, function (err, doc) {
									if (err) {
										// console.log("err",err);
									} else {
										// console.log("doc",doc);
									}
									var addOrChangeModel = function(model, skipURL) {
										// res.write(",");
										// res.write(JSON.stringify({documentEPICId:parseInt(row.DOCUMENT_ID)}));
										// res.flush();
										model.documentEPICProjectId 	= parseInt(row.PROJECT_ID);
										model.documentEPICId            = parseInt(row.DOCUMENT_ID);
										model.projectFolderType         = row.PST_DESCRIPTION;
										model.projectFolderSubType      = row.DTP_DESCRIPTION;
										model.projectFolderName 		= row.FOLDER;
										// This could be auto-generated based on what we know now.
										model.projectFolderURL          = row.FOLDER;
										model.projectFolderDatePosted   = Date(row.DATE_POSTED);
										// // Do this on 2nd pass
										// model.projectFolderAuthor       = row.WHO_CREATED;
										model.documentAuthor     = row.WHO_CREATED;
										model.documentFileName   = row.FILE_NAME;
										// Skip overwriting the URL on subsequent loads
										if (!skipURL) {
											model.documentFileURL 	 = URLPrefix + row.DOCUMENT_POINTER.replace(/\\/g,"/");
										}
										model.documentFileSize   = row.FILE_SIZE;
										model.documentFileFormat = row.FILE_TYPE;
										model.documentAuthor 	 = row.WHO_CREATED;
										model.oldData 			 = JSON.stringify({DATE_RECEIVED: row.DATE_RECEIVED,
																				  ARCS_ORCS_FILE_NUMBER: row.ARCS_ORCS_FILE_NUMBER,
																				  WHEN_CREATED: row.WHEN_CREATED,
																				  WHO_UPDATED: row.WHO_UPDATED,
																				  WHEN_UPDATED: row.WHEN_UPDATED});

										model.save().then(function (m) {
											// console.log("INDEX:",index);
											var p = new Project(self.opts);
											var q  = {epicProjectID: m.documentEPICProjectId};
											p.findOne(q)
											.then( function (project) {
												console.log("project:", project);
												if (project) {
													console.log("found:",project.epicProjectID);
													m.project = project;
													m.save().then(function () {
														console.log("saved");
														if (index === length-1) {
															resolve();
														}
													});
												}
											});
										});
									};
									if (doc === null) {
										// Create new
										var mongoose = require ('mongoose');
										var Model    = mongoose.model ('Document');
										addOrChangeModel(new Model (), false);
									} else {
										// Update:
										addOrChangeModel(doc, true);
									}
								});
							}
						});
					});
				});
			}
		});
	}
});

