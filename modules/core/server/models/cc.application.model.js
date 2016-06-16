'use strict';
// =========================================================================
//
// Model for application object, just a one-off
//
// =========================================================================
module.exports = require ('../controllers/cc.schema.controller')('Application', {
	__access           : [
		'listProjects',
		'createProject',
		'listConditions',
		'createCondition',
		'viewSystemMenu'
	]
});
