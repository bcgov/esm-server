'use strict';
// =========================================================================
//
// Controller for features
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _         = require ('lodash');

module.exports = DBModel.extend ({
	name : 'Feature',
	plural : 'features',
	getForProject: function (projectId) {
		return this.findMany ({project:projectId});
	},
	getBase: function () {
		return this.findMany ({project:null});
	}
});

