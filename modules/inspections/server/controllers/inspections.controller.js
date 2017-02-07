'use strict';
// =========================================================================
//
// Controller for inspectionreport
//
// =========================================================================
var path     = require('path');
var _ = require('lodash');
var DBModel  = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));

module.exports = DBModel.extend ({
	name : 'Inspection',
	plural : 'inspections',

	getForProject: function (projectCode) {
		return this.list ({projectCode:projectCode});
	}
});

