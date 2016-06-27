'use strict';
// =========================================================================
//
// Controller for irs
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/cc.dbmodel.controller'));
var _         = require ('lodash');

module.exports = DBModel.extend ({
	name : 'Ir',
	plural : 'irs',
	getForProject: function (projectId) {
		return this.list ({project:projectId});
	},
});

