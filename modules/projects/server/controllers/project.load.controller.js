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
module.exports = function(file, req, res, opts) {
	return new Promise (function (resolve, reject) {
		var params = req.url.split("/");
		var doPhaseWork = function(project, phase) {
			var finalPhaseCode = phase.toLowerCase().replace (/\W+/g,'-');
			// console.log("final:", finalPhaseCode);
			var stopProcessing = false;
			// This is a really horrible way to do this, but it's good enough for now.
			return new Promise(function(rs, rj) {
				if (finalPhaseCode === "pre-application") {
					rs(project);
				} else if (finalPhaseCode === "under-construction") {
					return (new Project(opts)).startNextPhase(project)
					.then( function (pr) {
						pr.currentPhase     = pr.phases[1];
						pr.currentPhaseCode = pr.phases[1].code;
						pr.currentPhaseName = pr.phases[1].name;
						new Project(opts)
							.saveDocument(pr)
							.then(rs);
						});
				} else if (finalPhaseCode === "operating") {
					return (new Project(opts)).startNextPhase(project) // intake
					.then( function (pr) {
						pr.currentPhase     = pr.phases[1];
						return (new Project(opts)).startNextPhase(pr); // pre-ea
					})
					.then (function (project) {
						project.currentPhase     = project.phases[2];
						project.currentPhaseCode = project.phases[2].code;
						project.currentPhaseName = project.phases[2].name; // set to pre-app
						new Project(opts)
							.saveDocument(project)
							.then(rs);
					});
				} else if (finalPhaseCode === "care-and-maintenance") {
					return (new Project(opts)).startNextPhase(project) // intake
					.then( function (pr) {
						pr.currentPhase     = pr.phases[1];
						return (new Project(opts)).startNextPhase(pr); // pre-ea
					})
					.then( function (pr) {
						pr.currentPhase     = pr.phases[2];
						return (new Project(opts)).startNextPhase(pr); // pre-ea
					})
					.then (function (project) {
						project.currentPhase     = project.phases[3];
						project.currentPhaseCode = project.phases[3].code;
						project.currentPhaseName = project.phases[3].name;
						new Project(opts)
							.saveDocument(project)
							.then(rs);
						});
				} else if (finalPhaseCode === "closed") {
					return (new Project(opts)).startNextPhase(project) // intake
					.then( function (pr) {
						pr.currentPhase     = pr.phases[1];
						return (new Project(opts)).startNextPhase(pr); // pre-ea
					})
					.then( function (pr) {
						pr.currentPhase     = pr.phases[2];
						return (new Project(opts)).startNextPhase(pr); // pre-ea
					})
					.then( function (pr) {
						pr.currentPhase     = pr.phases[3];
						return (new Project(opts)).startNextPhase(pr); // pre-ea
					})
					.then (function (project) {
						project.currentPhase     = project.phases[4];
						project.currentPhaseCode = project.phases[4].code;
						project.currentPhaseName = project.phases[4].name;
						new Project(opts)
							.saveDocument(project)
							.then(rs);
						});
				} else {
					console.log("unhandled phase code. ", finalPhaseCode);
				}
			});
		};
		var doOrgWork = function(proponent, project) {
			return new Promise(function(rs, rj) {
				Organization.findOne ({name:proponent.name}, function (err, result) {
					if (result === null) {
						// Create it
						var o = new OrganizationController(opts);
						o.newDocument(proponent)
						.then ( o.create )
						.then (function (org) {
							// Assign the org to the project, and save it.  Resolve this request as
							// being done.
							project.proponent = org;
							project.status = "In Progress";
							project.save()
							.then(rs, rj);
						});
					} else {
						// Same as above, but the update version.
						project.proponent = result;
						project.status = "In Progress";
						project.save()
						.then(rs, rj);
					}
				});
			});
		};
		var doProjectWork = function(item, query) {
			return new Promise(function (rs, rj) {
				Model.findOne(query, function (err, doc) {
					var p = new Project(opts);
					if (doc === null) {
						p.newDocument(item)
						.then(function (newProj) {
							return p.create(newProj);
						})
						.then(function (proj) {
							return p.submit(proj);
						})
						.then( function (obj) {
							if(item.isPublished) {
								return p.publish(obj, true);
							} else {
								return obj;
							}
						})
						.then(rs, rj);
					} else {
						p.update(doc, item)
						.then(rs, rj);
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
			var colArray = ['id','ProjectName','Proponent','Ownership','type', 'lat','long','Commodity','Region','TailingsImpoundments','description', 'isPublished', 'isTermsAgreed', 'code', 'phase'];
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
						var phaseObj = null;
						var newObj = null;
						var newProponent = {
							name: row.Proponent
						};
						var query = { memPermitID: row.id };
						phaseObj 	= row.phase;
						newObj = {
							name 				: row.ProjectName,
							memPermitID			: row.id,
							ownership 			: row.Ownership,
							commodity 			: row.Commodity,
							tailingsImpoundments: row.TailingsImpoundments,
							roles 				: ['mem', 'public'],
							read 				: ['public'],
							submit 				: ['mem'],
							region 				: row.Region,
							lat 				: row.lat,
							lon 				: row.long,
							description			: row.description,
							isPublished			: row.isPublished,
							isTermsAgreed 		: row.isTermsAgreed,
							type				: row.type
						};
						promises.push({obj: newObj, query: query, proponent: newProponent, phase: phaseObj });
					}
				});

				Promise.resolve ()
				.then (function () {
					return promises.reduce (function (current, item) {
						return current.then (function () {
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

