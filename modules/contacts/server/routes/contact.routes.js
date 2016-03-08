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


	app.route ('/api/contacts/import').all (policy.isAllowed)
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
						// console.log("ParsedData:",output);
						// for(var i = 2; i < output.length; i++) {
						// 	console.log("ROW:",output[i])
						// }
						// Skip the header
						console.log("PROJECT_ID:",output[1].GROUP_ID);
						console.log("Contact Name:",output[1].NAME);
						console.log("Contact Email:",output[1].EMAIL_ADDRESS);
					});
					helpers.success(res);
				});
			}
		});
};

