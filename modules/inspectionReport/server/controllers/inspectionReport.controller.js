'use strict';
// =========================================================================
//
// Controller for inspectionreport
//
// =========================================================================
var path     = require('path');
var DBModel  = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));


/*

var TaskClass = require (path.resolve('./modules/tasks/server/controllers/task.controller'));
var TaskBaseClass = require (path.resolve('./modules/tasks/server/controllers/taskbase.controller'));
*/



module.exports = DBModel.extend ({
	name : 'Inspectionreport',
	plural : 'inspectionreports',
	populate : 'inspectionDetails',
	getForProject: function (projectId) {
		return this.list ({project:projectId});
	},
});

