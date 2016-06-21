'use strict';
// =========================================================================
//
// Model for application object, just a one-off
//
// =========================================================================
module.exports = require ('../controllers/cc.schema.controller')('Application', {
	_id: {type:String, default:'application'},
	code: {type:String, default:'applicaiton'},
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







