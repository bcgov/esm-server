'use strict';

var mongoose = require('mongoose');
var Defaults = mongoose.model('_Defaults');
var promise = require('promise');
var _ = require('lodash');

module.exports = function () {

	var defaultsArray = [];

	var defaultRoles = {
		'project-system-admin' : ['proponent-lead', 'assessment-admin', 'project-eao-staff', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin', 'public'],
	};

	// DEFAULT PROJECT
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
				'viewTombstone' : ['proponent-lead', 'assessment-admin', 'project-eao-staff', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'viewEAOTombstone' : ['assessment-admin', 'project-eao-staff', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'editTombstone' : ['assessment-admin', 'project-intake', 'assessment-lead', 'project-epd', 'project-system-admin'],
				'listArtifacts' : ['proponent-lead', 'assessment-admin', 'project-eao-staff', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'listValuedComponents' : ['public', 'proponent-lead', 'assessment-admin', 'project-eao-staff', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'listInspectionReports' : ['project-system-admin'],
				'listProjectConditions' : ['project-system-admin'],
				'listProjectComplaints' : ['project-system-admin'],
				'listProjectInvitations' : ['assessment-admin', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'listDocuments' : ['public', 'proponent-lead', 'assessment-admin', 'project-eao-staff', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'listCommentPeriods' : ['public', 'proponent-lead', 'assessment-admin', 'project-eao-staff', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'listEnforcements' : ['project-system-admin'],
				'listProjectUpdates' : ['project-system-admin'],
				'listProjectGroups' : ['project-system-admin'],
				'viewSchedule' : ['proponent-lead', 'assessment-admin', 'project-eao-staff', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'editSchedule' : ['assessment-admin', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'createArtifact' : ['proponent-lead', 'assessment-admin', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'createValuedComponent' : ['proponent-lead', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'createInspectionReport' : ['project-system-admin'],
				'createProjectCondition' : ['proponent-lead', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'createProjectComplaint' : ['project-system-admin'],
				'createProjectInvitation' : ['assessment-admin', 'project-intake', 'assessment-lead', 'project-epd', 'project-system-admin'],
				'createDocument' : ['assessment-admin', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'createCommentPeriod' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'createEnforcement' : ['project-system-admin'],
				'createProjectUpdate' : ['assessment-admin', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'createProjectGroup' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'read' : ['proponent-lead', 'assessment-admin', 'project-eao-staff', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'write' : ['assessment-admin', 'project-intake', 'assessment-lead', 'project-epd', 'project-system-admin'],
				'delete' : ['project-system-admin', 'project-intake'],
				'publish' : ['assessment-admin', 'assessment-lead', 'project-epd', 'project-system-admin'],
				'unPublish' : ['assessment-admin', 'assessment-lead', 'project-epd', 'project-system-admin'],
				'manageFolders' : ['project-system-admin'],
				'manageDocumentPermissions': ['project-system-admin']
			}
		}
	}));

	// ACTIVTIES AND UPDATES
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

	// ARTIFACTS
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
					'assessment-admin',
					'project-eao-staff',
					'project-intake',
					'assessment-lead',
					'assessment-team',
					'project-epd',
					'project-system-admin'
				],
				'write': [
					'proponent-lead',
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

	// COMMUNICATION
	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'communication',
		level: 'global',
		type: 'default-permissions',
		defaults: {
			roles: defaultRoles,
			permissions: {
				'read' : ['proponent-lead', 'assessment-admin', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'write' : ['assessment-admin', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'delete' : ['assessment-admin', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin']
			}
		}
	}));

	// CONDITIONS
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

	// DOCUMENTS
	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'document',
		level: 'global',
		type: 'default-permissions',
		defaults: {
			roles: defaultRoles,
			permissions: {
				'read' : ['assessment-admin', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'write' : ['assessment-admin', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'delete' : ['assessment-admin', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'publish' : ['assessment-admin', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'unPublish' : ['assessment-admin', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin']
			}
		}
	}));

	// COLLECTIONS
	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'collection',
		level: 'global',
		type: 'default-permissions',
		defaults: {
			roles: defaultRoles,
			permissions: {
				'read' : ['assessment-admin', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'write' : ['assessment-admin', 'project-system-admin'],
				'delete' : ['assessment-admin', 'project-system-admin'],
				'publish' : ['assessment-admin', 'project-system-admin'],
				'unPublish' : ['assessment-admin', 'project-system-admin']
			}
		}
	}));

	// COLLECTION DOCUMENTS
	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'collectiondocument',
		level: 'global',
		type: 'default-permissions',
		defaults: {
			roles: defaultRoles,
			permissions: {
				'read' : ['assessment-admin', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'write' : ['assessment-admin', 'project-system-admin'],
				'delete' : ['assessment-admin', 'project-system-admin'],
				'publish' : ['assessment-admin', 'project-system-admin'],
				'unPublish' : ['assessment-admin', 'project-system-admin']
			}
		}
	}));

	// PROJECT FOLDERS (DOCUMENTS)
	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'folder',
		level: 'global',
		type: 'default-permissions',
		defaults: {
			roles: defaultRoles,
			permissions: {
				'read' : ['assessment-admin', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'write' : ['assessment-admin', 'project-system-admin'],
				'delete' : ['assessment-admin', 'project-system-admin'],
				'publish' : ['assessment-admin', 'project-system-admin'],
				'unPublish' : ['assessment-admin', 'project-system-admin']
			}
		}
	}));

	// PROJECT GROUPS
	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'projectgroup',
		level: 'global',
		type: 'default-permissions',
		defaults: {
			roles: defaultRoles,
			permissions: {
				'read' : ['assessment-admin', 'project-eao-staff', 'project-intake', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'write' : ['assessment-admin', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'delete' : ['assessment-admin', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin']
			}
		}
	}));

	// INSPECTION REPORT
	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'inspectionreport',
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

	// INSPECTION REPORT DETAILS
	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'inspectionreportdetail',
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

	// COMMENT
	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'comment',
		level: 'global',
		type: 'default-permissions',
		defaults: {
			roles: defaultRoles,
			permissions: {
				'read' : ['proponent-lead', 'assessment-admin', 'project-eao-staff', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'write' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'delete' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'publish' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'unPublish' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin']
			}
		}
	}));

  // COMMENT PERIOD
	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'commentperiod',
		level: 'global',
		type: 'default-permissions',
		defaults: {
			roles: defaultRoles,
			permissions: {
				'read' : ['proponent-lead', 'assessment-admin', 'project-eao-staff', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'write' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'delete' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'publish' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'unPublish' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin']
			}
		}
	}));

	// COMPLAINTS
	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'complaint',
		level: 'global',
		type: 'default-permissions',
		defaults: {
			roles: defaultRoles,
			permissions: {
				'read' : ['project-system-admin'],
				'write' : ['project-system-admin'],
				'delete' : ['project-system-admin']
			}
		}
	}));

	// PROJECT CONDITIONS
	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'projectcondition',
		level: 'global',
		type: 'default-permissions',
		defaults: {
			roles: defaultRoles,
			permissions: {
				'read' : ['proponent-lead', 'assessment-admin', 'project-eao-staff', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'write' : ['proponent-lead', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'delete' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'publish' : ['assessment-lead', 'project-epd', 'project-system-admin'],
				'unPublish' : ['assessment-lead', 'project-epd', 'project-system-admin']
			}
		}
	}));

	// INSPECTION REPORTS
	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'ir',
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

	// VALUED COMPONENTS
	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'vc',
		level: 'global',
		type: 'default-permissions',
		defaults: {
			roles: defaultRoles,
			permissions: {
				'read' : ['proponent-lead', 'assessment-admin', 'project-eao-staff', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'write' : ['proponent-lead', 'assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'delete' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'publish' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin'],
				'unPublish' : ['assessment-lead', 'assessment-team', 'project-epd', 'project-system-admin']
			}
		}
	}));

  // DEFAULT APPLICATION PERMISSIONS
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
				'sysadmin': ['sysadmin', 'eao', 'proponent', 'project-intake', 'project-eao-staff']
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

	// APPLICATION
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
				'sysadmin': [
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
				],
				'eao': [
					//'listConditions',
					'listEmailTemplates',
					'listOrganizations',
					'listNews',
					'listRoles',
					'listTemplates',
					'listValuedComponents',
					'listContacts'
				],
				'proponent': [
					//'listConditions',
					'listEmailTemplates',
					'listOrganizations',
					'listNews',
					'listRoles',
					'listTemplates',
					'listValuedComponents',
					'listContacts'
				],
				'project-intake': ['createProject']
			}
		}
	}));

  // APPLICATION
	defaultsArray.push(new Defaults({
		context: 'application',
		resource: 'application',
		level: 'global',
		type: 'global-project-roles',
		defaults: {
			'roles' : ['project-intake', 'project-eao-staff']
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
