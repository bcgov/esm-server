'use strict';
var mongoose = require('mongoose');
var EmailTemplate = mongoose.model('EmailTemplate');
var promise = require('promise');
var _ = require('lodash');


module.exports = function () {
	var data = [];

	data.push(new EmailTemplate({
		"subject": "EAO Project Information & Collaboration - %PROJECT_NAME% Content Update Notice",
		"description": "",
		"name": "Update: Documents",
		"code": "update-documents",
		"group": "Update",
		"content": "<p>%PROJECT_URL% content has been updated.<br />Please review the following content:</p>\n<p>%RELATED_CONTENT%.</p>"
	}));

	data.push(new EmailTemplate({
		"subject": "EAO Project Information & Collaboration (EPIC)  - Invitation to project: %PROJECT_NAME%",
		"description": "",
		"name": "Invitation: EAO Staff",
		"code": "invitation-eao-staff",
		"group": "Invitation",
		"content": "<p>%TO_NAME%:</p>\n<p>You’ve been invited to the <strong>%PROJECT_NAME%</strong> project space by <a href=\"mailto:%CURRENT_USER_EMAIL%\">%CURRENT_USER_NAME%</a> - please click the link to accept the invitation: %INVITATION_URL%.</p>\n<p>If you have any questions or challenges, please contact <a href=\"mailto:EPICsupport.eao@gov.bc.ca\">EPICsupport.eao@gov.bc.ca</a>.</p>"
	}));

	data.push(new EmailTemplate({
		"subject": "EAO Project Information & Collaboration (EPIC)  - Invitation to project: %PROJECT_NAME%",
		"description": "",
		"name": "Invitation: First Nations",
		"code": "invitation-first-nations",
		"group": "Invitation",
		"content": "<p>Dear %TO_NAME%,</p>\n<p>This email represents your invitation to the <strong>EAO Project Information & Collaboration System</strong>, our shared digital space for collaborating on environmental assessment projects.</p>\n<p>In particular, you have been invited to participate on the <strong>%PROJECT_NAME%</strong> project by %CURRENT_USER_NAME% (%CURRENT_USER_EMAIL%).</p>\n<p>Please click the following link to accept the invitation to the project and join the rest of the team in this shared space: %INVITATION_URL%.</p>\n<p>If you have any questions or challenges, please contact <a href=\"mailto:EPICsupport.eao@gov.bc.ca\">EPICsupport.eao@gov.bc.ca</a>.</p>",
	}));

	data.push(new EmailTemplate({
		"subject": "EAO Project Information & Collaboration (EPIC)  - Invitation to project: %PROJECT_NAME%",
		"description": "",
		"name": "Invitation: Generic",
		"code": "invitation-generic",
		"group": "Invitation",
		"content": "<p>Dear %TO_NAME%,</p>\n<p>This email represents your invitation to the <strong>EAO Project Information & Collaboration System</strong>, our shared digital space for collaborating on environmental assessment projects.</p>\n<p>In particular, you have been invited to participate on the <strong>%PROJECT_NAME%</strong> project by %CURRENT_USER_NAME% (%CURRENT_USER_EMAIL%).</p>\n<p>Please click the following link to accept the invitation to the project and join the rest of the team in this shared space: %INVITATION_URL%.</p>\n<p>If you have any questions or challenges, please contact <a href=\"mailto:EPICsupport.eao@gov.bc.ca\">EPICsupport.eao@gov.bc.ca</a>.</p>",
	}));

	data.push(new EmailTemplate({
		"subject": "EAO Project Information & Collaboration (EPIC)  - Invitation to project: %PROJECT_NAME%",
		"description": "",
		"name": "Invitation: Proponent",
		"code": "invitation-proponent",
		"group": "Invitation",
		"content": "<p>Dear %TO_NAME%,</p>\n<p>This email represents your invitation to the <strong>EAO Project Information & Collaboration System</strong>, our shared digital space for collaborating on environmental assessment projects.</p>\n<p>As a project proponent, you have been invited to participate on the <strong>%PROJECT_NAME%</strong> project by %CURRENT_USER_NAME% (%CURRENT_USER_EMAIL%), with the accesses and permissions associated with your role.</p>\n<p>Please click the following link to accept the invitation to the project and join the rest of the team in this shared space: %INVITATION_URL%.</p>\n<p>If you have any questions or challenges, please contact <a href=\"mailto:EPICsupport.eao@gov.bc.ca\">EPICsupport.eao@gov.bc.ca</a>.</p>",
	}));

	data.push(new EmailTemplate({
		"subject": "EAO Project Information & Collaboration (EPIC)  - Invitation to project: %PROJECT_NAME%",
		"description": "",
		"name": "Invitation: Working Group",
		"code": "invitation-working-group",
		"group": "Invitation",
		"content": "<p>Dear %TO_NAME%,</p>\n<p>This email represents your invitation to the <strong>EAO Project Information & Collaboration System</strong>, our shared digital space for collaborating on environmental assessment projects.</p>\n<p>As a member of the Working Group assigned to the <strong>%PROJECT_NAME%</strong> project, you have been invited to participate on that project by %CURRENT_USER_NAME% (%CURRENT_USER_EMAIL%), with the accesses and permissions associated with your role.</p>\n<p>Please click the following link to accept the invitation to the project and join the rest of the team in this shared space: %INVITATION_URL%.</p>\n<p>If you have any questions or challenges, please contact <a href=\"mailto:EPICsupport.eao@gov.bc.ca\">EPICsupport.eao@gov.bc.ca</a>.</p>",
	}));

	console.log('Email template seeding starting...');
	return promise.all(data.map(function (d) {
		return new promise(function (resolve, reject) {
			// need to tweak the data for upserting...
			var upsertData = d.toObject();
			delete upsertData._id;
			// use case insensitive searches... more reliable.
			EmailTemplate.findOneAndUpdate({
				name: {$regex: new RegExp(d.name, "i")},
				code: {$regex: new RegExp(d.code, "i")},
				group: {$regex: new RegExp(d.group, "i")}
			}, upsertData, {upsert: true, 'new': true}, function (err, doc) {
				if (err) {
					console.log('Email Template upsert failed: ' + err.toString() + ': ' + JSON.stringify(d));
					reject(new Error(err));
				} else {
					//console.log('Email Template upsert completed');
					resolve(doc);
				}
			});
		});
	}))
		.then(function () {
			console.log('Email template seeding done.');
		});
};
