'use strict';
// =========================================================================
//
// Controller for projects
//
// =========================================================================
var path        = require('path');
var DBModel     = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var PhaseClass  = require (path.resolve('./modules/phases/server/controllers/phase.controller'));
var PhaseBaseClass  = require (path.resolve('./modules/phases/server/controllers/phasebase.controller'));
var ProjectIntakeClass  = require (path.resolve('./modules/phases/server/controllers/phasebase.controller'));
var RoleController = require (path.resolve('./modules/roles/server/controllers/role.controller'));
var _           = require ('lodash');

module.exports = DBModel.extend ({
	name : 'ProjectIntake',
	plural : 'projectintakes',
	populate: 'phases',
	listForProject : function (project) {
		var self = this;
		return new Promise (function (resolve, reject) {
			// console.log ('project = ', project);
			self.list ({
				project: project._id
			})
			.then (resolve, reject);
		});
	},
});
