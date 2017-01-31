'use strict';
// =========================================================================
//
// Controller for projects
//
// =========================================================================
var path                = require ('path');
var _                   = require ('lodash');
var util 				= require('util');
var mongoose			= require('mongoose');
var Role        		= mongoose.model ('_Role');
var DocumentModel		= mongoose.model('Document');
var ProjectModel		= mongoose.model('Project');

var DBModel             = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var UserClass           = require (path.resolve('./modules/users/server/controllers/admin.server.controller'));
var OrganizationClass   = require (path.resolve('./modules/organizations/server/controllers/organization.controller'));
var access 				= require (path.resolve('./modules/core/server/controllers/core.access.controller'));


module.exports = DBModel.extend ({
	name : 'Project',
	plural : 'projects',
	sort: {name:1},
	populate: 'proponent primaryContact',
	init: function () {
	},
	postMessage: function (obj) {
	},
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
		//console.log('project.preprocessAdd project(1) = ' + JSON.stringify(project, null, 4));
		var self = this;
		//
		// return a promise, we have lots of work to do
		//
		if (_.isEmpty(project.shortName)) {
			project.shortName = project.name.toLowerCase ();
			project.shortName = project.shortName.replace (/\W/g,'-');
			project.shortName = project.shortName.replace (/^-+|-+(?=-|$)/g, '');
		}

		return new Promise (function (resolve, reject) {
			//
			// first generate a project code that can be used internally
			//
			project.code = project.shortName.toLowerCase ();
			project.code = project.code.replace (/\W/g,'-');
			project.code = project.code.replace(/^-+|-+(?=-|$)/g, '');
			if (_.endsWith(project.code, '-')) {
				project.code = project.code.slice(0, -1);
			}			//
			// this does the work of that and returns a promise
			//
			self.guaranteeUniqueCode (project.code)
			//
			// then go about setting up the default admin roles on both
			// sides of the fence
			//
			.then (function (projectCode) {
				//
				// if the project hasn't an orgCode yet then copy in the user's
				//
				if (!project.orgCode) project.orgCode = self.user.orgCode;

				return self.initDefaultRoles(project);
			})
			//.then(function() {
			//	// add all eao-intake users to this project's intake role.
			//	return self.addIntakeUsers(project);
			//})
			.then(function() {
				//console.log('project.preprocessAdd project(2) = ' + JSON.stringify(project, null, 4));
				// since we know that only special people can create projects...
				// let's force this save/create.
				// at this point someone with eao-intake has been put in this project's intake role...
				// however, this controller has been initialized with this user's old roles... so saveDocument will fail.
				// we could do this two ways
				//
				// self.userRoles.push('intake');
				//
				// or
				//
				// self.force = true;
				//
				self.force = true;
				return project;
			})
			.then (resolve, reject);
		});
	},
	postprocessAdd: function(project) {
		return access.syncGlobalProjectUsers()
			.then(function() { return Promise.resolve(project); }, function(err) { return Promise.reject(err); });
	},
	// -------------------------------------------------------------------------
	//
	// set a project to submitted
	//
	// -------------------------------------------------------------------------
	submit: function (project) {
		project.status = 'Submitted';
		//
		// select the right sector lead role
		//
		project.sectorRole = project.type.toLowerCase ();
		project.sectorRole = project.sectorRole.replace (/\W/g,'-');
		project.sectorRole = project.sectorRole.replace (/^-+|-+(?=-|$)/g, '');
		return this.saveDocument (project).then (function (p) {
			//
			// add the project to the roles and the roles to the project
			// this is where the project first becomes visible to EAO
			// through the project admin role and the sector lead role
			// (we dont wait on the promise here, just trust it)
			//
			//
			// TBD ROLES
			//
			return p;
			// return Roles.objectRoles ({
			// 	method      : 'add',
			// 	objects     : p,
			// 	type        : 'projects',
			// 	permissions : {submit : [p.adminRole, p.sectorRole]}
			// });
		});
	},
	// -------------------------------------------------------------------------
	//
	// publish, unpublish
	//
	// -------------------------------------------------------------------------
	publish: function (project, value) {
		var self = this;
		if (value) {
			project.publish ();
		}
		else project.unpublish ();
		return this.saveAndReturn (project);
	},
	// -------------------------------------------------------------------------
	//
	// only published projects, minimal get
	//
	// -------------------------------------------------------------------------
	published: function () {
		var self = this;
		var date = new Date(); // date we want to find open PCPs for... TODAY.

		return new Promise(function (resolve, reject) {
			self.model.find ({ isPublished: true }, {_id: 1, code: 1, name: 1, region: 1, status: 1, eacDecision: 1, lat: 1, lon: 1, type: 1, description: 1, memPermitID: 1})
			.sort ({ name: 1 })
			.exec(function(err, recs) {
				if (err) {
					reject(new Error(err));
				} else {
					resolve(recs);
				}
			});
		});
	},
	// -------------------------------------------------------------------------
	//
	// just what I can write to
	//
	// -------------------------------------------------------------------------
	mine: function () {
		var self = this;

		//Ticket ESM-640.  If these are the user's only roles on a project, don't show the project.
		//
		var ignoredSystemRoles = ['compliance-lead', 'project-eao-staff', 'project-qa-officer'];
		var findMyRoles = function (username) {
			return new Promise(function (fulfill, reject) {
				Role.find({
					user: username,
					role: {$nin: ignoredSystemRoles}
				}).exec(function (error, data) {
					if (error) {
						reject(new Error(error));
					} else if (!data) {
						reject(new Error('findMyRoles: Roles not found for username: ' + username));
					} else {
						fulfill(data);
					}
				});
			});
		};

		var getMyProjects = function(roles) {
			var projectIds = _.uniq(_.map (roles, 'context'));
			// don't want to query for 'application', it's not a project id...
			_.remove(projectIds, function(o) { return o === 'application'; } );

			var q = {
				_id: { "$in": projectIds },
				dateCompleted: { "$eq": null }
			};
			return self.listforaccess ('i do not want to limit my access', q, { _id: 1, code: 1, name: 1, region: 1, status: 1, currentPhase: 1, lat: 1, lon: 1, type: 1, description: 1 }, 'currentPhase', 'name');
		};

		return findMyRoles(self.user.username)
			.then(function(roles) {
				//console.log("roles = " + JSON.stringify(roles, null, 4));
				return getMyProjects(roles);
			})
			.then(function(projects) {
				//console.log("projects = " + JSON.stringify(projects, null, 4));
				return projects;
			});
	},

	initDefaultRoles : function(project) {
		console.log('initDefaultRoles(' + project.code + ')');
		//var defaultRoles = [];

		//project.adminRole = 'project-system-admin';
		//project.proponentAdminRole = 'proponent-lead';
		//project.eaoInviteeRole = undefined;
		//project.proponentInviteeRole = undefined;
		//project.eaoMember = 'team';
		//project.proMember = 'proponent-lead';

		//defaultRoles.push(project.eaoMember);
		//defaultRoles.push(project.proMember);

		return Promise.resolve (project);
	},

	removeProject: function (project) {
		return ProjectModel.remove({_id: project._id});
	},


	search: function (name, region, type, memPermitID) {
		var self = this;
		var getProjects = new Promise(function (resolve, reject) {
			var q = {};
			if (!_.isEmpty(name)) {
				q.name = new RegExp(name, 'i');
			}
			//region is not a reqular expression, it's a pick list, so just query for value....
			if (!_.isEmpty(region)) {
				q.region = region;
			}
			if (!_.isEmpty(type)) {
				q.type = new RegExp(type, 'i');
			}
			if (!_.isEmpty(memPermitID)) {
				q.memPermitID = new RegExp(memPermitID, 'i');
			}
			//console.log('self.listIgnoreAccess(q)...');
			self.listIgnoreAccess(q)
				.then(function (res) {
					//console.log('self.listIgnoreAccess(q)... resolve ', res.length);
					resolve(res);
				}, function (err) {
					//console.log('err = ', JSON.stringify(err));
					reject(new Error(err));
				});
		});

		return getProjects;
	}
});
