'use strict';
// =========================================================================
//
// Controller for vcs
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _         = require ('lodash');

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
});

