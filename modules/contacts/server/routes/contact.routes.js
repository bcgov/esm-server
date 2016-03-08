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
				console.log("Received contact import file:",file);
				// Now parse and go through this thing.
				fs.readFile(file.path, 'utf8', function(err, data) {
					if (err) {
						return console.log(err);
					}
					// console.log("FILE DATA:",data);
					var colArray = ['PERSON_ID','EAO_STAFF_FLAG','PROPONENT_FLAG','SALUTATION','FIRST_NAME','MIDDLE_NAME','LAST_NAME','TITLE','ORGANIZATION_NAME','DEPARTMENT','EMAIL_ADDRESS','PHONE_NUMBER','FAX_NUMBER','CELL_PHONE_NUMBER','ADDRESS_LINE_1','ADDRESS_LINE_2','CITY','PROVINCE_STATE','COUNTRY','POSTAL_CODE','NOTES'];
					var parse = new CSVParse(data, {delimiter: ',', columns: colArray}, function(err, output){
						// Skip the header
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

