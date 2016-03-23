'use strict';
// =========================================================================
//
// Controller for phases
//
// =========================================================================
var path           = require('path');
var DBModel        = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var MilestoneClass = require (path.resolve('./modules/milestones/server/controllers/milestone.controller'));
var MilestoneBaseClass = require (path.resolve('./modules/milestones/server/controllers/milestonebase.controller'));
var _              = require ('lodash');
var RoleController = require (path.resolve('./modules/roles/server/controllers/role.controller'));

module.exports = DBModel.extend ({
	name : 'Phase',
	plural : 'phases',
	// populate: 'milestones',
	preprocessAdd: function (phase) {
		var self = this;
		return new Promise (function (resolve, reject) {
			// console.log ('adding phase roles');
			RoleController.addRolesToConfigObject (phase, 'phases', {
				read   : ['project:eao:member', 'eao'],
				submit : ['project:eao:admin']
			})
			.then (function () {
				resolve (phase);
			})
			.catch (reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// when making a phase from a base it will aslways be in order to attach
	// to a project, so the project and stream are passed in here along with the
	// base
	// make our new phase so we have an id
	// first get all the milestones and make propoer objects from those,
	// reverse link the new milestones to the new phase by passing in the
	// ancestry
	// save the phase
	//
	// -------------------------------------------------------------------------
	makePhaseFromBase : function (base, streamid, projectid, projectcode, roles) {
		var self = this;
		var Milestone = new MilestoneClass (this.user);
		var MilestoneBase = new MilestoneBaseClass (this.user);
		return new Promise (function (resolve, reject) {
			var baseid = base._id;
			var newobjectid;
			var newobject;
			var children;
			var basename = 'phaseBase';
			var newchildfunction = Milestone.makeMilestoneFromBase;
			var findchildbyid = MilestoneBase.findById;
			var childname = 'milestones';
			// get all the children
			Promise.all (base[childname].map (findchildbyid))
			.then (function (models) {
				// assign it for later use
				children = models;
				// make the new newobject from the base
				return self.copy (base);
			})
			.then (function (model) {
				newobjectid = model._id;
				newobject   = model;
				//
				// fix the roles
				//
				model.fixRoles (projectcode);
				if (roles) model.addRoles (roles);
				RoleController.addRolesToConfigObject (model, 'phases', model.roleSet());
				//
				// assign whatever ancenstry is needed
				//
				model[basename] = baseid;
				model.project = projectid;
				model.projectCode = projectcode;
				model.stream  = streamid;
				// return the promise of new children
				return Promise.all (children.map (function (m) {
					return Milestone.makeMilestoneFromBase (m, streamid, projectid, projectcode, newobjectid, roles);
				}));
			})
			.then (function (models) {
				// assign each new child to the newobject
				_.each (models, function (m) {
					newobject[childname].push (m._id);
				});
				return newobject;
			})
			.then (self.saveDocument)
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// add a milestone to a phase from a base milestone (creates a proper
	// milestone with all its children and pushes it onto the array)
	//
	// -------------------------------------------------------------------------
	addMilestoneFromBase : function (phase, milestonebase, roles) {
		var self = this;
		var Milestone = new MilestoneClass (this.user);
		return new Promise (function (resolve, reject) {
			Milestone.makeMilestoneFromBase (
				milestonebase,
				phase.stream,
				phase.project,
				phase.projectCode,
				phase._id,
				roles
			)
			.then (function (newmilestone) {
				phase.milestones.push (newmilestone._id);
				return phase;
			})
			.then (self.saveDocument)
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// given a base milestone code, add a copy of it to the phase
	//
	// -------------------------------------------------------------------------
	addMilestoneFromCode : function (phase, milestoneCode, roles) {
		var self = this;
		return new Promise (function (resolve, reject) {
			var MilestoneBase = new MilestoneBaseClass (self.user);
			MilestoneBase.findOne ({
				code: milestoneCode
			})
			.then (function (base) {
				return self.addMilestoneFromBase (phase, base, roles);
			})
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// get phases based on a project, or not, with access of read or write
	// the default get * already does any project, read, so we just need
	// to do any project, write, and project read/write
	//
	// -------------------------------------------------------------------------
	userPhases: function (projectCode, access) {
		var self = this;
		return new Promise (function (resolve, reject) {
			var q = (projectCode) ? {projectCode:projectCode} : {} ;
			var p = (access === 'write') ? self.listwrite (q) : self.list (q);
			p.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// phase for project that this user can read
	//
	// -------------------------------------------------------------------------
	phasesForProject: function (id) {
		var p = this.list ({project:id});
		return new Promise (function (resolve, reject) {
			p.then (resolve, reject);
		});
	}

});



