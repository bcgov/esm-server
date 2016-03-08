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
	        var skip = 1;
	        var length = Object.keys(output).length;
	        console.log("length",length);
	        Object.keys(output).forEach(function(key) {
	            if (skip !== 0) {
	                skip--;
	                // console.log("skipping");
	            } else {
	                var row = output[key];
	                // console.log("rowData:",row);
	                var c = new Contact (req.user);
	                c.new().then(function(model) {
	                    // console.log("MODEL:",model);
	                    // LATER
	                    // model.project = row.TITLE;
	                    // model.groupId = row.TITLE;
	                    // model.contactName = row.TITLE;
	                    model.personId = row.PERSON_ID;
	                    model.orgName = row.ORGANIZATION_NAME;
	                    model.title = row.TITLE;
	                    model.firstName = row.FIRST_NAME;
	                    model.middleName = row.MIDDLE_NAME;
	                    model.lastName = row.LAST_NAME;
	                    model.phoneNumber = row.PHONE_NUMBER;
	                    model.email = row.EMAIL_ADDRESS;
	                    model.eaoStaffFlag = row.EAO_STAFF_FLAG;
	                    model.proponentFlag = row.PROPONENT_FLAG;
	                    model.salutation = row.SALUTATION;
	                    model.department = row.DEPARTMENT;
	                    model.faxNumber = row.FAX_NUMBER;
	                    model.cellPhoneNumber = row.CELL_PHONE_NUMBER;
	                    model.address1 = row.ADDRESS_LINE_1;
	                    model.address2 = row.ADDRESS_LINE_2;
	                    model.city = row.CITY;
	                    model.province = row.PROVINCE_STATE;
	                    model.country = row.COUNTRY;
	                    model.postalCode = row.POSTAL_CODE;
	                    model.notes = row.NOTES;
	                    model.save();
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
				console.log("job submitted");
				return new Promise (function (resolve, reject) {
					loadContacts(file, req, res).then(resolve, reject);
				});
			}
		});

	app.route ('/api/groupcontacts/import')//.all (policy.isAllowed)
		.post (function (req, res) {
			var file = req.files.file;
			if (file) {
				console.log("Received contact import file:",file);
				// Now parse and go through this thing.
				fs.readFile(file.path, 'utf8', function(err, data) {
					if (err) {
						return console.log(err);
					}
					// console.log("FILE DATA:",data);
					var colArray = ['GROUP_ID','NAME','ORGANIZATION_NAME','TITLE','FIRST_NAME','MIDDLE_NAME','LAST_NAME','PHONE_NUMBER','EMAIL_ADDRESS','PROJECT_ID'];
					var parse = new CSVParse(data, {delimiter: ',', columns: colArray}, function(err, output){
						var skip = 1;
						Object.keys(output).forEach(function(key) {
							if (skip !== 0) {
								skip--;
								console.log("skipping"); // Skip the first header
							} else {
								var row = output[key];
								console.log("rowData:",row);
								// TODO: 1. First try to find the existing group contact or person contact (create/check params incoming)

								// 2. Create new if not existing
								// Object.keys(obj).forEach(function(key) {
								//   var val = obj[key];
								//   console.log("key:"+key+" ",val);
								// });
							}
						});
					});
					helpers.success(res);
				});
			}
		});
};

