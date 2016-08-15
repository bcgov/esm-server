'use strict';
// =========================================================================
//
// Controller for irs
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _         = require ('lodash');

module.exports = DBModel.extend ({
	name : 'Enforcement',
	plural : 'enforcements',
	getForProject: function (projectId) {
		return this.list ({project:projectId});
	},
});

