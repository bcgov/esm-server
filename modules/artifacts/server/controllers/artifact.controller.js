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
var _                  = require ('lodash');

module.exports = DBModel.extend ({
	name : 'Artifact',
	plural : 'artifacts',
	populate : 'type',
	getForProject: function (projectid) {

	},
	newFromType: function (type, project) {
		var types = new ArtifactType (this.user);
		var template = new Template (this.user);
		var p = types.findOne ({type:type});
		var self = this;
		return new Promise (function (resolve, reject) {
			var newArtifact = {
				typeName: type,
				name: type,
				project: project._id,
				phase: project.currentPhase._id,
			};
			p.then (function (atype) {
				if (!_.isEmpty (atype)) {
					newArtifact.type = atype._id;
					console.log ("\n\n");
					console.log ('atype.isTemplate = ',atype.isTemplate);
					if (atype.isTemplate) {
						console.log ('documentType:'+type+':');
						return template.findFirst ({documentType:type},null,{versionNumber: -1})
						.then (function (t) {
							console.log ('template = ', t[0]);
							newArtifact.template = t[0]._id;
							newArtifact.isTemplate = true;
							return self.newDocument (newArtifact);
						});
					} else return self.newDocument (newArtifact);
				}
				else return null;
			})
			.then (self.saveDocument)
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
