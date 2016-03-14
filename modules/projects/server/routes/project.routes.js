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
		var colArray = ['id','ProjectName','Proponent','Region','shortD','locSpatial','locDescription','provincialED','federalED','capitalInvestment','projectCreateDate','projectDescriptionLivingData','tombstoneNote','projectURL','captialInvestmentNote','lat','long','constructionJobs','constructionJobsNotes','operationJobs','operationJobsNotes','sector','subSector','currentPhaseTypeActivity','active','CEAAInvolvement','eaIssues','environmentalAssessmentNotes','CEAA','firstNationsConsultation','firstNationsAccess','firstNationsNotification','stakeholdersNotes','federalAgencies','workingGroups','allOtherStakeholderGroups','responsibleEPD','projectLead','EAOCAARTRepresentative','projectOfficer','projectAnalyst','projectAssistant','administrativeAssistant','CELead','teamNotes'];
		var parse = new CSVParse(data, {delimiter: ',', columns: colArray}, function(err, output){
			// Skip this many rows
			var length = Object.keys(output).length;
			var projectProcessed = 0;
			console.log("length",length);
			Object.keys(output).forEach(function(key, index) {
				if (index > 0) {
					var row = output[key];
					projectProcessed++;
					// console.log("rowData:",row.id);
					Model.findOne({epicProjectID: row.id}, function (err, doc) {
						var addOrChangeModel = function(model) {
							// console.log("MODEL:",model);
							// LATER
							model.epicProjectID = parseInt(row.id);
							// console.log("epicProjectID",model.epicProjectID);
							model.oldData = JSON.stringify(row);
							model.status = 'In Progress';
							model.name = row.ProjectName;
							model.description = row.shortD;
							model.code = model.name.toLowerCase ().replace (' ', '-').substr (0, model.name.length+1);
							model.phases = [];
							// _.each (phases, function (ph) {
							// 	var phase = new Phase (ph);
							// 	project.phases.push (phase._id);
							// 	phase.save ();
							// });
							model.type = row.sector;
							Organization.findOne ({name:row.Proponent}, function (err, result) {
								// var o = new Organization (org);
								// o.save ().then(function (o) {
								// 	model.proponent = o;
								// 	model.save();
								// });
								if (result) {
									model.proponent = result;
									model.save();
								}
							});
							// TODO: Remove this
							model.region = row.Region.toLowerCase ().replace(' region','');
							model.currentPhase = model.phases[0];
							if (row.lat) model.lat = parseFloat(row.lat);
							if (row.lat) model.lon = parseFloat(row.long);
							if (row.locDescription) model.location = row.locDescription;
							model.roles = ['mem', 'public'];
							model.description = "";
							model.description += 'Provincial Electoral Districts: '+row.provincialED+"\n";
							model.description += 'Capital Investment $M: '+row.capitalInvestment+"\n";
							model.description += 'Project File Creation Date: '+row.projectCreateDate+"\n";
							model.description += 'Construction Jobs: '+row.constructionJobs+"\n";
							model.description += 'Operation Jobs: '+row.operationJobs+"\n";
							model.description += 'Sub Sector: '+row.subSector+"\n";
							model.description += 'Active: '+row.active+"\n";
							model.description += 'CEAA Involvement (Fed EA Req. & Type): '+row.CEAAInvolvement+"\n";
							model.description += 'EA Issues: '+row.eaIssues+"\n";
							model.description += 'Environmental Assessment: '+row.environmentalAssessmentNotes+"\n";
							model.description += 'CEAA: '+row.CEAA+"\n";
							model.description += 'Description: '+row.projectDescriptionLivingData+"\n";
							model.description += 'firstNationsConsultation: '+row.firstNationsConsultation+"\n";
							model.description += 'firstNationsAccess: '+row.firstNationsAccess+"\n";
							model.description += 'firstNationsNotification: '+row.firstNationsNotification+"\n";
							model.description += 'stakeholdersNotes: '+row.stakeholdersNotes+"\n";
							model.description += 'federalAgencies: '+row.federalAgencies+"\n";
							model.description += 'workingGroups: '+row.workingGroups+"\n";
							model.description += 'allOtherStakeholderGroups: '+row.allOtherStakeholderGroups+"\n";
							model.description += 'responsibleEPD: '+row.responsibleEPD+"\n";
							model.description += 'projectLead: '+row.projectLead+"\n";
							model.description += 'EAOCAARTRepresentative: '+row.EAOCAARTRepresentative+"\n";
							model.description += 'projectOfficer: '+row.projectOfficer+"\n";
							model.description += 'projectAnalyst: '+row.projectAnalyst+"\n";
							model.description += 'projectAssistant: '+row.projectAssistant+"\n";
							model.description += 'administrativeAssistant: '+row.administrativeAssistant+"\n";
							model.description += 'CELead: '+row.CELead+"\n";
							model.description += 'teamNotes: '+row.teamNotes+"\n";
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

	app.route ('/api/projects/import')//.all (policy.isAllowed)
		.post (function (req, res) {
			var file = req.files.file;
			if (file) {
				// console.log("Received contact import file:",file);
				loadProjects(file, req, res);
			}
		});
};

