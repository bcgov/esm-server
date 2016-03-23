'use strict';
// =========================================================================
//
// Controller for projects
//
// =========================================================================
var path               = require ('path');
var DBModel            = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var UserClass          = require (path.resolve('./modules/users/server/controllers/admin.server.controller'));
var PhaseClass         = require (path.resolve('./modules/phases/server/controllers/phase.controller'));
var OrganizationClass  = require (path.resolve('./modules/organizations/server/controllers/organization.controller'));
var PhaseBaseClass     = require (path.resolve('./modules/phases/server/controllers/phasebase.controller'));
var RecentActivityClass = require (path.resolve('./modules/recent-activity/server/controllers/recent-activity.controller'));
var RoleController     = require (path.resolve('./modules/roles/server/controllers/role.controller'));
var _                  = require ('lodash');
var fs		   		   = require ('fs');
var mongoose 		   = require ('mongoose');
var Project    		   = require ('../controllers/project.controller');
var Model    		   = mongoose.model ('Project');
var Organization 	   = mongoose.model ('Organization');
var CSVParse  		   = require ('csv-parse');

module.exports = DBModel.extend ({
	name : 'Project',
	plural : 'projects',
	sort: {name:1},
	populate: 'currentPhase',
	bind: ['addPrimaryUser','addProponent'],
	// -------------------------------------------------------------------------
	//
	// Before adding a project this is what must happen:
	//
	// set up the eao and proponent admin and member roles
	// add them to the project
	// reverse add the project to the roles
	// add the project admin role to the current user, eao if internal, proponent
	//    otherwise
	// reset the user roles in this object so the user can save it
	//
	// -------------------------------------------------------------------------
	preprocessAdd : function (project) {
		var self = this;
		var rolePrefix;
		var adminSuffix = ':admin';
		var projectAdminRole;
		var projectProponentAdmin;
		var projectProponentMember;
		var sectorRole;
		//
		// return a promise, we have lots of work to do
		//
		return new Promise (function (resolve, reject) {
			//
			// first generate a project code that can be used internally
			//
			project.code = project.shortName.toLowerCase ();
			project.code = project.code.replace (/\W/g,'-');
			project.code = project.code.replace (/-+/,'-');
			//
			// this does the work of that and returns a promise
			//
			self.guaranteeUniqueCode (project.code)
			//
			// then go about setting up the default admin roles on both
			// sides of the fence
			//
			.then (function (projectCode) {
				console.log ('Step1. assign project code: ', projectCode);
				project.code           = projectCode;
				rolePrefix             = projectCode + ':';
				adminSuffix            = ':admin';
				projectAdminRole       = rolePrefix + 'eao' + adminSuffix;
				projectProponentAdmin  = rolePrefix + 'pro' + adminSuffix;
				projectProponentMember = rolePrefix + 'pro' + ':member';
				//
				// set the project admin role
				//
				project.adminRole = projectAdminRole;
				project.proponentAdminRole = projectProponentAdmin;
				//
				// if the project hasn't an orgCode yet then copy in the user's
				//
				if (!project.orgCode) project.orgCode = self.user.orgCode;
				//
				// add the project to the roles and the roles to the project
				// we absolutely set them at this point.
				//
				//
				console.log ('Step2. assign default roles.');
				return RoleController.setObjectRoles (self, project, {
					read   : [projectProponentMember],
					submit : [projectProponentAdmin, projectAdminRole]
				});
			})
			//
			// add the appropriate role to the user
			//
			.then (function () {
				console.log ('Step3. assign admin role to user.');
				console.log ('project is now ', project);
				var userRole = (self.user.orgCode !== 'eao' && self.user.orgCode === project.orgCode) ? projectProponentAdmin : projectAdminRole;
				return RoleController.addUserRole (self.user, userRole);
			})
			//
			// update this model's user roles
			// do this because the user now has new access, without this they
			// cannot save the project
			//
			.then (function () {
				console.log ('Step4. set query access roles in the dbmodel object');
				self.setRoles (self.user);
				project.roles = project.allRoles ();
				return project;
			})
			//
			// add a pre submission phase
			//
			.then (function () {
				console.log ('Step5. add the first basic phase, pre-stream, pre-submission');
				return self.addPhaseFromCode (project, 'presubmission')
				.then (function (m) {
					m.currentPhase = m.phases[0];
					return m;
				});
			})
			// .then (self.addPrimaryUser)
			// .then (self.addProponent)
			.then (resolve, reject);
		});
	},
	// preprocessUpdate: function (project) {
	// 	// var self = this;
	// 	// return self.addPrimaryUser (project)
	// 	// .then (self.addProponent);
	// },
	addPrimaryUser: function (project) {
		var self = this;
		return new Promise (function (resolve, reject) {
			var p = null;
			if (project.primaryContact && !_.isEmpty (project.primaryContact)) {
				var User = new UserClass (self.user);
				if (project.primaryContact._id) {
					p = User.findAndUpdate (project.primaryContact);
				} else {
					p = User.newFromObject (project.primaryContact);
				}
			}
			p.then (function (rec) {
				project.primaryContact = rec._id;
				resolve (project);
			})
			.catch (reject);
		});
	},
	addProponent: function (project) {
		var self = this;
		return new Promise (function (resolve, reject) {
			var p = null;
			if (project.proponent && !_.isEmpty (project.proponent)) {
				var User = new OrganizationClass (self.user);
				if (project.proponent._id) {
					p = User.findAndUpdate (project.proponent);
				} else {
					p = User.newFromObject (project.proponent);
				}
			}
			p.then (function (rec) {
				project.proponent = rec._id;
				resolve (project);
			})
			.catch (reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// set a project to submitted
	//
	// -------------------------------------------------------------------------
	submit: function (project) {
		var self = this;
		return new Promise (function (resolve, reject) {
			//
			// set the status to submitted
			//
			project.status = 'Submitted';
			//
			// select the right sector lead role
			//
			if (project.type === 'lng') {
				project.sectorRole = 'sector-lead-lng';
			} else {
				project.sectorRole = 'sector-lead-mining';
			}
			//
			// add the project to the roles and the roles to the project
			// this is where the project first becomes visible to EAO
			// through the project admin role and the sector lead role
			// (we dont wait on the promise here, just trust it)
			//
			RoleController.mergeObjectRoles (project, {
				submit : [project.adminRole, project.sectorRole]
			});
			(new RecentActivityClass (self.user)).create ({
				headline: 'Submitted for Approval: '+project.name,
				content: project.name+' has been submitted for approval to the Environmental Assessment process.\n'+project.description,
				project: project._id,
				type: 'News'
			});
			//
			// save changes
			//
			self.saveAndReturn (project)
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// setting a stream requires the following:
	// get all the phase base objects and create proper phases from them
	// add those to the project and link backwards as well
	// here's the big list of stuff to do:
	//
	// add the project admin role to the current user so they can perform this action
	// give the user permission to save by resetting the access in this object
	// get all the base phases in the stream
	// make real phases from all the bases, passing in the current project roles
	// attach all new phases to the project
	// update the roles list in the project from the stream
	// reverse add the project to all the roles
	// save the project
	//
	// -------------------------------------------------------------------------
	setStream : function (project, stream) {
		var self      = this;
		var phase     = new PhaseClass (self.user);
		var phasebase = new PhaseBaseClass (self.user);
		return new Promise (function (resolve, reject) {
			console.log ("adding user roles");
			//
			// we MUST add the admin role to the current user or they cannot
			// perform the upcoming save
			//
			var projectAdminRole = project.code + ':eao:admin';
			var projectMemberRole = project.code + ':eao:member';
			console.log ('about to add user role '+projectAdminRole + ' to user ',self.user);
			return RoleController.addUserRole (self.user, projectAdminRole)
			.then (function () {
				//
				// reset the user in this object with its new permissions
				//
				self.setRoles (self.user);
				// get all the phase bases
				return Promise.all (stream.phases.map (phasebase.findById));
			})
			// then make real phases from them all
			.then (function (models) {
				console.log ('found phase bases, length = ',models.length);
				return Promise.all (models.map (function (m) {
					return phase.makePhaseFromBase (m, stream._id, project._id, project.code, project.roleSet());
				}));
			})
			// then attach the new phases to the project
			.then (function (models) {
				console.log ('new phases, length = ',models.length);
				_.each (models, function (m) {
					project.phases.push (m._id);
				});
				return project;
			})
			// then do some work on the project itself and save it
			.then (function (p) {
				console.log ("setting up status and roles");
				//
				// set the status to in progress
				//
				p.status = 'In Progress';
				//
				// add some new roles to the roles list including the stream roles
				//
				console.log ('roles are now:', p.roles);
				p.roles.push (
					projectAdminRole,
					projectMemberRole
				);
				p.roles = _.union (p.roles, stream.roles);
				//
				// now add the stream roles both ways and also make the
				// project public
				//
				RoleController.addRolesToConfigObject (p, 'projects', project.roleSet());
				return project;
			})
			// .then (function () {
			// 	console.log ("adding user roles");
			// 	//
			// 	// we MUST add the admin role to the current user or they cannot
			// 	// perform the upcoming save
			// 	//
			// 	console.log ('about to add user role '+project.code + ':eao:admin to user ',self.user);
			// 	return RoleController.addUserRole (self.user, project.code + ':eao:admin');
			// })
			.then (function (p) {
				console.log ("save me!");
				(new RecentActivityClass (self.user)).create ({
					headline: 'Accepted: '+project.name,
					content: project.name+' has been accepted for an Environmental Assessment\n'+project.description,
					project: project._id,
					type: 'News'
				});
				return self.saveAndReturn (p);
			})
			// then leave
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// add a phase to the project from a phase base
	// add the phase with whatever new permissions
	//
	// -------------------------------------------------------------------------
	addPhase : function (project, phasebase, roles) {
		var self = this;
		return new Promise (function (resolve, reject) {
			var phase = new PhaseClass (self.user);
			phase.makePhaseFromBase (phasebase, project.stream, project._id, project.code, roles)
			.then (function (model) {
				project.phases.push (model._id);
				return  project;
			})
			.then (function (m) {
				return self.saveAndReturn (m);
			})
			.then (resolve, reject);
		});
	},
	addPhaseFromCode : function (project, phasecode, roles) {
		var self = this;
		return new Promise (function (resolve, reject) {
			var PhaseBase = new PhaseBaseClass (self.user);
			PhaseBase.findOne ({
				code: phasecode
			})
			.then (function (base) {
				return self.addPhase (project, base, roles);
			})
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// set current phase
	//
	// -------------------------------------------------------------------------
	setPhase : function (project, phase) {
		var self = this;
		return new Promise (function (resolve, reject) {
			project.currentPhase = phase;
			console.log('setcurrentphase', project, phase);
			self.saveAndReturn(project)
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// publish, unpublish
	//
	// -------------------------------------------------------------------------
	publish: function (project, value) {
		var self = this;
		if (value) project.addRoles ( { read: 'public' });
		else project.removeRoles ( { read: 'public' });
		return new Promise (function (resolve, reject) {
			self.saveAndReturn (project)
			.then (resolve, reject);
		});
	},

	// -------------------------------------------------------------------------
	//
	// get a new project, pre-saved with a temporary code
	//
	// -------------------------------------------------------------------------
	getNewWithCode: function (code) {
		var self = this;
		console.log ('code = ', code);
		return new Promise (function (resolve, reject) {
			self.newDocument ({code:code, name:code})
			.then (self.create)
			.then (resolve, reject);
		});
	},

	loadProjects: function(file, req, res) {
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
					colArray = ['id','ProjectName','Proponent','Region','description','locSpatial','locDescription','provincialED','federalED','investment','projectCreateDate','projectDescriptionLivingData','projectNotes','projectURL','investmentNotes','lat','long','constructionjobs','constructionjobsNotes','operatingjobs','operatingjobsNotes','projectType','sector','currentPhaseTypeActivity','eaActive','CEAAInvolvement','eaIssues','eaNotes','responsibleEPD','projectLead','EAOCAARTRepresentative','projectOfficer','projectAnalyst','projectAssistant','administrativeAssistant','CELead','teamNotes'];
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
							}
							Model.findOne(query, function (err, doc) {
								var addOrChangeModel = function(model) {
									// console.log("MODEL:",model);

									// Always do this
									model.name	= row.ProjectName;
									model.code 			= model.name.toLowerCase ().replace (' ', '-').substr (0, model.name.length+1);
									var addOrChangeProp = function(prop) {
										// Sometimes mem Props are NULL
										console.log(row.Proponent);
										if (row.Proponent === "") {
											row.Proponent = "N/A";
											prop.code = model.code;
										} else {
											prop.code = row.Proponent.toLowerCase().match(/\b(\w)/g).join('');
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
										model.ownership = row.Commodity;
										model.ownership = row.TailingsImpoundments;
										model.roles = ['mem', 'public'];
										model.read = ['public'];
										model.submit = ['mem'];
										model.phases = [];
										model.type = "Mining";
										model.currentPhase = model.phases[0];
									} else { // eao
										model.status = 'In Progress';
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

										model.roles = ['eao', 'public'];
										model.read = ['public'];
										model.submit = ['eao'];
									}
									model.save().then(function () {
										// Am I done processing?
										// console.log("INDEX:",index);
										if (index === length-1) {
											console.log("processed: ",projectProcessed);
											resolve("{done: true, rowsProcessed: "+projectProcessed+"}");
										}
									});
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
	}
});
