'use strict';

var mongoose = require('mongoose');
var Defaults = mongoose.model('_Defaults');
var promise = require('promise');
var _ = require('lodash');

module.exports = function () {


	var defaultsArray = [];

	var defaultRoles = {
		'project-system-admin' : ['proponent-lead', 'proponent-team', 'assessment-admin', 'project-eao-staff', 'project-intake', 'assessment-lead', 'assessment-team', 'assistant-dm', 'project-epd', 'assistant-dmo', 'associate-dm', 'minister', 'minister-office', 'associate-dmo', 'project-qa-officer', 'compliance-lead', 'compliance-officer', 'aboriginal-group', 'project-working-group', 'project-technical-working-group', 'project-participant', 'project-system-admin', 'public'],
	};
	//
	// default project permissions
	//
	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'project',
		level: 'global',
		type: 'default-permissions',
		defaults: {
			roles: defaultRoles,
			permissions: {
				'addUsersToContext' : ['assessment-admin', 'project-intake', 'assessment-lead', 'project-epd', 'project-system-admin', 'sysadmin'],
				'createRole' : ['project-system-admin'],
				'managePermissions' : ['project-system-admin'],
				'manageRoles' : ['assessment-admin', 'project-intake', 'assessment-lead', 'project-epd', 'project-system-admin', 'sysadmin'],
				'listContacts' : ['assessment-admin', 'project-intake', 'assessment-lead', 'project-epd', 'project-system-admin'],
				'viewTombstone' : ['proponent-lead', 'proponent-team', 'assessment-admin', 'project-eao-staff', 'project-intake', 'assessment-lead', 'assessment-team', 'assistant-dm', 'project-epd', 'assistant-dmo', 'associate-dm', 'minister', 'minister-office', 'associate-dmo', 'project-qa-officer', 'compliance-lead', 'compliance-officer', 'aboriginal-group', 'project-working-group', 'project-participant', 'project-system-admin'],
				'viewEAOTombstone' : ['assessment-admin', 'project-eao-staff', 'project-intake', 'assessment-lead', 'assessment-team', 'assistant-dm', 'project-epd', 'assistant-dmo', 'associate-dm', 'associate-dmo', 'project-qa-officer', 'compliance-lead', 'compliance-officer', 'project-system-admin'],
				'editTombstone' : ['assessment-admin', 'project-intake', 'assessment-lead', 'project-epd', 'project-system-admin'],
				'listArtifacts' : ['proponent-lead', 'proponent-team', 'assessment-admin', 'project-eao-staff', 'project-intake', 'assessment-lead', 'assessment-team', 'assistant-dm', 'project-epd', 'assistant-dmo', 'associate-dm', 'associate-dmo', 'compliance-lead', 'compliance-officer', 'project-system-admin'],
				'listValuedComponents' : ['public', 'proponent-lead', 'proponent-team', 'assessment-admin', 'project-eao-staff', 'assessment-lead', 'assessment-team', 'assistant-dm', 'project-epd', 'assistant-dmo', 'associate-dm', 'associate-dmo', 'project-qa-officer', 'compliance-lead', 'compliance-officer', 'project-working-group', 'project-technical-working-group', 'project-system-admin'],
				'listInspectionReports' : ['associate-dm', 'associate-dmo', 'compliance-lead', 'compliance-officer', 'project-qa-officer', 'project-system-admin'],
				'listProjectConditions' : ['proponent-lead', 'proponent-team', 'assessment-admin', 'project-eao-staff', 'assessment-lead', 'assessment-team', 'assistant-dm', 'project-epd', 'assistant-dmo', 'associate-dm', 'associate-dmo', 'project-qa-officer', 'compliance-lead', 'compliance-officer', 'project-working-group', 'project-technical-working-group', 'project-system-admin'],
				'listProjectComplaints' : ['associate-dm', 'associate-dmo', 'compliance-lead', 'compliance-officer', 'project-system-admin'],
				'listProjectInvitations' : ['assessment-admin', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'listDocuments' : ['public', 'proponent-lead', 'proponent-team', 'assessment-admin', 'project-eao-staff', 'project-intake', 'assessment-lead', 'assessment-team', 'assistant-dm', 'project-epd', 'assistant-dmo', 'associate-dm', 'associate-dmo', 'project-qa-officer', 'compliance-lead', 'compliance-officer', 'project-system-admin'],
				'listCommentPeriods' : ['public', 'proponent-lead', 'proponent-team', 'assessment-admin', 'project-eao-staff', 'assessment-lead', 'assessment-team', 'assistant-dm', 'project-epd', 'assistant-dmo', 'associate-dm', 'associate-dmo', 'compliance-lead', 'compliance-officer', 'project-working-group', 'project-technical-working-group', 'project-system-admin'],
				'listEnforcements' : ['associate-dm', 'associate-dmo', 'project-qa-officer', 'compliance-lead', 'compliance-officer', 'project-system-admin'],
				'listProjectUpdates' : ['assessment-admin', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'listProjectGroups' : ['assessment-admin', 'project-eao-staff', 'assessment-lead', 'assessment-team', 'assistant-dm', 'project-epd', 'assistant-dmo', 'associate-dm', 'associate-dmo', 'project-system-admin'],
				'viewSchedule' : ['proponent-lead', 'proponent-team', 'assessment-admin', 'project-eao-staff', 'project-intake', 'assessment-lead', 'assessment-team', 'assistant-dm', 'project-epd', 'assistant-dmo', 'associate-dm', 'associate-dmo', 'project-qa-officer', 'compliance-lead', 'compliance-officer', 'project-working-group', 'project-technical-working-group', 'project-system-admin'],
				'editSchedule' : ['assessment-admin', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'createArtifact' : ['compliance-lead', 'compliance-officer', 'project-qa-officer', 'proponent-lead', 'assessment-admin', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'createValuedComponent' : ['proponent-lead', 'proponent-team', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'createInspectionReport' : ['compliance-lead', 'compliance-officer', 'project-system-admin'],
				'createProjectCondition' : ['proponent-lead', 'proponent-team', 'assessment-lead', 'assessment-team', 'project-epd', 'project-qa-officer', 'project-system-admin'],
				'createProjectComplaint' : ['compliance-lead', 'compliance-officer', 'project-system-admin'],
				'createProjectInvitation' : ['assessment-admin', 'project-intake', 'assessment-lead', 'project-epd', 'project-system-admin'],
				'createDocument' : ['assessment-admin', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'createCommentPeriod' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'createEnforcement' : ['compliance-lead', 'compliance-officer', 'project-system-admin'],
				'createProjectUpdate' : ['assessment-admin', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'createProjectGroup' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'read' : ['proponent-lead', 'proponent-team', 'assessment-admin', 'project-eao-staff', 'project-intake', 'assessment-lead', 'assessment-team', 'assistant-dm', 'project-epd', 'assistant-dmo', 'associate-dm', 'minister', 'minister-office', 'associate-dmo', 'project-qa-officer', 'compliance-lead', 'compliance-officer', 'aboriginal-group', 'project-working-group', 'project-technical-working-group', 'project-participant', 'project-system-admin'],
				'write' : ['assessment-admin', 'project-intake', 'assessment-lead', 'project-epd', 'project-system-admin'],
				'delete' : ['project-system-admin', 'project-intake'],
				'publish' : ['assessment-admin', 'assessment-lead', 'project-epd', 'project-system-admin'],
				'unPublish' : ['assessment-admin', 'assessment-lead', 'project-epd', 'project-system-admin'],
				'manageFolders' : ['project-system-admin'],
				'manageDocumentPermissions': ['project-system-admin']
			}
		}
	}));

	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'activity',
		level: 'global',
		type: 'default-permissions',
		defaults: {
			roles: defaultRoles,
			permissions: {
				'read' : ['project-system-admin'],
				'write' : ['project-system-admin'],
				'delete' : ['project-system-admin'],
				'publish' : ['project-system-admin'],
				'unPublish' : ['project-system-admin']
			}
		}
	}));

	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'artifact',
		level: 'global',
		type: 'default-permissions',
		defaults: {
			roles: defaultRoles,
			permissions: {
				'read': [
					'proponent-lead',
					'proponent-team',
					'assessment-admin',
					'project-eao-staff',
					'project-intake',
					'assessment-lead',
					'assessment-team',
					'assistant-dm',
					'project-epd',
					'assistant-dmo',
					'associate-dm',
					'associate-dmo',
					'project-qa-officer',
					'compliance-lead',
					'compliance-officer',
					'project-working-group',
					'project-technical-working-group',
					'project-system-admin'
				],
				'write': [
					'proponent-lead',
					'proponent-team',
					'assessment-admin',
					'project-intake',
					'assessment-lead',
					'assessment-team',
					'project-epd',
					'project-system-admin'
				],
				'delete': [
					'assessment-admin',
					'project-intake',
					'assessment-lead',
					'assessment-team',
					'project-epd',
					'project-system-admin'
				],
				'publish' : ['assessment-admin'],
				'unPublish' : ['assessment-admin']
			}
		}
	}));

	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'communication',
		level: 'global',
		type: 'default-permissions',
		defaults: {
			roles: defaultRoles,
			permissions: {
				'read' : ['proponent-lead', 'proponent-team', 'assessment-admin', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-working-group', 'project-technical-working-group', 'project-system-admin'],
				'write' : ['assessment-admin', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'delete' : ['assessment-admin', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin']
			}
		}
	}));

	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'condition',
		level: 'global',
		type: 'default-permissions',
		defaults: {
			roles: defaultRoles,
			permissions: {
				'read' : ['system-admin'],
				'write' : ['system-admin'],
				'delete' : ['system-admin']
			}
		}
	}));

	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'document',
		level: 'global',
		type: 'default-permissions',
		defaults: {
			roles: defaultRoles,
			permissions: {
				'read' : ['assessment-admin', 'project-intake', 'assessment-lead', 'assessment-team', 'assistant-dm', 'project-epd', 'assistant-dmo', 'associate-dm', 'associate-dmo', 'compliance-lead', 'compliance-officer', 'project-system-admin'],
				'write' : ['assessment-admin', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'delete' : ['assessment-admin', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'publish' : ['assessment-admin', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'unPublish' : ['assessment-admin', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin']
			}
		}
	}));

	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'folder',
		level: 'global',
		type: 'default-permissions',
		defaults: {
			roles: defaultRoles,
			permissions: {
				'read' : ['assessment-admin', 'project-intake', 'assessment-lead', 'assessment-team', 'assistant-dm', 'project-epd', 'assistant-dmo', 'associate-dm', 'associate-dmo', 'compliance-lead', 'compliance-officer', 'project-system-admin'],
				'write' : ['assessment-admin', 'project-system-admin'],
				'delete' : ['assessment-admin', 'project-system-admin'],
				'publish' : ['assessment-admin', 'project-system-admin'],
				'unPublish' : ['assessment-admin', 'project-system-admin']
			}
		}
	}));

	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'projectgroup',
		level: 'global',
		type: 'default-permissions',
		defaults: {
			roles: defaultRoles,
			permissions: {
				'read' : ['assessment-admin', 'project-eao-staff', 'project-intake', 'assessment-lead', 'assessment-team', 'assistant-dm', 'project-epd', 'assistant-dmo', 'associate-dm', 'associate-dmo', 'project-system-admin'],
				'write' : ['assessment-admin', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'delete' : ['assessment-admin', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin']
			}
		}
	}));

	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'inspectionreport',
		level: 'global',
		type: 'default-permissions',
		defaults: {
			roles: defaultRoles,
			permissions: {
				'read' : ['associate-dm', 'associate-dmo', 'compliance-lead', 'compliance-officer', 'project-qa-officer', 'project-system-admin'],
				'write' : ['compliance-lead', 'compliance-officer', 'project-system-admin'],
				'delete' : ['compliance-lead', 'compliance-officer', 'project-system-admin'],
				'publish' : ['compliance-lead', 'project-system-admin'],
				'unPublish' : ['compliance-lead', 'project-system-admin']
			}
		}
	}));

	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'inspectionreportdetail',
		level: 'global',
		type: 'default-permissions',
		defaults: {
			roles: defaultRoles,
			permissions: {
				'read' : ['associate-dm', 'associate-dmo', 'compliance-lead', 'compliance-officer', 'project-qa-officer', 'project-system-admin'],
				'write' : ['compliance-lead', 'compliance-officer', 'project-system-admin'],
				'delete' : ['compliance-lead', 'compliance-officer', 'project-system-admin'],
				'publish' : ['compliance-lead', 'project-system-admin'],
				'unPublish' : ['compliance-lead', 'project-system-admin']
			}
		}
	}));


	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'comment',
		level: 'global',
		type: 'default-permissions',
		defaults: {
			roles: defaultRoles,
			permissions: {
				'read' : ['proponent-lead', 'proponent-team', 'assessment-admin', 'project-eao-staff', 'assessment-lead', 'assessment-team', 'assistant-dm', 'project-epd', 'assistant-dmo', 'associate-dm', 'associate-dmo', 'project-working-group', 'project-technical-working-group', 'project-system-admin'],
				'write' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-working-group', 'project-technical-working-group', 'project-system-admin'],
				'delete' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'publish' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'unPublish' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin']
			}
		}
	}));

	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'commentperiod',
		level: 'global',
		type: 'default-permissions',
		defaults: {
			roles: defaultRoles,
			permissions: {
				'read' : ['proponent-lead', 'proponent-team', 'assessment-admin', 'project-eao-staff', 'assessment-lead', 'assessment-team', 'assistant-dm', 'project-epd', 'assistant-dmo', 'associate-dm', 'associate-dmo', 'compliance-lead', 'compliance-officer', 'project-working-group', 'project-technical-working-group', 'project-system-admin'],
				'write' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'delete' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'publish' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'unPublish' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin']
			}
		}
	}));

	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'complaint',
		level: 'global',
		type: 'default-permissions',
		defaults: {
			roles: defaultRoles,
			permissions: {
				'read' : ['compliance-lead', 'compliance-officer', 'project-system-admin'],
				'write' : ['compliance-lead', 'compliance-officer', 'project-system-admin'],
				'delete' : ['compliance-lead', 'project-system-admin']
			}
		}
	}));
	
	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'projectcondition',
		level: 'global',
		type: 'default-permissions',
		defaults: {
			roles: defaultRoles,
			permissions: {
				'read' : ['proponent-lead', 'proponent-team', 'assessment-admin', 'project-eao-staff', 'assessment-lead', 'assessment-team', 'assistant-dm', 'project-epd', 'assistant-dmo', 'associate-dm', 'associate-dmo', 'project-qa-officer', 'compliance-lead', 'compliance-officer', 'project-working-group', 'project-technical-working-group', 'project-system-admin'],
				'write' : ['proponent-lead', 'proponent-team', 'assessment-lead', 'assessment-team', 'project-epd', 'project-qa-officer', 'project-system-admin'],
				'delete' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'publish' : ['assessment-lead', 'project-epd', 'project-system-admin'],
				'unPublish' : ['assessment-lead', 'project-epd', 'project-system-admin']
			}
		}
	}));

	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'ir',
		level: 'global',
		type: 'default-permissions',
		defaults: {
			roles: defaultRoles,
			permissions: {
				'read' : ['associate-dm', 'associate-dmo', 'compliance-lead', 'compliance-officer', 'project-qa-officer', 'project-system-admin'],
				'write' : ['compliance-lead', 'compliance-officer', 'project-system-admin'],
				'delete' : ['compliance-lead', 'compliance-officer', 'project-system-admin'],
				'publish' : ['compliance-lead', 'project-system-admin'],
				'unPublish' : ['compliance-lead', 'project-system-admin']
			}
		}
	}));

	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'vc',
		level: 'global',
		type: 'default-permissions',
		defaults: {
			roles: defaultRoles,
			permissions: {
				'read' : ['proponent-lead', 'proponent-team', 'assessment-admin', 'project-eao-staff', 'assessment-lead', 'assessment-team', 'assistant-dm', 'project-epd', 'assistant-dmo', 'associate-dm', 'associate-dmo', 'project-qa-officer', 'compliance-lead', 'compliance-officer', 'project-working-group', 'project-technical-working-group', 'project-system-admin'],
				'write' : ['proponent-lead', 'proponent-team', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'delete' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'publish' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'unPublish' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin']
			}
		}
	}));

	//
	// default application permissions
	//
	defaultsArray.push(new Defaults({
		context: 'application',
		resource: 'application',
		level: 'global',
		type: 'default-permissions',
		//
		// this goes owner, role, permissions
		//
		defaults: {
			roles: {
				'sysadmin': ['sysadmin', 'eao', 'proponent', 'project-intake', 'project-eao-staff', 'assistant-dm', 'assistant-dmo', 'associate-dm', 'associate-dmo', 'project-qa-officer', 'compliance-lead']
			},
			permissions: {
				'listConditions': ['sysadmin', 'eao'],
				'listEmailTemplates': ['sysadmin', 'eao'],
				'listOrganizations': ['sysadmin', 'eao'],
				'listNews': ['sysadmin', 'eao'],
				'listRoles': ['sysadmin', 'eao'],
				'listTemplates': ['sysadmin', 'eao'],
				'listValuedComponents': ['sysadmin', 'eao'],
				'listContacts': ['sysadmin', 'eao'],
				'createProject': ['sysadmin', 'project-intake'],
				'createCondition': ['sysadmin'],
				'createEmailTemplate': ['sysadmin'],
				'createOrganization': ['sysadmin'],
				'createNews': ['sysadmin'],
				'createRole': [], // jsherman - 2016-09-01 - don't want anyone to create new system level roles at this time. locking down roles and permissions so we don't have to worry about adding new defaults to a new role.
				'createTemplate': ['sysadmin'],
				'createValuedComponent': ['sysadmin'],
				'createContact': ['sysadmin'],
				'manageRoles': ['sysadmin'],
				'manageCodeLists': ['sysadmin', 'eao'],
				'managePermissions': ['sysadmin'],
				'addUsersToContext': ['sysadmin']
			}
		}
	}));

	var allApplicationPermissions = [
		//'listConditions',
		'listEmailTemplates',
		'listOrganizations',
		'listNews',
		'listRoles',
		'listTemplates',
		'listValuedComponents',
		'listContacts',
		//'createCondition',
		'createEmailTemplate',
		'createOrganization',
		'createNews',
		//'createRole',
		'createTemplate',
		'createValuedComponent',
		'createContact',
		'createProject',
		'manageRoles',
		'manageCodeLists',
		'managePermissions',
		'addUsersToContext'
	];
	var readApplicationPermissions = [
		//'listConditions',
		'listEmailTemplates',
		'listOrganizations',
		'listNews',
		'listRoles',
		'listTemplates',
		'listValuedComponents',
		'listContacts'
	];

	defaultsArray.push(new Defaults({
		context: 'application',
		resource: 'application',
		level: 'global',
		type: 'rolePermissions',
		//
		// this goes owner, role, permissions
		//
		defaults: {
			'application:sysadmin': {
				'sysadmin': allApplicationPermissions,
				'eao': readApplicationPermissions,
				'proponent': readApplicationPermissions,
				'project-intake': ['createProject']
			}
		}
	}));

	defaultsArray.push(new Defaults({
		context: 'application',
		resource: 'application',
		level: 'global',
		type: 'global-project-roles',
		defaults: {
			'roles' : ['project-intake', 'project-eao-staff', 'assistant-dm', 'assistant-dmo', 'associate-dm', 'associate-dmo', 'project-qa-officer', 'compliance-lead']
		}
	}));

	//
	//
	//  Do the work...
	//  Delete all existing defaults first, then add in all the ones above.
	//
	//
	return new promise(function (resolve, reject) {
		Defaults.remove({}, function (err, removed) {
			if (err) {
				console.log('Error deleting defaults: ' + JSON.stringify(err));
				reject(new Error(err));
			}
			else {
				console.log('Deleted exiting defaults: ' + JSON.stringify(removed));
				resolve(removed);
			}
		});
	})
		.then(function () {
			console.log('Defaults deleted, starting permission seeding...');
			return promise.all(defaultsArray.map(function (d) {
				return new promise(function (resolve, reject) {
					d.save(function (err) {
						if (err) {
							console.log('Error adding default: context=' + d.context + ', resource=' + d.resource + ', type=' + d.type + ': ' + JSON.stringify(err));
							reject(new Error(err));
						} else {
							console.log('Default saved. _id=' + d._id + ', context=' + d.context + ', resource=' + d.resource + ', type=' + d.type);
							resolve(d);
						}
					});
				});
			}));
		})
		.then(function (test) {
			console.log('Default permission seeding done.');
		});
};

