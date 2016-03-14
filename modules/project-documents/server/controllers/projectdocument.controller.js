'use strict';
// =========================================================================
//
// Controller for projectdocuments
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _         = require ('lodash');

module.exports = DBModel.extend ({
	name : 'ProjectDocument',
	plural : 'projectdocuments',
	getForProject: function (projectId) {
		return this.findMany ({project:projectId});
	},
});

