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
		// Now parse and go through this thing.
		fs.readFile(file.path, 'utf8', function(err, data) {
			if (err) {
				reject("err:"+err);
			}
			// console.log("FILE DATA:",data);
			var colArray = "";
			if (projectType === "eao") {
				colArray = ['id','Stream','ProjectName','Proponent','Region','description','locSpatial','locDescription','provincialED','federalED','investment','projectCreateDate','projectDescriptionLivingData','projectNotes','projectURL','investmentNotes','lat','long','constructionjobs','constructionjobsNotes','operatingjobs','operatingjobsNotes','projectType','sector','phase','currentPhaseTypeActivity','eaActive','CEAAInvolvement','eaIssues','eaNotes','responsibleEPD','phoneEPD','emailEPD','projectLead','projectLeadPhone','projectLeadEmail','projectAnalyst','projectAssistant','administrativeAssistant','CELead','CELeadPhone','CELeadEmail','teamNotes'];
			} else {
				colArray = ['id','ProjectName','Proponent','Ownership','lat','long','Status','Commodity','Region','TailingsImpoundments','description'];
			}
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.write('[ ');
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
								type 				: "Mining"
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
								eaActive: row.eaActive,
								CEAAInvolvement: row.CEAAInvolvement,
								eaIssues: row.eaIssues,
								eaNotes: row.eaNotes,
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
								teamNotes 				: row.teamNotes
							};
						}
						var checkCallback = function (idx, len) {
							res.write(idx+",");
							res.flush();
							if (idx === len-1) {
								// console.log("processed: ",projectProcessed);
								res.write("3]");
								res.end();
								// resolve("{done: true, rowsProcessed: "+projectProcessed+"}");
							}
						};
						var setProjectPhase = function(idx, len, proj, p) {
							var phaseC = new PhaseController(req.user);
							// console.log("phase:",proj);
							// Generate Code
							// console.log("generating code for:",row.phase);
							var phaseCode = row.phase.toLowerCase();
							phaseCode = phaseCode.replace (/\W/g,'-');
							// console.log("phase code gen:",phaseCode);
							phaseC.fromBase(phaseCode, proj).then(function(phase) {
								// console.log("phase:",phase.code);
								p.addPhase(proj, phase.code).then(function (projAdded) {
									// console.log("checkingcallback:",idx);
									res.write("0,");
									res.flush();
									checkCallback(idx, len);
								});
							});
						};
						var addOrUpdateOrg = function (idx, len, proj, p) {
							// console.log("adding/updating org");
							res.write("1,");
							res.flush();
							Organization.findOne ({name:newProponent.name}, function (err, result) {
								if (result === null) {
									// Create it
									var o = new OrganizationController(req.user);
									o.newDocument(newProponent)
									.then( function(obj) {
										// console.log("org obj:",obj);
										o.create(obj).then(function (org) {
											// Organization has been created
											// console.log("created org:",org);
											proj.proponent = org;
											proj.update(proj, newProponent).then(function(updatedDoc) {
												// console.log("updated: ", updatedDoc);
												setProjectPhase(index, length, proj, p);
											});
										});
									});
								} else {
									// Add it to the project
									proj.proponent = result;
									proj.update(proj, newProponent).then(function(updatedDoc) {
										// console.log("org updated: ", updatedDoc);
										setProjectPhase(index, length, proj, p);
									});
								}
							});
						};
						Model.findOne(query, function (err, doc) {
							var p = null;
							if (doc === null) {
								// Create new
								p = new Project(req.user);
								p.newDocument(newObj)
								.then( function(obj) {
									// console.log("obj:",obj);
									p.create(obj).then(function (proj) {
										// Project has been created, now to set things
										p.publish(proj, true);
										// Deal with phases and streams here:
										// p.setStream 					= row.Stream;
										// p.addPhase(project, base);
										addOrUpdateOrg(index, length, proj, p);
									});
								});
							} else {
								// Update:
								// console.log("updating");
								p = new Project(req.user);
								p.update(doc, newObj).then(function(updatedDoc) {
									// console.log("updated: ", updatedDoc);
									addOrUpdateOrg(index, length, updatedDoc, p);
								});
							}
						});
					}
				}); // ObjectForKey
			}); // CSV Parse
		}); // Read File
	});
};

