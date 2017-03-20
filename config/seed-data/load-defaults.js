'use strict';

var mongoose = require('mongoose');
var Defaults = mongoose.model('_Defaults');
var promise = require('promise');
var _ = require('lodash');

module.exports = function () {


	var defaultsArray = [];

	var defaultRoles = {
		'sysadmin' : ['proponent-lead', 'project-lead'],
		'project-lead' : ['public', 'proponent-lead', 'project-lead']
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
				'addUsersToContext' : ['sysadmin', 'project-lead'],
				'createRole' : ['sysadmin'],
				'managePermissions' : ['sysadmin'],
				'manageRoles' : ['sysadmin'],
				'listContacts' : ['sysadmin'],
				'viewTombstone' : ['sysadmin'],
				'viewEAOTombstone' : ['sysadmin'],
				'editTombstone' : ['sysadmin'],
				'listArtifacts' : ['sysadmin'],
				'listValuedComponents' : ['public', 'sysadmin'],
				'listComplianceOversight' : ['sysadmin'],
				'listProjectConditions' : ['sysadmin', 'team', 'exec', 'project-lead'],
				'listProjectComplaints' : ['sysadmin'],
				'listProjectInvitations' : ['sysadmin', 'team', 'project-lead'],
				'listDocuments' : ['public', 'sysadmin'],
				'listCommentPeriods' : ['public', 'sysadmin'],
				'listEnforcements' : ['sysadmin'],
				'listProjectUpdates' : ['sysadmin'],
				'listProjectGroups' : ['sysadmin'],
				'viewSchedule' : ['sysadmin'],
				'editSchedule' : ['sysadmin'],
				'createArtifact' : ['sysadmin'],
				'createValuedComponent' : ['sysadmin'],
				'createComplianceOversight' : ['sysadmin'],
				'createProjectCondition' : ['sysadmin', 'team'],
				'createProjectComplaint' : ['sysadmin'],
				'createProjectInvitation' : ['sysadmin', 'team', 'project-lead'],
				'createDocument' : ['sysadmin', 'team', 'proponent-lead', 'project-lead'],
				'createCommentPeriod' : ['sysadmin'],
				'createProjectUpdate' : ['sysadmin'],
				'createProjectGroup' : ['sysadmin'],
				'read' : ['sysadmin', 'team', 'exec', 'project-lead'],
				'write' : ['sysadmin', 'team', 'project-lead'],
				'delete' : ['sysadmin', 'project-lead'],
				'publish' : ['sysadmin', 'project-lead'],
				'unPublish' : ['sysadmin'],
				'manageFolders' : ['sysadmin']
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
				'read' : ['sysadmin', 'team', 'proponent-lead', 'project-lead'],
				'write' : ['sysadmin'],
				'delete' : ['sysadmin'],
				'publish' : ['sysadmin'],
				'unPublish' : ['sysadmin']
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
				'read' : ['sysadmin'],
				'write' : ['sysadmin'],
				'delete' : ['sysadmin'],
				'publish' : ['sysadmin'],
				'unPublish' : ['sysadmin']
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
				'read' : ['sysadmin'],
				'write' : ['sysadmin'],
				'delete' : ['sysadmin'],
				'publish' : ['sysadmin'],
				'unPublish' : ['sysadmin']
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
				'read' : ['sysadmin', 'team', 'project-lead'],
				'write' : ['sysadmin', 'team', 'project-lead'],
				'delete' : ['sysadmin', 'team', 'project-lead']
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
				'read' : ['sysadmin', 'team', 'exec', 'project-lead'],
				'write' : ['sysadmin', 'team'],
				'delete' : ['sysadmin']
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
				'read' : ['sysadmin', 'team', 'exec', 'project-lead'],
				'write' : ['sysadmin', 'team', 'project-lead'],
				'delete' : ['sysadmin', 'project-lead'],
				'publish' : ['sysadmin', 'project-lead'],
				'unPublish' : ['sysadmin']
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
				'read' : ['sysadmin'],
				'write' : ['sysadmin'],
				'delete' : ['sysadmin']
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
				'read' : ['sysadmin'],
				'write' : ['sysadmin'],
				'delete' : ['sysadmin'],
				'publish' : ['sysadmin'],
				'unPublish' : ['sysadmin']
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
				'read' : ['sysadmin'],
				'write' : ['sysadmin'],
				'delete' : ['sysadmin'],
				'publish' : ['sysadmin'],
				'unPublish' : ['sysadmin']
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
				'read' : ['sysadmin'],
				'write' : ['sysadmin'],
				'delete' : ['sysadmin'],
				'publish' : ['sysadmin'],
				'unPublish' : ['sysadmin']
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
				'read' : ['sysadmin'],
				'write' : ['sysadmin'],
				'delete' : ['sysadmin'],
				'publish' : ['sysadmin'],
				'unPublish' : ['sysadmin']
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
				'read' : ['sysadmin'],
				'write' : ['sysadmin'],
				'delete' : ['sysadmin']
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
				'read' : ['sysadmin'],
				'write' : ['sysadmin'],
				'delete' : ['sysadmin'],
				'publish' : ['sysadmin'],
				'unPublish' : ['sysadmin']
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
				'read' : ['sysadmin'],
				'write' : ['sysadmin'],
				'delete' : ['sysadmin'],
				'publish' : ['sysadmin'],
				'unPublish' : ['sysadmin']
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
				'read' : ['sysadmin'],
				'write' : ['sysadmin'],
				'delete' : ['sysadmin'],
				'publish' : ['sysadmin'],
				'unPublish' : ['sysadmin']
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
				'sysadmin': ['sysadmin', 'team', 'exec']
			},
			permissions: {
				'listConditions': ['sysadmin', 'team', 'exec'],
				'listEmailTemplates': ['sysadmin'],
				'listOrganizations': ['sysadmin'],
				'listNews': ['sysadmin'],
				'listRoles': ['sysadmin'],
				'listTemplates': ['sysadmin'],
				'listValuedComponents': ['sysadmin'],
				'listContacts': ['sysadmin', 'team'],
				'createProject': ['sysadmin', 'team'],
				'createCondition': ['sysadmin', 'team'],
				'createEmailTemplate': ['sysadmin'],
				'createOrganization': ['sysadmin'],
				'createNews': ['sysadmin'],
				'createRole': [], // jsherman - 2016-09-01 - don't want anyone to create new system level roles at this time. locking down roles and permissions so we don't have to worry about adding new defaults to a new role.
				'createTemplate': ['sysadmin'],
				'createValuedComponent': ['sysadmin'],
				'createContact': ['sysadmin', 'team'],
				'editContact': ['sysadmin', 'team'],
				'deleteContact': ['sysadmin'],
				'manageRoles': ['sysadmin'],
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
				'team': ['listConditions', 'createCondition', 'createProject', 'listContacts', 'createContact', 'editContact'],
				'exec': ['listConditions']
			}
		}
	}));

	defaultsArray.push(new Defaults({
		context: 'application',
		resource: 'application',
		level: 'global',
		type: 'global-project-roles',
		defaults: {
			'roles' : ['sysadmin', 'team', 'exec']
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

