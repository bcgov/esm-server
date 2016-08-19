'use strict';

var mongoose = require('mongoose');
var Defaults = mongoose.model('_Defaults');
var promise = require('promise');
var _ = require('lodash');

module.exports = function () {


	var defaultsArray = [];

	var defaultRoles = {
		'eao-admin': ['eao-admin', 'eao-member', 'epd', 'intake', 'lead', 'team', 'assistant-dm', 'assistant-dm-office', 'associate-dm', 'associate-dmo', 'minister', 'minister-office', 'qa-officer', 'ce-lead', 'ce-officer', 'aboriginal-consultant', 'aboriginal-subconsultant', 'ceaa', 'local-gov', 'working-group', 'technical-working-group'],
		'pro-admin': ['pro-admin', 'pro-member', 'pro-subconsultant']
	};

	var defaultPermissions = {
		'setPermissions': ['eao-admin'],
		'read': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
		'write': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
		'delete': ['eao-admin']
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
				addUsersToContext: ['lead'],
				createRole: ['intake'],
				managePermissions: ['intake', 'lead'],
				manageRoles: ['intake', 'lead'],
				listUsers: ['eao-admin', 'eao-member', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'associate-dmo', 'qa-officer', 'ce-lead', 'ce-officer'],
				viewTombstone: ['pro-admin', 'pro-member', 'pro-subconsultant', 'eao-admin', 'eao-member', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'minister', 'minister-office', 'associate-dmo', 'qa-officer', 'ce-lead', 'ce-officer', 'aboriginal-consultant', 'aboriginal-subconsultant', 'ceaa', 'working-group', 'technical working group', 'local-gov'],
				viewEAOTombstone: ['eao-admin', 'eao-member', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'minister', 'minister-office', 'associate-dmo', 'qa-officer', 'ce-lead', 'ce-officer'],
				editTombstone: ['eao-admin', 'intake', 'lead', 'team', 'epd'],
				unPublish: ['intake'],
				publish: ['intake'],
				createArtifact: ['intake'],
				listArtifacts: ['intake'],
				deleteArtifact: ['eao-admin'],
				createValuedComponent: ['pro-admin', 'pro-member', 'eao-admin', 'eao-member', 'intake', 'lead', 'team', 'epd'],
				listValuedComponents: ['pro-admin', 'pro-member', 'pro-subconsultant', 'eao-admin', 'eao-member', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'associate-dmo', 'qa-officer', 'ce-lead', 'ce-officer', 'aboriginal-consultant', 'aboriginal-subconsultant', 'ceaa', 'working-group', 'technical working group', 'local-gov'],
				deleteValuedComponent: ['eao-admin'],
				publishValuedComponents: ['eao-admin', 'intake', 'lead', 'epd'],
				createInspectionReport: ['intake', 'qa-officer', 'ce-lead', 'ce-officer'],
				listInspectionReports: ['intake'],
				deleteInspectionReport: ['eao-admin'],
				publishInspectionReports: ['intake', 'qa-officer', 'ce-lead'],
				createProjectCondition: ['eao-admin', 'intake', 'lead', 'team', 'epd', 'qa-officer', 'ce-lead', 'ce-officer'],
				listProjectConditions: ['eao-member', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'qa-officer', 'ce-lead', 'ce-officer'],
				deleteProjectCondition: ['eao-admin'],
				publishConditions: ['eao-admin', 'eao-member', 'intake', 'lead', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'associate-dmo'],
				createProjectComplaint: ['intake'],
				listProjectComplaints: ['intake'],
				deleteProjectComplaint: ['eao-admin'],
				createProjectInvitation: ['eao-admin', 'intake', 'lead', 'team', 'epd'],
				listProjectInvitations: ['intake'],
				deleteProjectInvitation: ['eao-admin'],
				uploadDocument: ['pro-admin', 'pro-member', 'eao-admin', 'eao-member', 'intake', 'lead', 'team', 'epd', 'qa-officer', 'ce-lead', 'ce-officer'],
				listDocuments: ['pro-admin', 'pro-member', 'pro-subconsultant', 'eao-admin', 'eao-member', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'minister', 'minister-office', 'associate-dmo', 'qa-officer', 'ce-lead', 'ce-officer', 'aboriginal-consultant', 'aboriginal-subconsultant', 'ceaa', 'working-group', 'technical working group', 'local-gov'],
				deleteDocument: ['eao-admin'],
				createCommentPeriod: ['eao-admin', 'eao-member', 'intake', 'lead', 'team', 'epd'],
				listCommentPeriods: ['pro-admin', 'pro-member', 'pro-subconsultant', 'eao-admin', 'eao-member', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'minister', 'minister-office', 'associate-dmo', 'qa-officer', 'ce-lead', 'ce-officer', 'aboriginal-consultant', 'aboriginal-subconsultant', 'ceaa', 'working-group', 'technical working group', 'local-gov'],
				deleteCommentPeriod: ['eao-admin'],
				createEnforcement: ['intake', 'qa-officer', 'ce-lead', 'ce-officer'],
				listEnforcements: ['qa-officer', 'ce-lead', 'ce-officer'],
				deleteEnforcement: ['eao-admin'],
				editSchedule: ['eao-admin', 'intake', 'lead', 'team', 'epd'],
				viewSchedule: ['pro-admin', 'pro-member', 'pro-subconsultant', 'eao-admin', 'eao-member', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'minister', 'minister-office', 'associate-dmo', 'qa-officer', 'ce-lead', 'ce-officer', 'ceaa', 'working-group', 'technical working group', 'local-gov'],
				listProjectUpdates: ['eao-admin'],
				createProjectUpdates: ['eao-admin'],
				deleteProjectUpdates: ['eao-admin'],
				listProjectGroups: ['eao-admin'],
				createProjectGroups: ['eao-admin'],
				deleteProjectGroups: ['eao-admin'],
				delete: ['eao-admin', 'intake'],
				write: ['eao-admin', 'intake'],
				read: ['pro-admin', 'pro-member', 'pro-subconsultant', 'eao-admin', 'eao-member', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'minister', 'minister-office', 'associate-dmo', 'qa-officer', 'ce-lead', 'ce-officer', 'aboriginal-consultant', 'aboriginal-subconsultant', 'ceaa', 'working-group', 'technical working group', 'local-gov'],
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
			permissions: defaultPermissions
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
				'review': ['eao-admin'],
				'approve': ['eao-admin'],
				'executiveApprove': ['eao-admin'],
				'sendForReview': ['eao-admin'],
				'sendForApproval': ['eao-admin'],
				'sendForExecutiveApproval': ['eao-admin'],
				'sendForDecision': ['eao-admin'],
				'publish': ['eao-admin', 'lead', 'epd'],
				'unPublish': ['eao-admin', 'lead', 'epd'],
				'reject': ['eao-admin'],
				'setPermissions': ['eao-admin'],
				'read': ['intake'],
				'write': ['intake'],
				'delete': ['eao-admin']
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
				'read': ['eao-admin'],
				'write': ['eao-admin'],
				'delete': ['eao-admin']
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
				'modifyName': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
				'modifyDescription': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
				'setPermissions': ['eao-admin'],
				'read': ['eao-member', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'qa-officer', 'ce-lead', 'ce-officer'],
				'write': ['eao-admin', 'intake', 'lead', 'team', 'epd', 'qa-officer', 'ce-lead', 'ce-officer'],
				'delete': ['eao-admin']
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
				'download': ['eao-admin','eao-member','pro-admin', 'pro-member'],
				'uploadNewVersion': ['eao-admin', 'lead', 'epd'],
				'viewOldVersions': ['eao-admin', 'lead', 'epd'],
				'downloadOldVersions': ['eao-admin', 'lead', 'epd'],
				'setPermissions': ['eao-admin'],
				'publish': ['eao-admin', 'lead', 'epd'],
				'unPublish': ['eao-admin', 'lead', 'epd'],
				'read': ['pro-admin', 'pro-member', 'pro-subconsultant', 'eao-admin', 'eao-member', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'minister', 'minister-office', 'associate-dmo', 'qa-officer', 'ce-lead', 'ce-officer', 'aboriginal-consultant', 'aboriginal-subconsultant', 'ceaa', 'working-group', 'technical working group', 'local-gov'],
				'write': ['pro-admin', 'pro-member', 'eao-admin', 'eao-member', 'intake', 'lead', 'team', 'epd', 'qa-officer', 'ce-lead', 'ce-officer'],
				'delete': ['eao-admin']
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
				'read': ['eao-admin'],
				'write': ['eao-admin'],
				'delete': ['eao-admin']
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
				'setPermissions': ['eao-admin'],
				'publish': ['qa-officer', 'ce-lead'],
				'unPublish': ['qa-officer', 'ce-lead'],
				'read': ['intake'],
				'write': ['intake', 'qa-officer', 'ce-lead', 'ce-officer'],
				'delete': ['eao-admin']
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
				'setPermissions': ['eao-admin'],
				'publish': ['qa-officer', 'ce-lead'],
				'unPublish': ['qa-officer', 'ce-lead'],
				'read': ['intake'],
				'write': ['intake', 'qa-officer', 'ce-lead', 'ce-officer'],
				'delete': ['eao-admin']
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
				'setPermissions': ['eao-admin'],
				'read':  ['pro-admin', 'pro-member', 'pro-subconsultant', 'eao-admin', 'eao-member', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'minister', 'minister-office', 'associate-dmo', 'qa-officer', 'ce-lead', 'ce-officer', 'aboriginal-consultant', 'aboriginal-subconsultant', 'ceaa', 'working-group', 'technical working group', 'local-gov'],
				'write': ['eao-admin', 'eao-member', 'intake', 'lead', 'team', 'epd'],
				'delete': ['eao-admin']
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
				'setPermissions': ['eao-admin'],
				'read':  ['pro-admin', 'pro-member', 'pro-subconsultant', 'eao-admin', 'eao-member', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'minister', 'minister-office', 'associate-dmo', 'qa-officer', 'ce-lead', 'ce-officer', 'aboriginal-consultant', 'aboriginal-subconsultant', 'ceaa', 'working-group', 'technical working group', 'local-gov'],
				'write': ['eao-admin', 'eao-member', 'intake', 'lead', 'team', 'epd'],
				'delete': ['eao-admin']
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
				'modifyName': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
				'modifyDescription': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
				'setPermissions': ['eao-admin'],
				'read': ['intake'],
				'write': ['intake'],
				'delete': ['eao-admin']
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
				'setPermissions': ['eao-admin'],
				'read': ['eao-member', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'qa-officer', 'ce-lead', 'ce-officer'],
				'write': ['eao-admin', 'intake', 'lead', 'team', 'epd', 'qa-officer', 'ce-lead', 'ce-officer'],
				'delete': ['eao-admin']
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
				'setPermissions': ['eao-admin'],
				'publish': ['qa-officer', 'ce-lead'],
				'unPublish': ['qa-officer', 'ce-lead'],
				'read': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
				'write': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
				'delete': ['eao-admin']
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
				'publish': ['eao-admin', 'lead', 'epd'],
				'unPublish': ['eao-admin', 'lead', 'epd'],
				'setPermissions': ['eao-admin'],
				'read': ['pro-admin', 'pro-member', 'pro-subconsultant', 'eao-admin', 'eao-member', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'associate-dmo', 'qa-officer', 'ce-lead', 'ce-officer', 'aboriginal-consultant', 'aboriginal-subconsultant', 'ceaa', 'working-group', 'technical working group', 'local-gov'],
				'write': ['pro-admin', 'pro-member', 'eao-admin', 'eao-member', 'intake', 'lead', 'team', 'epd'],
				'delete': ['eao-admin']
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
				'application:sysadmin': ['sysadmin', 'eao', 'proponent', 'eao-intake']
			},
			permissions: {
				'viewConfiguration': ['sysadmin', 'proponent', 'eao'],
				'viewSchedule': ['sysadmin', 'proponent', 'eao'],
				'listConditions': ['sysadmin', 'proponent', 'eao'],
				'listEmailTemplates': ['sysadmin', 'proponent', 'eao'],
				'listOrganizations': ['sysadmin', 'proponent', 'eao'],
				'listNews': ['sysadmin', 'proponent', 'eao'],
				'listRoles': ['sysadmin', 'proponent', 'eao'],
				'listTemplates': ['sysadmin', 'proponent', 'eao'],
				'listTopics': ['sysadmin', 'proponent', 'eao'],
				'listUsers': ['sysadmin', 'proponent', 'eao'],
				'createProject': ['sysadmin', 'eao-intake'],
				'createCondition': ['sysadmin'],
				'createEmailTemplate': ['sysadmin'],
				'createOrganization': ['sysadmin'],
				'createNews': ['sysadmin'],
				'createRole': ['sysadmin'],
				'createTemplate': ['sysadmin'],
				'createTopic': ['sysadmin'],
				'createUser': ['sysadmin'],
				'import': ['sysadmin'],
				'editSchedule': ['sysadmin'],
				'manageRoles': ['sysadmin'],
				'managePermissions': ['sysadmin'],
				'addUsersToContext': ['sysadmin']
			}
		}
	}));

	var allApplicationPermissions = [
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
		'createNews',
		'createRole',
		'createTemplate',
		'createTopic',
		'createUser',
		'createProject',
		'import',
		'editSchedule',
		'manageRoles',
		'managePermissions',
		'addUsersToContext'
	];
	var readApplicationPermissions = [
		'viewConfiguration',
		'viewSchedule',
		'listConditions',
		'listEmailTemplates',
		'listOrganizations',
		'listNews',
		'listRoles',
		'listTemplates',
		'listTopics',
		'listUsers'
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
				'eao-intake': ['createProject']
			}
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

