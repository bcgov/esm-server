'use strict';

var mongoose = require('mongoose');
var Defaults = mongoose.model('_Defaults');
var promise = require('promise');
var _ = require('lodash');

module.exports = function () {


	var defaultsArray = [];

	var defaultRoles = {
		'project-admin' : ['proponent-lead', 'proponent-team', 'project-mem-staff', 'project-mgr', 'mem-lead', 'mem-team', 'project-admin', 'public'],
		'proponent-lead' : ['project-mem-staff', 'project-mgr', 'mem-lead', 'mem-team', 'project-admin', 'public'],
		'project-mgr' : ['project-mem-staff', 'project-mgr', 'mem-lead', 'mem-team', 'project-admin', 'public'],
		'mem-lead' : ['project-mem-staff', 'project-mgr', 'mem-lead', 'mem-team', 'project-admin', 'public']
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
				'addUsersToContext' : ['project-mgr', 'mem-lead', 'project-admin'],
				'createRole' : ['project-admin'],
				'managePermissions' : ['project-admin'],
				'manageRoles' : ['project-mgr', 'mem-lead', 'project-admin'],
				'listContacts' : ['project-mgr', 'mem-lead', 'project-admin'],
				'viewTombstone' : ['proponent-lead', 'proponent-team', 'project-mem-staff', 'project-mgr', 'mem-lead', 'mem-team', 'project-admin'],
				'viewEAOTombstone' : ['project-mem-staff', 'project-mgr', 'mem-lead', 'mem-team', 'project-admin'],
				'editTombstone' : ['project-mgr', 'mem-lead', 'project-admin'],
				'listArtifacts' : ['proponent-lead', 'proponent-team', 'project-mem-staff', 'project-mgr', 'mem-lead', 'mem-team', 'project-admin'],
				'listValuedComponents' : ['public', 'proponent-lead', 'proponent-team', 'project-mem-staff', 'mem-lead', 'mem-team', 'project-technical-working-group', 'project-admin'],
				'listInspectionReports' : ['project-admin'],
				'listProjectConditions' : ['proponent-lead', 'proponent-team', 'project-mem-staff', 'mem-lead', 'mem-team', 'project-technical-working-group', 'project-admin'],
				'listProjectComplaints' : ['project-admin'],
				'listProjectInvitations' : ['project-mgr', 'mem-lead', 'project-admin'],
				'listDocuments' : ['public', 'proponent-lead', 'proponent-team', 'project-mem-staff', 'project-mgr', 'mem-lead', 'mem-team', 'project-admin'],
				'listCommentPeriods' : ['public', 'proponent-lead', 'proponent-team', 'project-mem-staff', 'mem-lead', 'mem-team', 'project-technical-working-group', 'project-admin'],
				'listEnforcements' : ['project-admin'],
				'listProjectUpdates' : ['mem-lead', 'mem-team', 'project-admin'],
				'listProjectGroups' : ['project-mem-staff', 'mem-lead', 'mem-team', 'project-admin'],
				'viewSchedule' : ['proponent-lead', 'proponent-team', 'project-mem-staff', 'project-mgr', 'mem-lead', 'mem-team', 'project-technical-working-group', 'project-admin'],
				'editSchedule' : ['project-mgr', 'mem-lead', 'mem-team', 'project-admin'],
				'createArtifact' : ['proponent-lead', 'project-mgr', 'mem-lead', 'mem-team', 'project-admin'],
				'createValuedComponent' : ['proponent-lead', 'proponent-team', 'mem-lead', 'mem-team', 'project-admin'],
				'createInspectionReport' : ['project-admin'],
				'createProjectCondition' : ['proponent-lead', 'proponent-team', 'mem-lead', 'mem-team', 'project-admin'],
				'createProjectComplaint' : ['project-admin'],
				'createProjectInvitation' : ['project-mgr', 'mem-lead', 'project-admin'],
				'createDocument' : ['proponent-lead', 'project-mgr', 'mem-lead', 'mem-team', 'project-technical-working-group', 'project-admin'],
				'createCommentPeriod' : ['mem-lead', 'mem-team', 'project-admin'],
				'createEnforcement' : ['project-admin'],
				'createProjectUpdate' : ['mem-lead', 'mem-team', 'project-admin'],
				'createProjectGroup' : ['mem-lead', 'mem-team', 'project-admin'],
				'read' : ['proponent-lead', 'proponent-team', 'project-mem-staff', 'project-mgr', 'mem-lead', 'mem-team', 'project-technical-working-group', 'project-admin'],
				'write' : ['project-mgr', 'mem-lead', 'mem-team', 'project-admin'],
				'delete' : ['project-admin', 'project-mgr'],
				'publish' : ['mem-lead', 'project-admin'],
				'unPublish' : ['mem-lead', 'project-admin']
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
				'read' : ['project-admin'],
				'write' : ['project-admin'],
				'delete' : ['project-admin'],
				'publish' : ['project-admin'],
				'unPublish' : ['project-admin']
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
				'read' : ['proponent-lead', 'proponent-team', 'project-mem-staff', 'project-mgr', 'mem-lead', 'mem-team', 'project-admin'],
				'write' : ['proponent-lead', 'proponent-team', 'project-mgr', 'mem-lead', 'mem-team', 'project-admin'],
				'delete' : ['project-mgr', 'mem-lead', 'mem-team', 'project-admin'],
				'publish' : ['mem-lead', 'project-mgr', 'project-admin'],
				'unPublish' : ['mem-lead', 'project-mgr', 'project-admin']
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
				'read' : ['proponent-lead', 'proponent-team', 'project-mgr', 'mem-lead', 'mem-team', 'project-admin'],
				'write' : ['project-mgr', 'mem-lead', 'mem-team', 'project-admin'],
				'delete' : ['mem-lead', 'mem-team', 'project-admin']
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
				'read' : ['proponent-lead', 'proponent-team', 'project-mem-staff', 'project-mgr', 'mem-lead', 'mem-team', 'project-admin'],
				'write' : ['proponent-lead', 'proponent-team', 'project-mgr', 'mem-lead', 'mem-team', 'project-admin'],
				'delete' : ['project-mgr', 'mem-lead', 'mem-team', 'project-admin']
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
				'read' : ['project-mem-staff', 'project-mgr', 'mem-lead', 'mem-team', 'project-admin'],
				'write' : ['mem-lead', 'mem-team', 'project-admin'],
				'delete' : ['mem-lead', 'mem-team', 'project-admin']
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
				'read' : ['project-admin'],
				'write' : ['project-admin'],
				'delete' : ['project-admin'],
				'publish' : ['project-admin'],
				'unPublish' : ['project-admin']
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
				'read' : ['project-admin'],
				'write' : ['project-admin'],
				'delete' : ['project-admin'],
				'publish' : ['project-admin'],
				'unPublish' : ['project-admin']
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
				'read' : ['proponent-lead', 'proponent-team', 'project-mem-staff', 'mem-lead', 'mem-team', 'project-technical-working-group', 'project-admin'],
				'write' : ['mem-lead', 'mem-team', 'project-technical-working-group', 'project-admin'],
				'delete' : ['mem-lead', 'mem-team', 'project-admin'],
				'publish' : ['mem-lead', 'mem-team', 'project-admin'],
				'unPublish' : ['mem-lead', 'mem-team', 'project-admin']
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
				'read' : ['proponent-lead', 'proponent-team', 'project-mem-staff', 'mem-lead', 'mem-team', 'project-technical-working-group', 'project-admin'],
				'write' : ['mem-lead', 'mem-team', 'project-admin'],
				'delete' : ['mem-lead', 'mem-team', 'project-admin'],
				'publish' : ['mem-lead', 'mem-team', 'project-admin'],
				'unPublish' : ['mem-lead', 'mem-team', 'project-admin']
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
				'read' : ['project-admin'],
				'write' : ['project-admin'],
				'delete' : ['project-admin']
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
				'read' : ['proponent-lead', 'proponent-team', 'project-mem-staff', 'mem-lead', 'mem-team', 'project-technical-working-group', 'project-admin'],
				'write' : ['proponent-lead', 'proponent-team', 'mem-lead', 'mem-team', 'project-admin'],
				'delete' : ['mem-lead', 'mem-team', 'project-admin'],
				'publish' : ['mem-lead', 'project-admin'],
				'unPublish' : ['mem-lead', 'project-admin']
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
				'read' : ['project-admin'],
				'write' : ['project-admin'],
				'delete' : ['project-admin'],
				'publish' : ['project-admin'],
				'unPublish' : ['project-admin']
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
				'read' : ['proponent-lead', 'proponent-team', 'project-mem-staff', 'mem-lead', 'mem-team', 'project-technical-working-group', 'project-admin'],
				'write' : ['proponent-lead', 'proponent-team', 'mem-lead', 'mem-team', 'project-admin'],
				'delete' : ['mem-lead', 'mem-team', 'project-admin'],
				'publish' : ['mem-lead', 'mem-team', 'project-admin'],
				'unPublish' : ['mem-lead', 'mem-team', 'project-admin']
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
				'sysadmin': ['sysadmin', 'mem', 'proponent', 'project-mgr', 'project-mem-staff']
			},
			permissions: {
				'listConditions': ['sysadmin'],
				'listEmailTemplates': ['sysadmin'],
				'listOrganizations': ['sysadmin'],
				'listNews': ['sysadmin'],
				'listRoles': ['sysadmin'],
				'listTemplates': ['sysadmin'],
				'listValuedComponents': ['sysadmin'],
				'listContacts': ['sysadmin'],
				'createProject': ['sysadmin', 'project-mgr'],
				'createCondition': ['sysadmin'],
				'createEmailTemplate': ['sysadmin'],
				'createOrganization': ['sysadmin'],
				'createNews': ['sysadmin'],
				'createRole': [], // jsherman - 2016-09-01 - don't want anyone to create new system level roles at this time. locking down roles and permissions so we don't have to worry about adding new defaults to a new role.
				'createTemplate': ['sysadmin'],
				'createValuedComponent': ['sysadmin'],
				'createContact': ['sysadmin'],
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
				'mem': [],
				'proponent': [],
				'project-mgr': ['createProject'],
				'project-mem-staff': []
			}
		}
	}));

	defaultsArray.push(new Defaults({
		context: 'application',
		resource: 'application',
		level: 'global',
		type: 'global-project-roles',
		defaults: {
			'roles' : ['project-mgr', 'project-mem-staff']
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

