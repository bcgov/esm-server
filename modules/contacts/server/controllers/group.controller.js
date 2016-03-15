'use strict';
// =========================================================================
//
// Controller for contacts
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _         = require ('lodash');

module.exports = DBModel.extend ({
	name : 'Group',
	plural : 'groups',
	getForProject: function (projectId) {
		return this.findMany ({project:projectId});
	},
});

