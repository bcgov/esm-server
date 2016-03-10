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
	        var skip = 2;
	        var length = Object.keys(output).length;
	        console.log("length",length);
	        Object.keys(output).forEach(function(key) {
	            if (skip !== 0) {
	                skip--;
	                // console.log("skipping");
	            } else {
	                var row = output[key];
	                // console.log("rowData:",row);
	                var p = new Project (req.user);
	                p.new().then(function(model) {
	                    // console.log("MODEL:",model);
	                    // LATER
	                    model.epicProjectID = row.id;
	                    model.oldData = JSON.stringify(row);
	                    console.log("epicProjectID",model.epicProjectID);
	                    console.log("oldData",model.oldData);
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
			if (req.params.projectcode === 'new') {
				p.new().then (helpers.success(res), helpers.failure(res));
			} else {
				p.findOne ({code:req.params.projectcode}).then (helpers.success(res), helpers.failure(res));
			}
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
				console.log("job submitted");
				return new Promise (function (resolve, reject) {
					loadProjects(file, req, res).then(resolve, reject);
				});
			}
	});
};

