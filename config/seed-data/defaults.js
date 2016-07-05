'use strict';

var mongoose = require('mongoose');
var Defaults    = mongoose.model('_Defaults');
var Prom = require('promise');

module.exports = function () {
	Defaults.find({}).remove ();
	return new Prom (function (resolve, reject) {
		var promiseArray = [];
		console.log ('Seeding defaults');
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
			'listProjectRoles',
			'createProjectRole',
			'listValuedComponents',
			'createValuedComponent',
			'listArtifacts',
			'createArtifact',
			'publish',
			'unPublish',
			'listUsers',
			'viewEAOTombstone',
			'editProject'
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
		promiseArray.push ((new Defaults ({
			context  : 'project',
			resource : 'project',
			level    : 'global',
			type     : 'rolePermissions',
			//
			// this goes owner, role, permissions
			//
			defaults : {
				'eao-admin' : {
					'eao-admin' : allProjectPermissions,
					'eao-member' : readProjectPermissions,
					'eao-invitee' : [],
					'epd' : [],
					'intake' : [],
					'lead' : [],
					'team' : [],
					'assistant-dm' : [],
					'assistant-dm-office' : [],
					'associate-dm' : [],
					'associate-dmo' : [],
					'minister' : [],
					'minister-office' : [],
					'qa-officer' : [],
					'ce-lead' : [],
					'ce-officer' : [],
					'aboriginal-consultant' : [],
					'aboriginal-subconsultant' : [],
					'ceaa' : [],
					'local-gov' : [],
					'working-group' : [],
					'technical-working-group' : [],
				},
				'pro-admin' : {
					'pro-admin' : readProjectPermissions.concat ([
						'uploadDocument',
						'createProjectInvitation',
						'createProjectRole',
						'createValuedComponent',
						'createArtifact',
						'editProject'
					]),
					'pro-member' : readProjectPermissions.concat ([
						'uploadDocument',
						'createProjectInvitation',
						'createProjectRole',
						'createValuedComponent',
						'createArtifact',
						'editProject'
					]),
					'pro-subconsultant' : [],
					'pro-invitee' : []
				}
			}
		})).save ());
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

		promiseArray.push ((new Defaults ({
			context  : 'application',
			resource : 'application',
			level    : 'global',
			type     : 'rolePermissions',
			//
			// this goes owner, role, permissions
			//
			defaults : {
				'application:sysadmin' : {
					'sysadmin' : allApplicationPermissions,
					'eao' : readApplicationPermissions,
					'proponent' : readApplicationPermissions.concat (['createProject']),
					'invitee': [],
				}
			}
		})).save ());
	});
};
