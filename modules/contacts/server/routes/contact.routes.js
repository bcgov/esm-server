'use strict';
// =========================================================================
//
// Routes for contacts
//
// =========================================================================
var policy 		= require ('../policies/contact.policy');
var Contact 	= require ('../controllers/contact.controller');
var helpers 	= require ('../../../core/server/controllers/core.helpers.controller');
var fs 			= require ('fs');
var CSVParse 	= require ('csv-parse');
var mongoose 	= require ('mongoose');
var UserModel 	= mongoose.model ('User');
var GroupModel 	= mongoose.model ('Group');
var Project 	= mongoose.model ('Project');
var Group 		= require ('../controllers/group.controller');
var crypto 		= require('crypto');

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
						var addOrChangeModel = function(model) {
							// console.log("Nothing Found");
							model.groupId 		= parseInt(row.GROUP_ID);
							model.groupName 	= row.NAME;
							model.groupType 	= row.CONTACT_GROUP_TYPE;
							model.personId 		= parseInt(row.PERSON_ID);
							model.epicProjectID  = parseInt(row.PROJECT_ID); // Save epic data just in case
							model.save().then(function () {
								// Am I done processing?
								// console.log("INDEX:",index);
								if (index === length-1) {
									console.log("rowsProcessed: ",rowsProcessed);
									res.json("{done: true, rowsProcessed: "+rowsProcessed+"}");
								}
							});
							// Attempt to link up the project if it's loaded.
							Project.findOne({epicProjectID: parseInt(row.PROJECT_ID)}).then(function(p) {
								if (p) {
									model.project = p;
									model.save();
								}
							});
						};
						if (doc === null) {
							// Create new
							var g = new Group (req.user);
							g.new().then(addOrChangeModel);
						} else {
							// Update:
							addOrChangeModel(doc);
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

	app.route ('/api/groupcontacts/import').all (policy.isAllowed)
		.post (function (req, res) {
			var file = req.files.file;
			if (file) {
				// console.log("Received contact import file:",file);
				loadGroupContacts(file, req, res);
			}
		});
};

