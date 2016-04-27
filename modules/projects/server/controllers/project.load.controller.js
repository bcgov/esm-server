'use strict';

var fs                  = require ('fs');
var mongoose            = require ('mongoose');
var Project             = require ('../controllers/project.controller');
var OrganizationController = require ('../../../organizations/server/controllers/organization.controller');
var PhaseController 	= require ('../../../phases/server/controllers/phase.controller');
var Model               = mongoose.model ('Project');
var Phase               = mongoose.model ('Phase');
var Organization        = mongoose.model ('Organization');
var CSVParse            = require ('csv-parse');



// -------------------------------------------------------------------------
//
// This does a whole complicated mess of crap in loading up projects, should
// probably be in its own controller as it doesnt really follow the usual
// patterns, but it may also only be required for a short time, so its fine
// here for now.
//
// -------------------------------------------------------------------------
module.exports = function(file, req, res) {
	return new Promise (function (resolve, reject) {
		var params = req.url.split("/");
		var projectType = params[params.length-1]; // Last param is project type
		// console.log("projectType:",params[params.length-1]);
		var doPhaseWork = function(project, phase) {
			var finalPhaseCode = phase.toLowerCase().replace (/\W+/g,'-');
			var stopProcessing = false;
			// Add the phase to the project, and return this as it's going to be
			// the last task in the chain.  This assumed the phase code being
			// passed in is actually correct - ensure import data has the right name
			// in order to generate the phase-code correctly.
			return new Promise(function (rs,rj) {
				if (finalPhaseCode === "pre-submission") {
					stopProcessing = true;
					return project;
				} else {
					(new Project(req.user)).addPhase(project, "pre-ea")
					.then(function (p) {
						if (stopProcessing || finalPhaseCode === "pre-ea") {
							stopProcessing = true;
							return p;
						} else {
							return (new Project(req.user)).addPhase(project, "pre-app");
						}
					})
					.then(function (p) {
						if (stopProcessing || finalPhaseCode === "pre-app") {
							stopProcessing = true;
							return p;
						} else {
							return (new Project(req.user)).addPhase(project, "evaluation");
						}
					})
					.then(function (p) {
						if (stopProcessing || finalPhaseCode === "evaluation") {
							stopProcessing = true;
							return p;
						} else {
							return (new Project(req.user)).addPhase(project, "application-review");
						}
					})
					.then(function (p) {
						console.log("FUCK:",finalPhaseCode);
						if (stopProcessing || finalPhaseCode === "application-review") {
							stopProcessing = true;
							return p;
						} else {
							return (new Project(req.user)).addPhase(project, "decision");
						}
					})
					.then(function (p) {
						if (stopProcessing || finalPhaseCode === "decision") {
							stopProcessing = true;
							return p;
						} else {
							return (new Project(req.user)).addPhase(project, "post-certification");
						}
					})
					.then(function (p) {
						if (stopProcessing || finalPhaseCode === "post-certification") {
							return p;
						} else {
							return (new Project(req.user)).addPhase(project, "completed");
						}
					})
					.then(function (p) {
						rs(p);
					});
				}
			});
		};
		var doOrgWork = function(proponent, project) {
			return new Promise(function(rs, rj) {
				Organization.findOne ({name:proponent.name}, function (err, result) {
					if (result === null) {
						// Create it
						var o = new OrganizationController(req.user);
						o.newDocument(proponent)
						.then ( o.create )
						.then (function (org) {
							// Assign the org to the project, and save it.  Resolve this request as
							// being done.
							project.proponent = org;
							project.status = "In Progress";
							project.save().then(rs, rj);
						});
					} else {
						// Same as above, but the update version.
						project.proponent = result;
						project.status = "In Progress";
						project.save().then(rs, rj);
					}
				});
			});
		};
		var doProjectWork = function(item, query) {
			return new Promise(function (rs, rj) {
				Model.findOne(query, function (err, doc) {
					var p = new Project(req.user);
					if (doc === null) {
						p.newDocument(item)
						.then(p.create)
						.then(function (proj) {
							p.submit(proj).then(function (newP) {
								// Project has been created, now to set things and resolve the project back
								// to the caller.
								if(item.isPublished === "TRUE") {
									p.publish(newP, true).then(rs, rj);
								} else {
									rs(newP);
								}
							});
						});
					} else {
						p.update(doc, item).then(rs, rj);
					}
				});
			});
		};
		// Now parse and go through this thing.
		fs.readFile(file.path, 'utf8', function(err, data) {
			if (err) {
				//
				// cc: added the return here otherwise the rest of this will execute regardless of the resolve
				//
				return reject("err:"+err);
			}
			// console.log("FILE DATA:",data);
			var colArray = "";
			if (projectType === "eao") {
				colArray = ['id','Stream','ProjectName','Proponent','Region','description','locSpatial','locDescription','provincialED','federalED','investment','projectCreateDate','projectDescriptionLivingData','projectNotes','projectURL','investmentNotes','lat','long','constructionjobs','constructionjobsNotes','operatingjobs','operatingjobsNotes','projectType','sector','phase','currentPhaseTypeActivity','eaActive','CEAAInvolvement','eaIssues','eaNotes','responsibleEPD','phoneEPD','emailEPD','projectLead','projectLeadPhone','projectLeadEmail','projectAnalyst','projectAssistant','administrativeAssistant','CELead','CELeadPhone','CELeadEmail','teamNotes', 'isPublished'];
			} else {
				colArray = ['id','ProjectName','Proponent','Ownership','type', 'lat','long','Status','Commodity','Region','TailingsImpoundments','description'];
			}
			var parse = new CSVParse(data, {delimiter: ',', columns: colArray}, function(err, output){
				// Skip this many rows
				var length = Object.keys(output).length;
				var projectProcessed = 0;
				// console.log("length",length);
				var promises = [];
				Object.keys(output).forEach(function(key, index) {
					if (index > 0) {
						var row = output[key];
						var id = 0;
						if (!isNaN(row.id)) {
							id = parseInt(row.id);
						}
						var newObj = null;
						var newProponent = {
							name: row.Proponent
						};
						var query = {epicProjectID: id};
						if (projectType === "mem") {
							query = { memPermitID: row.id };
							newObj = {
								memPermitID			: row.id,
								ownership 			: row.Ownership,
								commodity 			: row.Commodity,
								tailingsImpoundments: row.TailingsImpoundments,
								roles 				: ['mem', 'public'],
								read 				: ['public'],
								submit 				: ['mem'],
								type 				: row.type
							};
						} else {
							query = { epicProjectID: parseInt(row.id) };
							newObj = {
								epicProjectID 	: id,
								name 			: row.ProjectName,
								shortName 		: row.ProjectName.toLowerCase ().replace(/\//g,'-').replace (' ', '-').substr (0, row.ProjectName.length+1),
								roles 			: ['eao', 'public'],
								read 			: ['public'],
								submit 			: ['eao'],
								description 	: row.description,
								region 			: row.Region.toLowerCase ().replace(' region',''),
								sector 			: row.sector,
								locSpatial 		: row.locSpatial,
								location 		: row.locDescription,
								lat 			: row.lat,
								lon 			: row.long,
								provElecDist 	: row.provincialED,
								fedElecDist 	: row.federalED,
								projectNotes 	: row.projectNotes,
								type 			: row.projectType,
								intake: {
									constructionjobs 		: row.constructionjobs,
									constructionjobsNotes 	: row.constructionjobsNotes,
									operatingjobs 			: row.operatingjobs,
									operatingjobsNotes 		: row.operatingjobsNotes,
									investment 				: row.investment,
									investmentNotes 		: row.investmentNotes
								},
								eaActive 				: row.eaActive,
								CEAAInvolvement 		: row.CEAAInvolvement,
								eaIssues 				: row.eaIssues,
								eaNotes 				: row.eaNotes,
								responsibleEPD 			: row.responsibleEPD,
								responsibleEPDPhone		: row.phoneEPD,
								responsibleEPDEmail 	: row.emailEPD,
								projectLead 			: row.projectLead,
								projectLeadPhone		: row.projectLeadPhone,
								projectLeadEmail 		: row.projectLeadEmail,
								projectAnalyst 			: row.projectAnalyst,
								projectAssistant 		: row.projectAssistant,
								administrativeAssistant : row.administrativeAssistant,
								CELead 					: row.CELead,
								CELeadPhone				: row.CELeadPhone,
								CELeadEmail				: row.CELeadEmail,
								teamNotes				: row.teamNotes,
								isPublished				: row.isPublished,
								epicStream 				: row.Stream
							};
						}
						promises.push({obj: newObj, query: query, proponent: newProponent, phase: row.phase});
					}
				});

				Promise.resolve ()
				.then (function () {
					return promises.reduce (function (current, item) {
						return current.then (function () {
							// console.log ('++ add phase ', code);
							return doProjectWork(item.obj, item.query)
							//
							// Sequential reduction of work moving from the tail of the original promise
							// array to the head, by returning a promise for the next 'then' clause each time
							// until the final doPhaseWork completes.  Only then will this promise reduction 
							// finally resolve for the .then of the original resolving Promise.resolve().
							//
							.then(function (project) {
								return doOrgWork(item.proponent, project);
							})
							.then(function (org) {
								return doPhaseWork(org, item.phase);
							});
						});
					}, Promise.resolve());
				})
				.then (resolve, reject);
			}); // CSV Parse
		}); // Read File
	});
};

