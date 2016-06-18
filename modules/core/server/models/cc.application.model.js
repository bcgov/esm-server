'use strict';
// =========================================================================
//
// Model for application object, just a one-off
//
// =========================================================================
module.exports = require ('../controllers/cc.schema.controller')('Application', {
	__access : [
		'viewConfiguration',
		'viewSchedule',
		'listConditions',
		'listEmailTemplates',
		'listOrganizations',
		'listNews',
		'listRoles',
		'listTemplates',
		'listTopics',
		'listUsers',
		'createCondition',
		'createEmailTemplate',
		'createOrganization',
		'createNew',
		'createRole',
		'createTemplate',
		'createTopic',
		'createUser'
	]
});







