'use strict';

var mongoose = require('mongoose');
var Defaults = mongoose.model('_Defaults');
var promise = require('promise');
var _ = require('lodash');

module.exports = function () {
	
	
	var defaultsArray = [];
	
	var defaultRoles = {
		'eao-admin': ['eao-admin', 'eao-member', 'eao-invitee', 'epd', 'intake', 'lead', 'team', 'assistant-dm', 'assistant-dm-office', 'associate-dm', 'associate-dmo', 'minister', 'minister-office', 'qa-officer', 'ce-lead', 'ce-officer', 'aboriginal-consultant', 'aboriginal-subconsultant', 'ceaa', 'local-gov', 'working-group', 'technical-working-group'],
		'pro-admin': ['pro-admin', 'pro-member', 'pro-subconsultant', 'pro-invitee']
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
				'viewSchedule': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
				'listEnforcements': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
				'editSchedule': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
				'listCommentPeriods': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
				'listDocuments': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
				'listProjectInvitations': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
				'listProjectComplaints': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
				'listProjectConditions': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
				'listInspectionReports': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
				'listValuedComponents': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
				'listArtifacts': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member', 'lead', 'epd'],
				'listUsers': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
				'viewEAOTombstone': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
				'uploadDocument': ['eao-admin', 'pro-admin', 'pro-member', 'lead', 'epd'],
				'createProjectInvitation': ['eao-admin', 'pro-admin', 'pro-member'],
				'createValuedComponent': ['eao-admin', 'lead', 'epd', 'pro-admin', 'pro-member'],
				'createArtifact': ['eao-admin', 'pro-admin', 'pro-member', 'lead', 'epd'],
				'editProject': ['eao-admin', 'lead', 'epd', 'intake'],
				'createEnforcement': ['eao-admin'],
				'createCommentPeriod': ['eao-admin', 'lead', 'epd'],
				'createProjectComplaint': ['eao-admin'],
				'createProjectCondition': ['eao-admin'],
				'createInspectionReport': ['eao-admin'],
				'publish': ['eao-admin'],
				'unPublish': ['eao-admin'],
				'createRole': ['eao-admin', 'lead', 'intake'],
				'manageRoles': ['eao-admin', 'lead', 'intake'],
				'managePermissions': ['eao-admin', 'lead', 'intake'],
				'addUsersToContext': ['eao-admin', 'lead', 'intake'],
				'read': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
				'write': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
				'delete': ['eao-admin']
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
				'read': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member', 'lead', 'epd'],
				'write': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member', 'lead', 'epd'],
				'delete': ['eao-admin']
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
				'modifyName': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
				'modifyDescription': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
				'setPermissions': ['eao-admin'],
				'read': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
				'write': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
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
				'read': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member', 'lead', 'epd'],
				'write': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member', 'lead', 'epd'],
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
			permissions: defaultPermissions
		}
	}));
	
	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'inspectionreportdetail',
		level: 'global',
		type: 'default-permissions',
		defaults: {
			roles: defaultRoles,
			permissions: defaultPermissions
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
				'read': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
				'write': ['eao-admin', 'lead', 'epd'],
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
				'read': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
				'write': ['eao-admin', 'lead', 'epd'],
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
				'read': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
				'write': ['eao-admin', 'eao-member', 'pro-admin', 'pro-member'],
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
			permissions: defaultPermissions
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
				'read': ['eao-admin', 'pro-member', 'pro-member'],
				'write': ['eao-admin', 'lead', 'epd'],
				'delete': ['eao-admin', 'lead', 'epd']
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
				'application:sysadmin': ['sysadmin', 'eao', 'proponent', 'eao-intake', 'invitee']
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
	
	var allProjectPermissions = [
		'viewSchedule',
		'editSchedule',
		'listEnforcements',
		'createEnforcement',
		'listCommentPeriods',
		'createCommentPeriod',
		'listDocuments',
		'uploadDocument',
		'listProjectInvitations',
		'createProjectInvitation',
		'listProjectComplaints',
		'createProjectComplaint',
		'listProjectConditions',
		'createProjectCondition',
		'listInspectionReports',
		'createInspectionReport',
		'listValuedComponents',
		'createValuedComponent',
		'listArtifacts',
		'createArtifact',
		'publish',
		'unPublish',
		'listUsers',
		'viewEAOTombstone',
		'editProject',
		'createRole',
		'manageRoles',
		'managePermissions',
		'addUsersToContext',
		'publishValuedComponents'
	];
	var readProjectPermissions = [
		'viewSchedule',
		'listEnforcements',
		'listCommentPeriods',
		'listDocuments',
		'listProjectInvitations',
		'listProjectComplaints',
		'listProjectConditions',
		'listInspectionReports',
		'listProjectRoles',
		'listValuedComponents',
		'listArtifacts',
		'listUsers'
	];
	defaultsArray.push(new Defaults({
		context: 'project',
		resource: 'project',
		level: 'global',
		type: 'rolePermissions',
		//
		// this goes owner, role, permissions
		//
		defaults: {
			'eao-admin': {
				'eao-admin': allProjectPermissions,
				'eao-member': readProjectPermissions,
				'eao-invitee': [],
				'epd': ['editProject', 'createCommentPeriod', 'publishValuedComponents', 'uploadDocument'],
				'intake': ['editProject', 'createRole', 'manageRoles', 'managePermissions', 'addUsersToContext'],
				'lead': ['editProject', 'createCommentPeriod', 'createRole', 'manageRoles', 'managePermissions', 'addUsersToContext', 'publishValuedComponents', 'uploadDocument'],
				'team': [],
				'assistant-dm': [],
				'assistant-dm-office': [],
				'associate-dm': [],
				'associate-dmo': [],
				'minister': [],
				'minister-office': [],
				'qa-officer': [],
				'ce-lead': [],
				'ce-officer': [],
				'aboriginal-consultant': [],
				'aboriginal-subconsultant': [],
				'ceaa': [],
				'local-gov': [],
				'working-group': [],
				'technical-working-group': [],
			},
			'pro-admin': {
				'pro-admin': readProjectPermissions.concat([
					'uploadDocument',
					'createProjectInvitation',
					'createValuedComponent',
					'createArtifact',
					'editProject'
				]),
				'pro-member': readProjectPermissions.concat([
					'uploadDocument',
					'createProjectInvitation',
					'createValuedComponent',
					'createArtifact',
					'editProject'
				]),
				'pro-subconsultant': [],
				'pro-invitee': []
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
				'eao-intake': ['createProject'],
				'invitee': [],
			}
		}
	}));
	
	//
	//
	//  Do the work...
	//  Delete all existing defaults first, then add in all the ones above.
	//
	//
	var step1 = new promise(function (resolve, reject) {
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
	});
	
	var step2 = _.forEach(defaultsArray, function (d) {
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
	});
	
	step1
	.then(function (data) {
		console.log('step1 done, start step 2...' + JSON.stringify(data));
		return promise.all(step2);
	})
	.then(function () {
		console.log('step2 done.');
		return 'done';
	});
};
