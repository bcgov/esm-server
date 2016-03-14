'use strict';
// =========================================================================
//
// Controller for descriptions
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _         = require ('lodash');

module.exports = DBModel.extend ({
	name : 'Description',
	plural : 'descriptions',
	getForProject: function (projectId) {
		return this.findMany ({project:projectId});
	},
});

