'use strict';
// =========================================================================
//
// Controller for projectconditions
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _         = require ('lodash');

module.exports = DBModel.extend ({
	name : 'ProjectCondition',
	plural : 'projectconditions',
	getForProject: function (projectId) {
		return this.list ({project:projectId});
	},
	publish: function (pcId) {
		return this.findById(pcId)
			.then(function(pc) {
				pc.publish();
				return pc.save();
			});
	},
	unpublish: function(pcId) {
		return this.findById(pcId)
			.then(function(pc) {
				pc.unpublish();
				return pc.save();
			});
	}
});

