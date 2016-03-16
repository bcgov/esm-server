'use strict';
// =========================================================================
//
// Controller for projects
//
// =========================================================================
var path               = require('path');
var DBModel            = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var ArtifactTypes      = require ('./artifact.type.controller');
var _                  = require ('lodash');
var mongoose = require('mongoose');
var atypes = mongoose.model ('ArtifactType');

module.exports = DBModel.extend ({
	name : 'Artifact',
	plural : 'artifacts',
	populate : 'type',
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
	createNewArtifactInProject (type, project) {

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
