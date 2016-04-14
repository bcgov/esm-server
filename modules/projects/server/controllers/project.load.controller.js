'use strict';

var fs                  = require ('fs');
var mongoose            = require ('mongoose');
var Project             = require ('../controllers/project.controller');
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
				colArray = ['id','Stream','ProjectName','Proponent','Region','description','locSpatial','locDescription','provincialED','federalED','investment','projectCreateDate','projectDescriptionLivingData','projectNotes','projectURL','investmentNotes','lat','long','constructionjobs','constructionjobsNotes','operatingjobs','operatingjobsNotes','projectType','sector','currentPhaseTypeActivity','eaActive','CEAAInvolvement','eaIssues','eaNotes','responsibleEPD','phoneEPD','emailEPD','projectLead','projectLeadPhone','projectLeadEmail','projectAnalyst','projectAssistant','administrativeAssistant','CELead','CELeadPhone','CELeadEmail','teamNotes'];
			} else {
				colArray = ['id','ProjectName','Proponent','Ownership','lat','long','Status','Commodity','Region','TailingsImpoundments','description'];
			}
			var parse = new CSVParse(data, {delimiter: ',', columns: colArray}, function(err, output){
				// Skip this many rows
				var length = Object.keys(output).length;
				var projectProcessed = 0;
				// console.log("length",length);
				Object.keys(output).forEach(function(key, index) {
					if (index > 0) {
						var row = output[key];
						projectProcessed++;
						// Hack for incoming table data
						var id = 0;
						if (!isNaN(row.id)) {
							id = parseInt(row.id);
						}
						var query = {epicProjectID: id};
						if (projectType === "mem") {
							query = {memPermitID: row.id};
						} else {
							query = {epicProjectID: parseInt(row.id)};
						}
						Model.findOne(query, function (err, doc) {
							var addOrChangeModel = function(model) {
								// Always do this
								model.name			= row.ProjectName;
								model.code 			= model.name.toLowerCase ().replace(/\//g,'-').replace (' ', '-').substr (0, model.name.length+1);
								var addOrChangeProp = function(prop) {
									// Sometimes mem Props are NULL
									// console.log(row.Proponent);
									if (row.Proponent === "") {
										row.Proponent = "N/A";
										prop.code = model.code;
									} else {
										prop.code = row.Proponent.toLowerCase().replace(/\//g,'-').match(/\b(\w)/g).join('');
									}
									prop.name 		= row.Proponent;
									prop.company	= row.Proponent;
									prop.address1 	= "";
									prop.city 		= "";
									prop.province 	= "";
									prop.postal 	= "";
									prop.save().then(function (org) {
										model.proponent = org;
										model.save();
											// console.log("saved",org);
											// console.log("model",model);
										});
								};
								Organization.findOne ({name:row.Proponent}, function (err, result) {
									if (result) {
										addOrChangeProp(result);
									} else {
										addOrChangeProp(new Organization());
									}
								});
								model.region 	  = row.Region.toLowerCase ().replace(' region','');
								// console.log("region:",model.region);
								model.description = row.description;

								if (row.lat) model.lat = parseFloat(row.lat);
								// Force negative because of import data
								if (row.long) model.lon = -Math.abs(parseFloat(row.long));

								// eao/mem specific
								if (projectType === "mem") {
									model.status = 'In Progress';
									// model.status = row.status;
									model.memPermitID = row.id; // We'll take what it is
									model.ownership = row.Ownership;
									model.commodity = row.Commodity;
									model.tailingsImpoundments = row.TailingsImpoundments;
									model.roles = ['mem', 'public'];
									model.read = ['public'];
									model.submit = ['mem'];
									model.type = "Mining";
									Phase.findOne ({name:row.Status}, function (err, result) {
										if (result) {
											model.phases = result._id;
											model.currentPhase = model.phases[0];
										}
									}).then(function (m) {
										model.save().then(function () {
											// Am I done processing?
											// console.log("INDEX:",index);
											if (index === length-1) {
												// console.log("processed: ",projectProcessed);
												resolve("{done: true, rowsProcessed: "+projectProcessed+"}");
											}
										});
									});
								} else { // eao
									// TODO: FIX
									model.status = 'In Progress';
									var pstatus = model.status;
									model.epicProjectID = id;

									if (row.locSpatial) model.locSpatial 	 = row.locSpatial;
									if (row.locDescription) model.location 	 = row.locDescription;
									if (row.provincialED) model.provElecDist = row.provincialED;
									if (row.federalED) model.fedElecDist 	 = row.federalED;

									//projectCreateDate
									if (row.projectNotes) model.projectNotes = row.projectNotes;

									model.intake.constructionjobs 		= row.constructionjobs;
									model.intake.constructionjobsNotes 	= row.constructionjobsNotes;
									model.intake.operatingjobs 			= row.operatingjobs;
									model.intake.operatingjobsNotes 	= row.operatingjobsNotes;
									model.intake.investment 			= row.investment;
									model.intake.investmentNotes 		= row.investmentNotes;

									model.type = row.projectType;
									model.sector = row.sector;
									if (row.eaActive) model.eaActive = row.eaActive;
									if (row.CEAAInvolvement) model.CEAAInvolvement = row.CEAAInvolvement;
									if (row.eaIssues) model.eaIssues = row.eaIssues;
									if (row.eaNotes) model.eaNotes = row.eaNotes;

									// The rest comes in as old data for now
									// model.stream 					= row.Stream;
									model.responsibleEPD 			= row.responsibleEPD;
									model.responsibleEPDPhone		= row.phoneEPD;
									model.responsibleEPDEmail 		= row.emailEPD;
									model.projectLead 				= row.projectLead;
									model.projectLeadPhone			= row.projectLeadPhone;
									model.projectLeadEmail 			= row.projectLeadEmail;
									model.projectAnalyst 			= row.projectAnalyst;
									model.projectAssistant 			= row.projectAssistant;
									model.administrativeAssistant 	= row.administrativeAssistant;
									model.CELead 					= row.CELead;
									model.CELeadPhone				= row.CELeadPhone;
									model.CELeadEmail				= row.CELeadEmail;
									model.teamNotes 				= row.teamNotes;
									model.phases = [];
									model.roles = ['eao', 'public'];
									model.read = ['public'];
									model.submit = ['eao'];
									model.publish();
									var pname = ((row.currentPhaseTypeActivity === "") ? "not set":row.currentPhaseTypeActivity);
									var pdesc = ((row.currentPhaseTypeActivity === "") ? "not set":row.currentPhaseTypeActivity);
									var pcode = pname.toLowerCase ().replace(/\//g,'-').replace (' ', '-').substr (0, model.name.length+1);
									Phase.findOne({name: pname}, function (err, p) {
										var saveProject = function (m) {
											m.currentPhase = m.phases[0];
											m.save().then(function () {
												// Am I done processing?
												// console.log("INDEX:",index);
												if (index === length-1) {
													// console.log("processed: ",projectProcessed);
													resolve("{done: true, rowsProcessed: "+projectProcessed+"}");
												}
											});
										};
										if (p === null) {
											p = new Phase ({read: ['public'], submit: ['eao'], status : pstatus, code : pcode, name : pname, description : pdesc});
											model.phases.push (p._id);
											// Save the new phase first, then save the project
											p.save().then(function() {
												saveProject(model);
											});
										} else {
											// Found the phase, just attach to it
											model.phases.push (p._id);
											saveProject(model);
										}
									});
								}
							};
							if (doc === null) {
								// Create new
								//var p = new Project (req.user);
								//p.new().then(addOrChangeModel);
								addOrChangeModel(new Model());
							} else {
								// Update:
								addOrChangeModel(doc);
							}
						});
					}
				}); // ObjectForKey
			}); // CSV Parse
		}); // Read File
	});
};

