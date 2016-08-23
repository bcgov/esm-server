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
				addUsersToContext: ['eao-admin', 'intake', 'lead', 'epd'],
				createRole: ['intake'],
				managePermissions: ['eao-admin', 'intake', 'lead', 'epd'],
				manageRoles: ['eao-admin', 'intake', 'lead', 'epd'],
				listUsers: ['eao-admin', 'eao-member', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'associate-dmo', 'qa-officer', 'ce-lead', 'ce-officer'],
				viewTombstone: ['pro-admin', 'pro-member', 'pro-subconsultant', 'eao-admin', 'eao-member', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'minister', 'minister-office', 'associate-dmo', 'qa-officer', 'ce-lead', 'ce-officer', 'aboriginal-consultant', 'aboriginal-subconsultant', 'ceaa', 'working-group', 'technical-working-group', 'local-gov'],
				viewEAOTombstone: ['eao-admin', 'eao-member', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'minister', 'minister-office', 'associate-dmo', 'qa-officer', 'ce-lead', 'ce-officer'],
				editTombstone: ['eao-admin', 'intake', 'lead', 'team', 'epd'],
				listArtifacts: ['eao-admin', 'intake', 'lead', 'team'],
				createArtifact: ['intake', 'lead', 'team'],
				deleteArtifact: ['eao-admin'],
				listValuedComponents: ['pro-admin', 'pro-member', 'pro-subconsultant', 'eao-admin', 'eao-member', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'associate-dmo', 'qa-officer', 'ce-lead', 'ce-officer', 'aboriginal-consultant', 'aboriginal-subconsultant', 'ceaa', 'working-group', 'technical-working-group', 'local-gov'],
				createValuedComponent: ['pro-admin', 'pro-member', 'eao-admin', 'intake', 'lead', 'team', 'epd'],
				deleteValuedComponent: ['eao-admin'],
				publishValuedComponents: ['eao-admin', 'intake', 'lead', 'epd'],
				listInspectionReports: ['eao-admin', 'intake'],
				createInspectionReport: ['intake', 'qa-officer', 'ce-lead', 'ce-officer'],
				deleteInspectionReport: ['eao-admin'],
				publishInspectionReports: ['intake', 'qa-officer', 'ce-lead'],
				listProjectConditions: ['eao-admin', 'eao-member', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'qa-officer', 'ce-lead', 'ce-officer'],
				createProjectCondition: ['eao-admin', 'intake', 'lead', 'team', 'epd', 'qa-officer', 'ce-lead', 'ce-officer'],
				deleteProjectCondition: ['eao-admin'],
				publishConditions: ['eao-admin', 'intake', 'lead', 'epd', 'assistant-dm-office', 'associate-dm', 'associate-dmo'],
				listProjectComplaints: ['eao-admin', 'intake'],
				createProjectComplaint: ['intake'],
				deleteProjectComplaint: ['eao-admin'],
				listProjectInvitations: ['eao-admin', 'intake'],
				createProjectInvitation: ['eao-admin', 'intake', 'lead', 'team', 'epd'],
				deleteProjectInvitation: ['eao-admin'],
				listDocuments: ['pro-admin', 'pro-member', 'pro-subconsultant', 'eao-admin', 'eao-member', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'minister', 'minister-office', 'associate-dmo', 'qa-officer', 'ce-lead', 'ce-officer', 'aboriginal-consultant', 'aboriginal-subconsultant', 'ceaa', 'working-group', 'technical-working-group', 'local-gov'],
				uploadDocument: ['pro-admin', 'pro-member', 'eao-admin', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'qa-officer', 'ce-lead', 'ce-officer'],
				deleteDocument: ['eao-admin'],
				listCommentPeriods: ['pro-admin', 'pro-member', 'eao-admin', 'eao-member', 'intake', 'lead', 'team', 'epd'],
				createCommentPeriod: ['eao-admin', 'intake', 'lead', 'team', 'epd'],
				deleteCommentPeriod: ['eao-admin'],
				listEnforcements: ['eao-admin', 'intake', 'qa-officer', 'ce-lead', 'ce-officer'],
				createEnforcement: ['intake', 'qa-officer', 'ce-lead', 'ce-officer'],
				deleteEnforcement: ['eao-admin'],
				listProjectUpdates: ['eao-admin'],
				createProjectUpdate: ['eao-admin'],
				deleteProjectUpdate: ['eao-admin'],
				listProjectGroups: ['eao-admin'],
				createProjectGroup: ['eao-admin'],
				deleteProjectGroup: ['eao-admin'],
				viewSchedule: ['pro-admin', 'pro-member', 'pro-subconsultant', 'eao-admin', 'eao-member', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'minister', 'minister-office', 'associate-dmo', 'qa-officer', 'ce-lead', 'ce-officer', 'ceaa', 'working-group', 'technical-working-group', 'local-gov'],
				editSchedule: ['eao-admin', 'intake', 'lead', 'team', 'epd'],
				unPublish: ['eao-admin', 'intake', 'lead', 'epd'],
				publish: ['eao-admin', 'intake', 'lead'],
				delete: ['intake'],
				write: ['eao-admin', 'intake', 'lead', 'epd'],
				read: ['pro-admin', 'pro-member', 'pro-subconsultant', 'eao-admin', 'eao-member', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'minister', 'minister-office', 'associate-dmo', 'qa-officer', 'ce-lead', 'ce-officer', 'aboriginal-consultant', 'aboriginal-subconsultant', 'ceaa', 'working-group', 'technical-working-group', 'local-gov']
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
				delete: ['intake'],
				write: ['eao-admin', 'intake', 'lead', 'epd'],
				read: ['pro-admin', 'pro-member', 'pro-subconsultant', 'eao-admin', 'eao-member', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'minister', 'minister-office', 'associate-dmo', 'qa-officer', 'ce-lead', 'ce-officer', 'aboriginal-consultant', 'aboriginal-subconsultant', 'ceaa', 'working-group', 'technical-working-group', 'local-gov']
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
				'read': _.uniq(['eao-admin', 'intake', 'lead', 'team', 'intake', 'lead', 'team', 'eao-admin']),
				'write': _.uniq(['intake', 'lead', 'team']),
				'delete': _.uniq(['eao-admin'])
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
				'read': _.uniq(['eao-admin', 'intake', 'eao-admin', 'intake', 'lead', 'team', 'epd', 'eao-admin', 'eao-admin', 'eao-admin', 'eao-admin']),
				'write': _.uniq(['eao-admin', 'intake', 'lead', 'team', 'epd', 'eao-admin']),
				'delete': _.uniq(['eao-admin', 'eao-admin'])
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
				'publish': ['eao-admin', 'lead', 'epd'],
				'unPublish': ['eao-admin', 'lead', 'epd'],
				'read': _.uniq(['pro-admin', 'pro-member', 'pro-subconsultant', 'eao-admin', 'eao-member', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'minister', 'minister-office', 'associate-dmo', 'qa-officer', 'ce-lead', 'ce-officer', 'aboriginal-consultant', 'aboriginal-subconsultant', 'ceaa', 'working-group', 'technical-working-group', 'local-gov', 'pro-admin', 'pro-member', 'eao-admin', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'qa-officer', 'ce-lead', 'ce-officer', 'eao-admin']),
				'write': _.uniq(['pro-admin', 'pro-member', 'eao-admin', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'qa-officer', 'ce-lead', 'ce-officer']),
				'delete': _.uniq(['eao-admin'])
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
				'read': _.uniq(['eao-admin', 'eao-admin', 'eao-admin']),
				'write': _.uniq(['eao-admin']),
				'delete': _.uniq(['eao-admin'])
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
				'read': _.uniq(['eao-admin', 'intake', 'intake', 'qa-officer', 'ce-lead', 'ce-officer', 'eao-admin', 'intake', 'qa-officer', 'ce-lead']),
				'write': _.uniq(['intake', 'qa-officer', 'ce-lead', 'ce-officer', 'intake', 'qa-officer', 'ce-lead']),
				'delete': _.uniq(['eao-admin']),
				'publish': _.uniq(['intake', 'qa-officer', 'ce-lead']),
				'unPublish': _.uniq(['intake', 'qa-officer', 'ce-lead'])
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
				'read': _.uniq(['eao-admin', 'intake', 'intake', 'qa-officer', 'ce-lead', 'ce-officer', 'eao-admin', 'intake', 'qa-officer', 'ce-lead']),
				'write': _.uniq(['intake', 'qa-officer', 'ce-lead', 'ce-officer', 'intake', 'qa-officer', 'ce-lead']),
				'delete': _.uniq(['eao-admin']),
				'publish': _.uniq(['intake', 'qa-officer', 'ce-lead']),
				'unPublish': _.uniq(['intake', 'qa-officer', 'ce-lead'])
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
				'read': _.uniq(['pro-admin', 'pro-member', 'eao-admin', 'eao-member', 'intake', 'lead', 'team', 'epd', 'eao-admin', 'intake', 'lead', 'team', 'epd', 'eao-admin']),
				'write': _.uniq(['eao-admin', 'intake', 'lead', 'team', 'epd']),
				'delete': _.uniq(['eao-admin'])
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
				'modifyName': ['eao-admin', 'intake'],
				'modifyDescription': ['eao-admin', 'intake'],
				'read': _.uniq(['eao-admin', 'intake', 'intake', 'eao-admin']),
				'write': _.uniq(['intake']),
				'delete': _.uniq(['eao-admin'])
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
				'read': _.uniq(['eao-admin', 'eao-member', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'qa-officer', 'ce-lead', 'ce-officer', 'eao-admin', 'intake', 'lead', 'team', 'epd', 'qa-officer', 'ce-lead', 'ce-officer', 'eao-admin', 'eao-admin', 'intake', 'lead', 'epd', 'assistant-dm-office', 'associate-dm', 'associate-dmo']),
				'write': _.uniq(['eao-admin', 'intake', 'lead', 'team', 'epd', 'qa-officer', 'ce-lead', 'ce-officer', 'eao-admin', 'intake', 'lead', 'epd', 'assistant-dm-office', 'associate-dm', 'associate-dmo']),
				'delete': _.uniq(['eao-admin']),
				'publish': _.uniq(['eao-admin', 'intake', 'lead', 'epd', 'assistant-dm-office', 'associate-dm', 'associate-dmo']),
				'unPublish': _.uniq(['eao-admin', 'intake', 'lead', 'epd', 'assistant-dm-office', 'associate-dm', 'associate-dmo'])
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
				'read': _.uniq(['eao-admin', 'intake', 'intake', 'qa-officer', 'ce-lead', 'ce-officer', 'eao-admin', 'intake', 'qa-officer', 'ce-lead']),
				'write': _.uniq(['intake', 'qa-officer', 'ce-lead', 'ce-officer', 'intake', 'qa-officer', 'ce-lead']),
				'delete': _.uniq(['eao-admin']),
				'publish': _.uniq(['intake', 'qa-officer', 'ce-lead']),
				'unPublish': _.uniq(['intake', 'qa-officer', 'ce-lead'])
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
				'read': _.uniq(['pro-admin', 'pro-member', 'pro-subconsultant', 'eao-admin', 'eao-member', 'intake', 'lead', 'team', 'assistant-dm', 'epd', 'assistant-dm-office', 'associate-dm', 'associate-dmo', 'qa-officer', 'ce-lead', 'ce-officer', 'aboriginal-consultant', 'aboriginal-subconsultant', 'ceaa', 'working-group', 'technical-working-group', 'local-gov', 'pro-admin', 'pro-member', 'eao-admin', 'intake', 'lead', 'team', 'epd', 'eao-admin', 'eao-admin', 'intake', 'lead', 'epd']),
				'write': _.uniq(['pro-admin', 'pro-member', 'eao-admin', 'intake', 'lead', 'team', 'epd', 'eao-admin', 'intake', 'lead', 'epd']),
				'delete': _.uniq(['eao-admin']),
				'publish': _.uniq(['eao-admin', 'intake', 'lead', 'epd']),
				'unPublish': _.uniq(['eao-admin', 'intake', 'lead', 'epd'])
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

