'use strict';
// =========================================================================
//
// Routes for Projects
//
// =========================================================================
var policy     = require ('../policies/project.policy');
var Project    = require ('../controllers/project.controller');
var helpers    = require ('../../../core/server/controllers/core.helpers.controller');
var fs		   = require ('fs');
var CSVParse   = require('csv-parse');
var mongoose = require('mongoose');
var Model    = mongoose.model ('Project');
var _ = require ('lodash');
var Organization = mongoose.model ('Organization');

var loadProjects = function(file, req, res) {
	// Now parse and go through this thing.
	fs.readFile(file.path, 'utf8', function(err, data) {
		if (err) {
			return console.log(err);
		}
		// console.log("FILE DATA:",data);
		var colArray = ['id','ProjectName','Proponent','Region','description','locSpatial','locDescription','provincialED','federalED','investment','projectCreateDate','projectDescriptionLivingData','projectNotes','projectURL','investmentNotes','lat','long','constructionjobs','constructionjobsNotes','operatingjobs','operatingjobsNotes','projectType','sector','currentPhaseTypeActivity','eaActive','CEAAInvolvement','eaIssues','eaNotes','responsibleEPD','projectLead','EAOCAARTRepresentative','projectOfficer','projectAnalyst','projectAssistant','administrativeAssistant','CELead','teamNotes'];
		var parse = new CSVParse(data, {delimiter: ',', columns: colArray}, function(err, output){
			// Skip this many rows
			var length = Object.keys(output).length;
			var projectProcessed = 0;
			console.log("length",length);
			Object.keys(output).forEach(function(key, index) {
				if (index > 0) {
					var row = output[key];
					projectProcessed++;
					// Hack for incoming table data
					var id = 0;
					if (!isNaN(row.id)) {
						id = parseInt(row.id);
					}
					Model.findOne({epicProjectID: id}, function (err, doc) {
						var addOrChangeModel = function(model) {
							// console.log("MODEL:",model);
							// TODO:
							model.status = 'In Progress';
							model.name = row.ProjectName;
							model.code = model.name.toLowerCase ().replace (' ', '-').substr (0, model.name.length+1);
							model.epicProjectID = id;
							Organization.findOne ({name:row.Proponent}, function (err, result) {
								if (result) {
									// console.log("saving proponent details");
									model.proponent = result;
									model.save();
								} else {
									// Make an organization from the proponent string listed.
									var org = new Organization();
									// Make code from leading letters in string
									org.code = row.Proponent.toLowerCase().match(/\b(\w)/g).join('');
									org.name = row.Proponent;
									org.address1 = "";
									org.city = "";
									org.province = "";
									org.postal = "";
									org.save().then(function (org) {
										model.proponent = org;
										model.save();
										// console.log("saved",o);
										// console.log("model",model);
									});
								}
							});
							// TODO: Remove this
							model.region = row.Region.toLowerCase ().replace(' region','');
							model.description = row.description;
							if (row.locSpatial) model.locSpatial = row.locSpatial;
							if (row.locDescription) model.location = row.locDescription;
							if (row.provincialED) model.provElecDist = row.provincialED;
							if (row.federalED) model.fedElecDist = row.federalED;
							model.intake.investment            = row.investment;
							//projectCreateDate
							if (row.projectNotes) model.projectNotes = row.projectNotes;
							model.intake.investmentNotes       = row.investmentNotes;
							if (row.lat) model.lat = parseFloat(row.lat);
							// Force negative because of import data
							if (row.long) model.lon = -Math.abs(parseFloat(row.long));
							model.intake.constructionjobs      = row.constructionjobs;
							model.intake.constructionjobsNotes = row.constructionjobsNotes;
							model.intake.operatingjobs         = row.operatingjobs;
							model.intake.operatingjobsNotes    = row.operatingjobsNotes;
							model.type = row.projectType;
							model.sector = row.sector;
							model.phases = [];
							model.currentPhase = model.phases[0];
							// No phases yet from export document.
							// _.each (phases, function (ph) {
							// 	var phase = new Phase (ph);
							// 	project.phases.push (phase._id);
							// 	phase.save ();
							// });
							if (row.eaActive) model.eaActive = row.eaActive;
							if (row.CEAAInvolvement) model.CEAAInvolvement = row.CEAAInvolvement;
							if (row.eaIssues) model.eaIssues = row.eaIssues;
							if (row.eaNotes) model.eaNotes = row.eaNotes;

							// The rest comes in as old data for now
							model.responsibleEPD 			= row.responsibleEPD;
							model.projectLead 				= row.projectLead;
							model.EAOCAARTRepresentative 	= row.EAOCAARTRepresentative;
							model.projectOfficer 			= row.projectOfficer;
							model.projectAnalyst 			= row.projectAnalyst;
							model.projectAssistant 			= row.projectAssistant;
							model.administrativeAssistant 	= row.administrativeAssistant;
							model.CELead 					= row.CELead;
							model.teamNotes 				= row.teamNotes;

							model.roles = ['mem', 'public'];
							model.read = ['public'];
							model.submit = ['mem'];
							model.save().then(function () {
								// Am I done processing?
								// console.log("INDEX:",index);
								if (index === length-1) {
									console.log("processed: ",projectProcessed);
									res.json("{done: true, rowsProcessed: "+projectProcessed+"}");
								}
							});
						};
						if (doc === null) {
							// Create new
							var p = new Project (req.user);
							p.new().then(addOrChangeModel);
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
	helpers.setCRUDRoutes (app, 'project', Project, policy);
	//
	// set a project up from a stream
	//
	app.route ('/api/project/:project/set/stream/:stream')
		.all (policy.isAllowed)
		.put (function (req,res) {
			var p = new Project (req.user);
			// console.log ('setting stream for project');
			p.setStream (req.Project, req.Stream)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// add a phase to a project (from base phase)
	//
	app.route ('/api/project/:project/add/phase/:phasebase')
		.all (policy.isAllowed)
		.put (function (req,res) {
			var p = new Project (req.user);
			p.addPhase (req.Project, req.PhaseBase)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// set current phase
	//
	app.route ('/api/project/:project/set/phase/:phase')
		.all (policy.isAllowed)
		.put (function (req,res) {
			var p = new Project (req.user);
			p.setPhase (req.Project, req.Phase)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// get all projects in certain statuses
	//
	app.route ('/api/projects/with/status/:statustoken')
		.all (policy.isAllowed)
		.get (function (req,res) {
			var p = new Project (req.user);
			var opts = {
				initiated      : 'Initiated',
				submitted      : 'Submitted',
				inprogress     : 'In Progress',
				certified      : 'Certified',
				decommissioned : 'Decommissioned'
			};
			var stat = opts[req.params.statustoken] || 'none';
			p.list ({
				status : stat
			})
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// publish or unpublish a project
	//
	app.route ('/api/project/:project/publish')
		.all (policy.isAllowed)
		.put (function (req,res) {
			var p = new Project (req.user);
			p.publish (req.Project, true)
			.then (helpers.success(res), helpers.failure(res));
		});
	app.route ('/api/project/:project/unpublish')
		.all (policy.isAllowed)
		.put (function (req,res) {
			var p = new Project (req.user);
			p.publish (req.Project, false)
			.then (helpers.success(res), helpers.failure(res));
		});

	app.route ('/api/project/bycode/:projectcode').all (policy.isAllowed)
		.get (function (req, res) {
			var p = new Project (req.user);
			p.findOne ({code:req.params.projectcode}).then (helpers.success(res), helpers.failure(res));
		});


	app.route ('/api/projectile').all (policy.isAllowed).get (function (req, res) {
		var p = new Project (req.user);
		p.list ().then (helpers.success(res), helpers.failure(res));
	});

	app.route ('/api/projects/import').all (policy.isAllowed)
		.post (function (req, res) {
			var file = req.files.file;
			if (file) {
				// console.log("Received contact import file:",file);
				loadProjects(file, req, res);
			}
		});
};

