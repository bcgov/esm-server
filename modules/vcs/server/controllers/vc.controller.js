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
	}
});

