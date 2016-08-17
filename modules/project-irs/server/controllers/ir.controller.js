'use strict';
// =========================================================================
//
// Controller for irs
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _         = require ('lodash');
var Ir  = require (path.resolve('./modules/project-irs/server/controllers/ir.controller'));

module.exports = DBModel.extend ({
	name : 'Ir',
	plural : 'irs',
	getForProject: function (projectId) {
		return this.list ({project:projectId});
	},
	conditionsForIr: function (irId) {
		return this.list ({ _id:irId }, { conditions: 1, conditionArtifacts: 1 });
	},
	publish: function (ir) {
		return new Promise(function (resolve, reject) {
			ir.publish();
			ir.save()
			.then(resolve, reject);
		});
	},
	unpublish: function(ir) {
		return new Promise(function (resolve, reject) {
			ir.unpublish();
			ir.save()
			.then(resolve, reject);
		});
	},});

