'use strict';
// =========================================================================
//
// Model for application object, just a one-off
//
// =========================================================================
module.exports = require('../controllers/core.schema.controller')('Application', {
	_id: {type: String, default: 'application'},
	code: {type: String, default: 'application'},
	__access: [
		'listConditions',
		'listEmailTemplates',
		'listOrganizations',
		'listNews',
		'listRoles',
		//'listTemplates',
		'listValuedComponents',
		'listContacts',
		'createCondition',
		'createEmailTemplate',
		'createOrganization',
		'createNews',
		'createRole',
		//'createTemplate',
		'createValuedComponent',
		'createContact',
		'createProject',
		'manageRoles',
		'manageCodeLists',
		'managePermissions',
		'addUsersToContext'
	]
});







