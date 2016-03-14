'use strict';
// =========================================================================
//
// Routes for contacts
//
// =========================================================================
var policy  = require ('../policies/contact.policy');
var Contact  = require ('../controllers/contact.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');
var fs		   = require ('fs');
var CSVParse   = require('csv-parse');
var mongoose = require('mongoose');
var Model    = mongoose.model ('Contact');
var GroupModel    = mongoose.model ('Group');
var Project    = mongoose.model ('Project');
var Group  = require ('../controllers/Group.controller');

var loadContacts = function(file, req, res) {
	// Now parse and go through this thing.
	fs.readFile(file.path, 'utf8', function(err, data) {
		if (err) {
			return console.log(err);
		}
		// console.log("FILE DATA:",data);
		var colArray = ['PERSON_ID','EAO_STAFF_FLAG','PROPONENT_FLAG','SALUTATION','FIRST_NAME','MIDDLE_NAME','LAST_NAME','TITLE','ORGANIZATION_NAME','DEPARTMENT','EMAIL_ADDRESS','PHONE_NUMBER','FAX_NUMBER','CELL_PHONE_NUMBER','ADDRESS_LINE_1','ADDRESS_LINE_2','CITY','PROVINCE_STATE','COUNTRY','POSTAL_CODE','NOTES'];
		var parse = new CSVParse(data, {delimiter: ',', columns: colArray}, function(err, output){
			// Skip this many rows
			var length = Object.keys(output).length;
			var rowsProcessed = 0;
			console.log("length",length);
			Object.keys(output).forEach(function(key, index) {
				if (index > 0) {
					var row = output[key];
					rowsProcessed++;
					Model.findOne({personId: row.PERSON_ID}, function (err, doc) {
						if (doc === null) {
							// console.log("rowData:",row);
							var c = new Contact (req.user);
							c.new().then(function(model) {
								// console.log("MODEL:",model);
								// LATER
								// model.project = row.TITLE;
								// model.contactName = row.TITLE;
								model.personId 		= row.PERSON_ID;
								model.orgName 		= row.ORGANIZATION_NAME;
								model.title 		= row.TITLE;
								model.firstName 	= row.FIRST_NAME;
								model.middleName 	= row.MIDDLE_NAME;
								model.lastName 		= row.LAST_NAME;
								model.phoneNumber 	= row.PHONE_NUMBER;
								model.email 		= row.EMAIL_ADDRESS;
								model.eaoStaffFlag 	= row.EAO_STAFF_FLAG;
								model.proponentFlag = row.PROPONENT_FLAG;
								model.salutation 	= row.SALUTATION;
								model.department 	= row.DEPARTMENT;
								model.faxNumber 	= row.FAX_NUMBER;
								model.cellPhoneNumber = row.CELL_PHONE_NUMBER;
								model.address1 		= row.ADDRESS_LINE_1;
								model.address2 		= row.ADDRESS_LINE_2;
								model.city 			= row.CITY;
								model.province 		= row.PROVINCE_STATE;
								model.country 		= row.COUNTRY;
								model.postalCode 	= row.POSTAL_CODE;
								model.notes 		= row.NOTES;
								model.save();
								// Am I done processing?
								// console.log("INDEX:",index);
								if (index === length-1) {
									console.log("processed: ",rowsProcessed);
									res.json("{done: true, rowsProcessed: "+rowsProcessed+"}");
								}
							});
						} else {
							// console.log("INDEX:",index);
							if (index === length-1) {
								console.log("processed: ",rowsProcessed);
								res.json("{done: true, rowsProcessed: "+rowsProcessed+"}");
							}
						}
					});
				}
			});
		});
	});
};
var loadGroupContacts = function(file, req, res) {
	// Now parse and go through this thing.
	fs.readFile(file.path, 'utf8', function(err, data) {
		if (err) {
			return console.log(err);
		}
		// console.log("FILE DATA:",data);
		var colArray = ['GROUP_ID','NAME','CONTACT_GROUP_TYPE','PERSON_ID','PROJECT_ID'];
		var parse = new CSVParse(data, {delimiter: ',', columns: colArray}, function(err, output){
			// Skip this many rows
			var length = Object.keys(output).length;
			var rowsProcessed = 0;
			console.log("length",length);
			Object.keys(output).forEach(function(key, index) {
				if (index > 0) {
					var row = output[key];
					rowsProcessed++;
					// console.log("rowData:",row);
					GroupModel.findOne({groupId: parseInt(row.GROUP_ID), personId: parseInt(row.PERSON_ID)}, function (err, doc) {
						if (doc === null) {
							// console.log("Nothing Found");
							var c = new Group (req.user);
							c.new().then(function(model) {
								// console.log("MODEL:",model);
								// LATER
								// model.project = row.PROJECT_ID;
								model.groupId 		= parseInt(row.GROUP_ID);
								model.groupName 	= row.NAME;
								model.groupType 	= row.CONTACT_GROUP_TYPE;
								model.personId 		= parseInt(row.PERSON_ID);
								model.epicProjectID  = parseInt(row.PROJECT_ID); // Save epic data just in case
								model.save();
								// Attempt to link up the project if it's loaded.
								Project.findOne({epicProjectID: parseInt(row.PROJECT_ID)}).then(function(p) {
									if (p) {
										model.project = p;
										model.save();
									}
								});
								// Am I done processing?
								// console.log("INDEX:",index);
								if (index === length-1) {
									console.log("rowsProcessed: ",rowsProcessed);
									res.json("{done: true, rowsProcessed: "+rowsProcessed+"}");
								}
							});
						} else {
							console.log("INDEX:",index);
							if (index === length-1) {
								console.log("rowsProcessed: ",rowsProcessed);
								res.json("{done: true, rowsProcessed: "+rowsProcessed+"}");
							}
						}
					});
				}
			});
		});
	});
};
module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'contact', Contact, policy);
	app.route ('/api/contact/for/project/:projectid').all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Contact (req.user);
			p.getForProject (req.params.projectid)
			.then (helpers.success(res), helpers.failure(res));
		});

	app.route ('/api/contacts/import')//.all (policy.isAllowed)
		.post (function (req, res) {
			var file = req.files.file;
			if (file) {
				// console.log("Received contact import file:",file);
				loadContacts(file, req, res);
			}
		});

	app.route ('/api/groupcontacts/import')//.all (policy.isAllowed)
		.post (function (req, res) {
			var file = req.files.file;
			if (file) {
				// console.log("Received contact import file:",file);
				loadGroupContacts(file, req, res);
			}
		});
};

