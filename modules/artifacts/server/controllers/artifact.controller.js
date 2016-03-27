'use strict';
// =========================================================================
//
// Controller for projects
//
// =========================================================================
var path               = require('path');
var DBModel            = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var Template            = require (path.resolve('./modules/templates/server/controllers/template.controller'));
var ArtifactType      = require ('./artifact.type.controller');
var MilestoneClass     = require (path.resolve('./modules/milestones/server/controllers/milestone.controller'));
var PhaseClass     = require (path.resolve('./modules/phases/server/controllers/phase.controller'));
var _                  = require ('lodash');

module.exports = DBModel.extend ({
	name : 'Artifact',
	plural : 'artifacts',
	populate : 'type template',
	bind: ['getCurrentTypes'],
	getForProject: function (projectid) {
		return this.list ({project:projectid},{typeName:1, version:1, stage:1, published:1, userPermissions:1});
	},
	// -------------------------------------------------------------------------
	//
	// make a new artifact from a given type.
	// this will make the new artifact and put it in the first stage and the
	// first version as supplied in the type model
	// if it is of type template, then the most current version of the template
	// that matches the type will be used
	//
	// -------------------------------------------------------------------------
	newFromType: function (type, project) {
		var types = new ArtifactType (this.user);
		var template = new Template (this.user);
		var self = this;
		var artifactType;
		var artifact;
		var prefix = 'Add Artifact Error: ';
		return new Promise (function (resolve, reject) {
			//
			// first off, lets check and make sure that we have everything we need
			// in order to continue
			//
			// console.log ('project: ',JSON.stringify (project, null, 4));
			if (!project) return reject (new Error (prefix+'missing project'));
			if (!project.currentPhase) return reject (new Error (prefix+'missing current phase'));
			//
			// default a new artifact
			//
			self.newDocument ().then (function (a) {
				artifact = a;
				return types.findOne ({type:type});
			})
			//
			// check that we have an artifact type
			//
			.then (function (atype) {
				if (!atype) return reject (new Error (prefix+'cannot locate artifact type'));
				else {
					artifactType = atype;
					// console.log ('getting template');
					if (artifactType.isTemplate) return template.findFirst ({documentType:type},null,{versionNumber: -1});
				}
			})
			//
			// if template, check that have it as well
			//
			.then (function (t) {
				// console.log ('setting tempalte');
				if (artifactType.isTemplate && !t) return reject (prefix+'cannot find template');
				else {
					artifact.template   = t[0];
					artifact.isTemplate = true;
					return artifact;
				}
			})
			//
			// now set up and save the new artifact
			//
			.then (function () {
				artifact.typeName = type;
				artifact.name     = type;
				artifact.project  = project._id;
				artifact.phase    = project.currentPhase._id;
				artifact.type     = artifactType;
				artifact.version  = artifactType.version;
				artifact.stage    = artifactType.stages[0].name;
				return self.saveDocument (artifact);
			})
			//
			// now add the milestone associated with this artifact
			//
			.then (function (m) {
				var p = new PhaseClass (self.user);
				// console.log ('adding a new milestone to the project for this artifact, type = ', artifactType.milestone);
				// console.log ('projecty.currentphase = ', project.currentPhase);
				p.addMilestone (project.currentPhase, artifactType.milestone);
				return m;
			})
			.then (resolve, reject);




			// console.log ('got this far');
			// var newArtifact = {
			// 	typeName : type,
			// 	name     : type,
			// 	project  : project._id,
			// 	phase    : project.currentPhase._id,
			// };
			// console.log ('got this far too');
			// p.then (function (atype) {
			// 	console.log (JSON.stringify (atype, null, 4));
			// 	if (!_.isEmpty (atype)) {
			// 		artifactType = atype;
			// 		newArtifact.type = atype._id;
			// 		newArtifact.version = atype.versions[0];
			// 		newArtifact.stage = atype.stages[0].name;
			// 		// console.log ("\n\n");
			// 		console.log ('atype.isTemplate = ',atype.isTemplate);
			// 		if (atype.isTemplate) {
			// 			// console.log ('documentType:'+type+':');
			// 			return template.findFirst ({documentType:type},null,{versionNumber: -1})
			// 			.then (function (t) {
			// 				console.log ('template = ', t[0]);
			// 				newArtifact.template = t[0]._id;
			// 				newArtifact.isTemplate = true;
			// 				return self.newDocument (newArtifact);
			// 			});
			// 		} else return self.newDocument (newArtifact);
			// 	}
			// 	else return null;
			// })
			// .then (self.saveDocument)
			// .then (function (m) {
			// 	var p = new PhaseClass (self.user);
			// 	console.log ('adding a new milestone to the project for this artifact, type = ', artifactType.milestone);
			// 	console.log ('projecty.currentphase = ', project.currentPhase);
			// 	p.addMilestone (project.currentPhase, artifactType.milestone);
			// 	return m;
			// })
			// .then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// return a list of avaible types based upon the table, but also what the
	// project already has.  So, any artifaacts that can only appear once,
	// such as the project description, cannot be returned if they have already
	// been established within the project
	//
	// -------------------------------------------------------------------------
	availableTypes: function (projectId) {
		//
		// get a list of all multiple types, those can be used
		// get a list of non-multiples
		// get a list of already used types in the project
		// get the disjoint of the latter two and add those to the list of available
		//
		var self = this;
		var Types = new ArtifactType (self.user);
		var multiples = [];
		var nonmultiples = [];
		return new Promise (function (resolve, reject) {
			Types.getMultiples ()
			.then (function (result) {
				// console.log (result);
				if (result) multiples = result;
				// console.log ('multiples = ', multiples);
			})
			.then (Types.getNonMultiples)
			.then (function (result) {
				// console.log (result);
				if (result) nonmultiples = result;
				// console.log ('non-multiples = ', nonmultiples);
				return projectId;
			})
			.then (self.getCurrentTypes)
			.then (function (result) {
				var allowed = [];
				if (result) {
					allowed = _.difference (nonmultiples, result);
				}
				return _.union (multiples, allowed);
			})
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// get all the current types used for a project
	//
	// -------------------------------------------------------------------------
	getCurrentTypes: function (projectId) {
		// console.log ('getCurrentTypes for ', projectId);
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findMany ({project:projectId},{typeName:1})
			.then (function (result) {
				return result.map (function (e) {
					return e.typeName;
				});
			})
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// these save the passed in document and then progress it to the next stage
	//
	// -------------------------------------------------------------------------
	nextStage: function (doc, oldDoc) {
		var stage = _.find (doc.type.stages, function (s) { return s.name === doc.stage; });
		if (stage.next) {
			var next  = _.find (doc.type.stages, function (s) { return s.name === stage.next; });
			return this.newStage (doc, oldDoc, next);
		}
	},
	prevStage: function (doc, oldDoc) {
		var stage = _.find (doc.type.stages, function (s) { return s.name === doc.stage; });
		if (stage.prev) {
			var prev  = _.find (doc.type.stages, function (s) { return s.name === stage.prev; });
			return this.newStage (doc, oldDoc, prev);
		}
	},
	newStage: function (doc, oldDoc, next) {
		doc.stage = next.name;
		// console.log (doc);
		// console.log (doc.reviewnote);
		//
		// if there is a new review note then push it
		//
		if (doc.reviewnote) {
			doc.reviewNotes.push ({
				username : this.user.username,
				date : Date.now(),
				note: doc.reviewnote
			});
		}
		//
		// if there is a new approval note then push it
		//
		if (doc.approvalnote) {
			doc.approvalNotes.push ({
				username : this.user.username,
				date : Date.now(),
				note: doc.approvalnote
			});
		}
		//
		// save the document
		//
		// console.log ('about to attempt to save saveDocument', doc);
		var p = this.update (oldDoc, doc);
		var self = this;
		return new Promise (function (resolve, reject) {
			//
			// once saved go and create the new activity if one is listed under
			// this stage
			//
			p.then (function (model) {
				// console.log ('document saved, now add the activity');
				if (model.milestone && next.activity) {
					var m = new MilestoneClass (self.user);
					return m.findById (model.milestone)
					.then (function (milestone) {
						return m.addActivityFromBaseCode (milestone, next.activity);
					})
					.then (function () {
						return model;
					});
				} else {
					return model;
				}
			})
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// this gets the most current version of each artifact
	//
	// -------------------------------------------------------------------------
	currentArtifacts: function () {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.model.aggregate ([
			    { "$sort": { "versionNumber": -1 } },
			    { "$group": {
			        "_id": "$type",
			        "id": {"$first": "$_id"},
			        "documentType": {"$first": "$type"},
			        "versionNumber": { "$first": "$versionNumber" },
			        "dateUpdated": { "$first": "$dateUpdated" },
			        "stage"       : { "$first": "$stage"}
			    }}
			], function (err, result) {
				if (err) return reject (err);
				else resolve (result);
			});
		});
	},
	// -------------------------------------------------------------------------
	//
	// create a new version of the supplied artifact in the passed in project
	// in its current phase.
	//
	// -------------------------------------------------------------------------
	createNewArtifactInProject: function (type, project) {

	},
	// -------------------------------------------------------------------------
	//
	// for the given artifact, assumed already created in a base form, create
	// the initial activity set using the milestonebase attached to the artifact
	// meta
	//
	// -------------------------------------------------------------------------
	createMilestoneForArtifact: function (artifact) {

	}
});
