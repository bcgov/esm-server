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

var loadProjects = function(file, req, res) {
	// Now parse and go through this thing.
	fs.readFile(file.path, 'utf8', function(err, data) {
		if (err) {
			return console.log(err);
		}
		// console.log("FILE DATA:",data);
		var colArray = ['id','ProjectName','Proponent','Region','shortD','locSpatial','locDescription','provincialED','federalED','capitalInvestment','projectCreateDate','projectDescriptionLivingData','tombstoneNote','projectURL','captialInvestmentNote','lat','long','constructionJobs','constructionJobsNotes','operationJobs','operationJobsNotes','sector','subSector','currentPhaseTypeActivity','active','CEAAInvolvement','deleted','deleted','eaIssues','deleted','environmentalAssessmentNotes','CEAA','firstNationsConsultation','firstNationsAccess','firstNationsNotification','stakeholdersNotes','federalAgencies','workingGroups','allOtherStakeholderGroups','deleted','responsibleEPD','projectLead','EAOCAARTRepresentative','projectOfficer','projectAnalyst','projectAssistant','administrativeAssistant','CELead','teamNotes'];
		var parse = new CSVParse(data, {delimiter: ',', columns: colArray}, function(err, output){
			// Skip this many rows
			var length = Object.keys(output).length;
			var projectProcessed = 0;
			console.log("length",length);
			Object.keys(output).forEach(function(key, index) {
				if (index > 1) {
					var row = output[key];
					// console.log("rowData:",row);
					Model.findOne({epicProjectID: row.id}, function (err, doc) {
						if (doc === null) {
							var p = new Project (req.user);
							p.new().then(function(model) {
								// console.log("MODEL:",model);
								// LATER
								projectProcessed++;
								model.epicProjectID = row.id;
								console.log("epicProjectID",model.epicProjectID);
								model.oldData = JSON.stringify(row);
								model.status = 'In Progress';
								model.name = row.ProjectName;
								model.description = row.shortD;
								model.code = model.name.toLowerCase ().replace (' ', '-').substr (0, 10);
								model.phases = [];
								// _.each (phases, function (ph) {
								// 	var phase = new Phase (ph);
								// 	project.phases.push (phase._id);
								// 	phase.save ();
								// });
								model.type = 'Mine';
								model.region = row.Region;
								model.currentPhase = model.phases[0];
								model.lat = row.lat;
								model.lon = row.lon;
								model.roles = ['mem', 'public'];
								//
								// cram in all other infor into the description
								//
								//var od = p.description;
								// project.description = 'Permit Number: '+p.permit+"\n";
								// project.description += 'Project Name: '+p.name+"\n";
								// project.description += 'Proponent/Operator: '+p.prop+"\n";
								// project.description += 'Ownership: '+p.ownership+"\n";
								// project.description += 'Latitude [decimal degrees N]: '+p.lat+"\n";
								// project.description += 'Longitude [decimal degrees E]: '+p.lon+"\n";
								// project.description += 'Status: '+p.status+"\n";
								// project.description += 'Commodity/ies: '+p.comm+"\n";
								// project.description += 'MEM Region: '+p.memRegion+"\n";
								// project.description += 'Tailings Impoundments: '+p.tail+"\n";
								model.description += 'Description: '+row.projectDescriptionLivingData+"\n";
								model.read = ['public'];
								model.submit = ['mem'];
								// console.log("epicProjectID",model.epicProjectID);
								// console.log("oldData",model.oldData);
								// model.fillmein = row.Proponent;
								// model.fillmein = row.Region;
								// model.fillmein = row.shortD;
								// model.fillmein = row.locSpatial;
								// model.fillmein = row.locDescription;
								// model.fillmein = row.provincialED;
								// model.fillmein = row.federalED;
								// model.fillmein = row.capitalInvestment;
								// model.fillmein = row.projectCreateDate;
								// model.fillmein = row.projectDescriptionLivingData;
								// model.fillmein = row.tombstoneNote;
								// model.fillmein = row.projectURL;
								// model.fillmein = row.captialInvestmentNote;
								// model.fillmein = row.lat;
								// model.fillmein = row.long;
								// model.fillmein = row.constructionJobs;
								// model.fillmein = row.constructionJobsNotes;
								// model.fillmein = row.operationJobs;
								// model.fillmein = row.operationJobsNotes;
								// model.fillmein = row.sector;
								// model.fillmein = row.subSector;
								// model.fillmein = row.currentPhaseTypeActivity;
								// model.fillmein = row.active;
								// model.fillmein = row.CEAAInvolvement;
								// model.fillmein = row.eaIssues;
								// model.fillmein = row.environmentalAssessmentNotes;
								// model.fillmein = row.CEAA;
								// model.fillmein = row.firstNationsConsultation;
								// model.fillmein = row.firstNationsAccess;
								// model.fillmein = row.firstNationsNotification;
								// model.fillmein = row.stakeholdersNotes;
								// model.fillmein = row.federalAgencies;
								// model.fillmein = row.workingGroups;
								// model.fillmein = row.allOtherStakeholderGroups;
								// model.fillmein = row.responsibleEPD;
								// model.fillmein = row.projectLead;
								// model.fillmein = row.EAOCAARTRepresentative;
								// model.fillmein = row.projectOfficer;
								// model.fillmein = row.projectAnalyst;
								// model.fillmein = row.projectAssistant;
								// model.fillmein = row.administrativeAssistant;
								// model.fillmein = row.CELead;
								// model.fillmein = row.teamNotes;
								model.save();
								// Am I done processing?
								// console.log("INDEX:",index);
								if (index === length-1) {
									console.log("processed: ",projectProcessed);
									res.json("{done: true, rowsProcessed: "+projectProcessed+"}");
								}
							});
						} else {
							// console.log("INDEX:",index);
							if (index === length-1) {
								console.log("processed: ",projectProcessed);
								res.json("{done: true, rowsProcessed: "+projectProcessed+"}");
							}
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

	app.route ('/api/projects/import')//.all (policy.isAllowed)
		.post (function (req, res) {
			var file = req.files.file;
			if (file) {
				// console.log("Received contact import file:",file);
				loadProjects(file, req, res);
			}
		});
};

