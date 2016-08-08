'use strict';
// =========================================================================
//
// Controller for vcs
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _         = require ('lodash');
var Artifact  = require (path.resolve('./modules/artifacts/server/controllers/artifact.controller'));
var mongoose = require('mongoose');
var ArtifactModel = mongoose.model('Artifact');
var CommentModel = mongoose.model('Comment');

module.exports = DBModel.extend ({
	name : 'Vc',
	plural : 'vcs',
	getForProject: function (projectId) {
		return this.list ({project:projectId});
	},
	// -------------------------------------------------------------------------
	//
	// get all vcs from a supplied list
	//
	// -------------------------------------------------------------------------
	getList : function (list) {
		return this.list ({_id : {$in : list }});
	},
	publish: function (vc) {
		var artifact = new Artifact(this.opts);
		return new Promise(function (resolve, reject) {
			vc.publish();
			vc.save()
			.then(function(){
				return artifact.oneIgnoreAccess({_id: vc.artifact});
			})
			.then(function (art) {
				return artifact.publish(art);
			})
			.then(function () {
				return vc;
			})
			.then(resolve, reject);
		});
	},
	unpublish: function(vc) {
		var artifact = new Artifact(this.opts);
		return new Promise(function (resolve, reject) {
			vc.unpublish();
			vc.save()
			.then(function(){
				return artifact.oneIgnoreAccess({_id: vc.artifact});
			})
			.then(function (art) {
				return artifact.unpublish(art);
			})
			.then(function () {
				return vc;
			})
			.then(resolve, reject);
		});
	},
	
	deleteCheck : function(vc) {
		console.log('deleteCheck ', JSON.stringify(vc));
		var self = this;
		var result = {
			canDelete: true,
			artifacts: [],
			comments: [],
			vcs: []
		};
		
		//console.log('deleteCheck find artifacts (not the vc  create one though)...');
		return ArtifactModel.find({valuedComponents : vc._id, _id: {$ne : vc.artifact} })
		.exec()
		.then(function(data) {
			//console.log('deleteCheck find artifacts...', JSON.stringify(data));
			if (data && data.length > 0) {
				result.artifacts = data;
				result.canDelete = false;
			}
			//console.log('deleteCheck find comments...');
			return CommentModel.find({valuedComponents : vc._id}).exec();
		})
		.then(function(data) {
			//console.log('deleteCheck find comments...', JSON.stringify(data));
			if (data && data.length > 0) {
				result.comments = data;
				result.canDelete = false;
			}
			//console.log('deleteCheck find vcs...');
			return self.model.find({subComponents : vc._id}).exec();
		})
		.then(function(data) {
			//console.log('deleteCheck find vcs...', JSON.stringify(data));
			if (data && data.length > 0) {
				result.vcs = data;
				result.canDelete = false;
			}
			return result;
		});
	},
	
	deleteWithCheck: function(vc) {
		//console.log('deleteWithCheck ', JSON.stringify(vc));
		var self = this;
		
		var deleteArtifact = new Promise(function(resolve, reject) {
			ArtifactModel.remove({_id: vc.artifact}, function(err) {
				if (err) reject(new Error(err));
				resolve();
			});
		});
		
		return new Promise(function(resolve, reject) {
			self.deleteCheck(vc)
			.then(function(data) {
				if (data && data.canDelete) {
					//console.log('deleteCheck can delete, call delete on vc.artifact...');
					return deleteArtifact.then(resolve(self.delete(vc)));
				} else {
					// do not delete, return data?
					//console.log('deleteCheck failed, reject!');
					reject(data);
				}
			});
		});
	}
});

