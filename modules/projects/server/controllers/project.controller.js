'use strict';
// =========================================================================
//
// Controller for projects
//
// =========================================================================
var path                = require ('path');
var DBModel             = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var UserClass           = require (path.resolve('./modules/users/server/controllers/admin.server.controller'));
var PhaseClass          = require (path.resolve('./modules/phases/server/controllers/phase.controller'));
var PhaseBaseClass      = require (path.resolve('./modules/phases/server/controllers/phasebase.controller'));
var OrganizationClass   = require (path.resolve('./modules/organizations/server/controllers/organization.controller'));
var StreamClass         = require (path.resolve('./modules/streams/server/controllers/stream.controller'));
var RecentActivityClass = require (path.resolve('./modules/recent-activity/server/controllers/recent-activity.controller'));
var Roles               = require (path.resolve('./modules/roles/server/controllers/role.controller'));
var _                   = require ('lodash');
var util = require('util');

module.exports = DBModel.extend ({
	name : 'Project',
	plural : 'projects',
	sort: {name:1},
	populate: 'currentPhase phases',
	// bind: ['addPrimaryUser','addProponent'],
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
				projectAdminRole       = Roles.generateCode (projectCode, 'eao', 'admin');
				projectProponentAdmin  = Roles.generateCode (projectCode, 'pro', 'admin');
				projectProponentMember = Roles.generateCode (projectCode, 'pro', 'member');
				//
				// set the project admin roles
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
				// console.log ('Step2. assign default roles.');
				return Roles.objectRoles ({
					method: 'set',
					objects: project,
					type: 'projects',
					permissions: {
						read   : [projectProponentMember],
						submit : [projectProponentAdmin, projectAdminRole]
					}
				});
			})
			//
			// add the appropriate role to the user
			//
			.then (function () {
				// console.log ('Step3. assign admin role to user.');
				// console.log ('project is now ', project);
				var userRole = (self.user.orgCode !== 'eao' && self.user.orgCode === project.orgCode) ? projectProponentAdmin : projectAdminRole;
				return Roles.userRoles ({
					method: 'add',
					users: self.user,
					roles: userRole
				});
			})
			//
			// update this model's user roles
			// do this because the user now has new access, without this they
			// cannot save the project
			//
			.then (function () {
				// console.log ('Step4. set query access roles in the dbmodel object');
				self.setRoles (self.user);
				return project;
			})
			//
			// add a pre submission phase
			//
			.then (function () {
				// console.log ('Step5. add the first basic phase, pre-stream, pre-submission');
				return self.addPhase (project, 'pre-submission')
				.then (function (m) {
					m.currentPhase = m.phases[0];
					m.currentPhaseCode = m.phases[0].name;
					return m;
				});
			})
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// get the stream itself
	//
	// -------------------------------------------------------------------------
	getStream: function (code) {
		return (new StreamClass (this.user)).findOne ({code:code});
	},
	// -------------------------------------------------------------------------
	//
	// build a permission set from the default eao and proponent roles for the
	// project indicated by the projectCode copied earlier from the milestone
	// return the promise from the role machine (this also saves the activity
	// and resolves to the list of activities passed in, all saved)
	//
	// -------------------------------------------------------------------------
	setDefaultRoles: function (project, base) {
		var permissions = {
			read:[],
			write:[],
			submit:[],
			watch:[]
		};
		_.each (base.default_eao_read   , function (code) {
			permissions.read.push (Roles.generateCode (project.code, 'eao', code));
		});
		_.each (base.default_eao_write  , function (code) {
			permissions.write.push (Roles.generateCode (project.code, 'eao', code));
		});
		_.each (base.default_eao_submit , function (code) {
			permissions.submit.push (Roles.generateCode (project.code, 'eao', code));
		});
		_.each (base.default_eao_watch  , function (code) {
			permissions.watch.push (Roles.generateCode (project.code, 'eao', code));
		});
		_.each (base.default_pro_read   , function (code) {
			permissions.read.push (Roles.generateCode (project.code, 'pro', code));
		});
		_.each (base.default_pro_write  , function (code) {
			permissions.write.push (Roles.generateCode (project.code, 'pro', code));
		});
		_.each (base.default_pro_submit , function (code) {
			permissions.submit.push (Roles.generateCode (project.code, 'pro', code));
		});
		_.each (base.default_pro_watch  , function (code) {
			permissions.watch.push (Roles.generateCode (project.code, 'pro', code));
		});
		return Roles.objectRoles ({
			method      : 'add',
			objects     : project,
			type        : 'projects',
			permissions : permissions
		});
	},
	// -------------------------------------------------------------------------
	//
	// Add a phase to the project from a code
	//
	// -------------------------------------------------------------------------
	addPhase : function (project, basecode) {
		var self = this;
		var Phase = new PhaseClass (self.user);
		return new Promise (function (resolve, reject) {
			//
			// get the new milestone
			//
			Phase.fromBase (basecode, project)
			.then (function (phase) {
				project.phases.push (phase);
				return project;
			})
			.then (self.saveDocument)
			.then (function (pro) {
				// console.log ('pro.phases:', JSON.stringify (pro.phases, null, 4));
				return pro;
			})
			.then (resolve, reject);
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
			Roles.objectRoles ({
				method      : 'add',
				objects     : project,
				type        : 'projects',
				permissions : {submit : [project.adminRole, project.sectorRole]}
			})
			.then (function () {
				(new RecentActivityClass (self.user)).create ({
					headline: 'Submitted for Approval: '+project.name,
					content: project.name+' has been submitted for approval to the Environmental Assessment process.\n'+project.description,
					project: project._id,
					type: 'News'
				});
				return project;
			})
			//
			// save changes
			//
			.then (self.saveAndReturn)
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
	// thought that setting the stream would cause any other
	// phases to complete and the first new one to start, but actually
	// this is a manual process as there could be a period
	// of time between phases
	//
	// -------------------------------------------------------------------------
	setStream : function (project, stream) {
		var self      = this;
		return new Promise (function (resolve, reject) {
			var nPhases = project.phases.length;
			// console.log ('the project has '+nPhases+' phases');
			project.stream = stream._id;
			//
			// we MUST add the admin role to the current user or they cannot
			// perform the upcoming save
			//
			Roles.userRoles ({
				method: 'add',
				users: self.user,
				roles: project.adminRole
			})
			.then (function () {
				//
				// reset the user in this object with its new permissions
				//
				self.setRoles (self.user);
				//
				// add the default roles from the stream
				//
				return self.setDefaultRoles (project, stream);
			})
			// then add the phases
			.then (function () {
				//
				// This little bit of magic forces the synchronous executiuon of
				// async functions as promises, so a sync version of all.
				//
				return stream.phases.reduce (function (current, code) {
					return current.then (function () {
						// console.log ('++ add phase ', code);
						return self.addPhase (project, code);
					});
				}, Promise.resolve());
				// return Promise.all (stream.phases.map (function (code) {
				// 	return self.addPhase (project, code);
				// }));
			})
			// then do some work on the project itself and save it
			.then (function (proj) {
				// console.log ('now fix up the project');
				// console.log ('proj.phases ', JSON.stringify(proj.phases, null, 4));
				// console.log ('current project ', JSON.stringify(project, null, 4));
				//
				// set the status to in progress and set the start date on the project itself
				//
				proj.status           = 'In Progress';
				proj.dateStarted      = Date.now ();
				proj.dateStartedEst   = Date.now ();
				proj.dateCompletedEst = Date.now ();
				//
				// now we have to go through all the phases and get all of their durations
				//
				proj.duration = proj.phases.map (function (p) {return p.duration;}).reduce (function (p, n) {return p + n;});
				proj.dateCompletedEst.setDate (proj.dateCompletedEst.getDate () + proj.duration);
				if (!proj.currentPhase) {
					proj.currentPhase = proj.phases[0];
					proj.currentPhaseCode = proj.phases[0].name;
				}
				//
				// add a news item
				//
				(new RecentActivityClass (self.user)).create ({
					headline: 'Accepted: '+proj.name,
					content: proj.name+' has been accepted for an Environmental Assessment\n'+proj.description,
					project: proj._id,
					type: 'News'
				});
				//
				// save
				//
				return self.saveAndReturn (proj);
			})
			// then leave
			.then (function (pro) {
				// console.log ('pro.phases:', JSON.stringify (pro.phases, null, 4));
				return pro;
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
			// console.log('setcurrentphase', project, phase);
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
		if (value) project.publish ();
		else project.unpublish ();
		return this.saveAndReturn (project);
	},


});

/*
	// // preprocessUpdate: function (project) {
	// // 	// var self = this;
	// // 	// return self.addPrimaryUser (project)
	// // 	// .then (self.addProponent);
	// // },
	// addPrimaryUser: function (project) {
	// 	var self = this;
	// 	return new Promise (function (resolve, reject) {
	// 		var p = null;
	// 		if (project.primaryContact && !_.isEmpty (project.primaryContact)) {
	// 			var User = new UserClass (self.user);
	// 			if (project.primaryContact._id) {
	// 				p = User.findAndUpdate (project.primaryContact);
	// 			} else {
	// 				p = User.newFromObject (project.primaryContact);
	// 			}
	// 		}
	// 		p.then (function (rec) {
	// 			project.primaryContact = rec._id;
	// 			resolve (project);
	// 		})
	// 		.catch (reject);
	// 	});
	// },
	// addProponent: function (project) {
	// 	var self = this;
	// 	return new Promise (function (resolve, reject) {
	// 		var p = null;
	// 		if (project.proponent && !_.isEmpty (project.proponent)) {
	// 			var User = new OrganizationClass (self.user);
	// 			if (project.proponent._id) {
	// 				p = User.findAndUpdate (project.proponent);
	// 			} else {
	// 				p = User.newFromObject (project.proponent);
	// 			}
	// 		}
	// 		p.then (function (rec) {
	// 			project.proponent = rec._id;
	// 			resolve (project);
	// 		})
	// 		.catch (reject);
	// 	});
	// },

	// // -------------------------------------------------------------------------
	// //
	// // add a phase to the project from a phase base
	// // add the phase with whatever new permissions
	// //
	// // -------------------------------------------------------------------------
	// addPhase : function (project, phasebase, roles) {
	// 	var self = this;
	// 	return new Promise (function (resolve, reject) {
	// 		var phase = new PhaseClass (self.user);
	// 		phase.makePhaseFromBase (phasebase, project.stream, project._id, project.code, roles)
	// 		.then (function (model) {
	// 			project.phases.push (model._id);
	// 			return  project;
	// 		})
	// 		.then (function (m) {
	// 			return self.saveAndReturn (m);
	// 		})
	// 		.then (resolve, reject);
	// 	});
	// },
	// addPhaseFromCode : function (project, phasecode, roles) {
	// 	var self = this;
	// 	return new Promise (function (resolve, reject) {
	// 		var PhaseBase = new PhaseBaseClass (self.user);
	// 		PhaseBase.findOne ({
	// 			code: phasecode
	// 		})
	// 		.then (function (base) {
	// 			return self.addPhase (project, base, roles);
	// 		})
	// 		.then (resolve, reject);
	// 	});
	// },



*/
