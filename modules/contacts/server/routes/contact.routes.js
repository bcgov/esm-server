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
			var contactsAdded = 0;
			console.log("length",length);
			Object.keys(output).forEach(function(key, index) {
				if (index > 0) {
					var row = output[key];
					Model.findOne({personId: row.PERSON_ID}, function (err, doc) {
						if (doc === null) {
							// console.log("rowData:",row);
							var c = new Contact (req.user);
							c.new().then(function(model) {
								// console.log("MODEL:",model);
								// LATER
								// model.project = row.TITLE;
								// model.groupId = row.TITLE;
								// model.contactName = row.TITLE;
								contactsAdded++;
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
									console.log("processed: ",contactsAdded);
									res.json("{done: true, rowsProcessed: "+contactsAdded+"}");
								}
							});
						} else {
							// console.log("INDEX:",index);
							if (index === length-1) {
								console.log("processed: ",contactsAdded);
								res.json("{done: true, rowsProcessed: "+contactsAdded+"}");
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
		var colArray = ['GROUP_ID','NAME','ORGANIZATION_NAME','TITLE','FIRST_NAME','MIDDLE_NAME','LAST_NAME','PHONE_NUMBER','EMAIL_ADDRESS','PROJECT_ID'];
		var parse = new CSVParse(data, {delimiter: ',', columns: colArray}, function(err, output){
			// Skip this many rows
			var length = Object.keys(output).length;
			var groupContactsAdded = 0;
			console.log("length",length);
			Object.keys(output).forEach(function(key, index) {
				if (index > 0) {
					var row = output[key];
					// console.log("rowData:",row);
					Model.findOne({groupId: row.GROUP_ID}, function (err, doc) {
						if (doc === null) {
							// console.log("Nothing Found");
							var c = new Contact (req.user);
							c.new().then(function(model) {
								// console.log("MODEL:",model);
								// LATER
								// model.project = row.PROJECT_ID;
								groupContactsAdded++;
								model.groupId 		= row.GROUP_ID;
								model.groupName 	= row.NAME;
								model.orgName 		= row.ORGANIZATION_NAME;
								model.title 		= row.TITLE;
								model.firstName 	= row.FIRST_NAME;
								model.middleName 	= row.MIDDLE_NAME;
								model.lastName 		= row.LAST_NAME;
								model.phoneNumber 	= row.PHONE_NUMBER;
								model.email 		= row.EMAIL_ADDRESS;
								model.save();
								// Am I done processing?
								// console.log("INDEX:",index);
								if (index === length-1) {
									console.log("groupContactsAdded: ",groupContactsAdded);
									res.json("{done: true, rowsProcessed: "+groupContactsAdded+"}");
								}
							});
						} else {
							// console.log("INDEX:",index);
							if (index === length-1) {
								console.log("groupContactsAdded: ",groupContactsAdded);
								res.json("{done: true, rowsProcessed: "+groupContactsAdded+"}");
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

