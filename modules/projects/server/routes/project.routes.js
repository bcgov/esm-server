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


	app.route ('/api/projectile').all (policy.isAllowed).get (function (req, res) {
		var p = new Project (req.user);
		p.list ().then (helpers.success(res), helpers.failure(res));
	});

	app.route ('/api/projects/import')//.all (policy.isAllowed)
		.post (function (req, res) {
			var file = req.files.file;
			if (file) {
				console.log("Received import file:",file);
				// Now parse and go through this thing.
				fs.readFile(file.path, 'utf8', function(err, data) {
					if (err) {
						return console.log(err);
					}
					// console.log("FILE DATA:",data);
					//var colArray = ['Project ID','Project Name','Proponent','Region','PD Summary (Short Description)','!Location - Spatial','Location - Description','Provincial Electoral Districts','!Federal Electoral Districts','Capital Investment $M','!Project File Creation Date','!Project Description (Living Data)','!Note: Tombstone','!Project URL','Note: Capital Investment $M','Latitude (Depreciated)','Longitude (Depereciated)','Construction Jobs','Note: Construction Jobs','Operation Jobs','Note: Operation Jobs','Sector','Sub-Sector','Current Phase/Type/Activity','!Active','CEAA Involvement (Fed EA Req. & Type)','DELETED','DELETED','EA Issues','DELETED','!Note: Environmental Assessment','CEAA','First Nations - Consultation','First Nations - Access','First Nations - Notification','!Note: Stakeholders','Federal Agencies','!Working Group(s)','!All Other Stakeholder Group(s)','DELETED','Responsible EPD','Project Lead','EAO CAART Representative','Project Officer','Project Analyst','Project Assistant','Administrative Assistant','C&E Lead','!Note: Team'];
					var colArray = ['id','ProjectName','Proponent','Region','shortD','locSpatial','locDescription','provincialED','federalED','capitalInvestment','projectCreateDate','projectDescriptionLivingData','tombstoneNote','projectURL','captialInvestmentNote','lat','long','constructionJobs','constructionJobsNotes','operationJobs','operationJobsNotes','sector','subSector','currentPhaseTypeActivity','active','CEAAInvolvement','deleted','deleted','eaIssues','deleted','environmentalAssessmentNotes','CEAA','firstNationsConsultation','firstNationsAccess','firstNationsNotification','stakeholdersNotes','federalAgencies','workingGroups','allOtherStakeholderGroups','deleted','responsibleEPD','projectLead','EAOCAARTRepresentative','projectOfficer','projectAnalyst','projectAssistant','administrativeAssistant','CELead','teamNotes'];
					var parse = new CSVParse(data, {delimiter: ',', columns: colArray}, function(err, data){
						// loop each row in project
						var skip = 2;
						Object.keys(data).forEach(function(key) {
							if (skip-- !== 0) {
								return; // Skip the first 2 headers
							}
							var row = data[key];
							console.log("rowData:",row);
							// TODO: 1. First try to find the existing epicID

							// 2. Create new if not existing
							// Object.keys(obj).forEach(function(key) {
							//   var val = obj[key];
							//   console.log("key:"+key+" ",val);
							// });
						});
					});
					helpers.success(res);
				});
			}
	});
};

