'use strict';


var _ = require ('lodash');
var mongoose      = require('mongoose');
var Stream        = mongoose.model('Stream');
var PhaseBase     = mongoose.model('PhaseBase');
var MilestoneBase = mongoose.model('MilestoneBase');
var ActivityBase  = mongoose.model('ActivityBase');
var Prom = require('promise');

var baseObjects = {
	activities: [{
		code: 'edit',
		name: 'Edit Artifact',
		description: 'Edit Artifact',
		state: 'p.artifact.edit'
	},{
		code: 'review',
		name: 'Review Artifact',
		description: 'Review Artifact',
		state: 'p.artifact.review'
	},{
		code: 'approve',
		name: 'Approve Artifact',
		description: 'Approve Artifact',
		state: 'p.artifact.approve'
	},{
		code: 'executive',
		name: 'Executive Approve Artifact',
		description: 'Executive Approve Artifact',
		state: 'p.artifact.executive'
	},{
		code: 'publish',
		name: 'Publish Artifact',
		description: 'Publish Artifact',
		state: 'p.artifact.publish'
	}],
	"milestones": [{
		code: 'new-project-initiated',
		name: 'New Project Initiated',
		description: 'New Project Initiated',
		artifactType: 'New Project Initiated'
	},{
		code: 'project-deemed-reviewable',
		name: 'Project Deemed Reviewable',
		description: 'Project Deemed Reviewable',
		artifactType: 'Project Deemed Reviewable'
	},{
		code: 'draft-project-description-submitted',
		name: 'Draft Project Description Submitted',
		description: 'Draft Project Description Submitted',
		artifactType: 'Draft Project Description Submitted'
	},{
		code: 'project-description',
		name: 'Project Description',
		description: 'Project Description',
		artifactType: 'Project Description'
	},{
		code: 'project-description-template',
		name: 'Project Description Template',
		description: 'Project Description Template',
		artifactType: 'Project Description Template'
	},{
		code: 'public-comment-period-on-project-description',
		name: 'Public Comment Period on Project Description',
		description: 'Public Comment Period on Project Description',
		artifactType: 'Public Comment Period on Project Description'
	},{
		code: 'section-10-1-a-order',
		name: 'Section 10(1)(a) Order',
		description: 'Section 10(1)(a) Order',
		artifactType: 'Section 10(1)(a) Order'
	},{
		code: 'section-10-1-b-order',
		name: 'Section 10(1)(b) Order',
		description: 'Section 10(1)(b) Order',
		artifactType: 'Section 10(1)(b) Order'
	},{
		code: 'section-10-1-b-fee',
		name: 'Section 10(1)(b) Fee',
		description: 'Section 10(1)(b) Fee',
		artifactType: 'Section 10(1)(b) Fee'
	},{
		code: 'section-10-1-c-order',
		name: 'Section 10(1)(c) Order',
		description: 'Section 10(1)(c) Order',
		artifactType: 'Section 10(1)(c) Order'
	},{
		code: 'section-15-order',
		name: 'Section 15 Order - s.14 variance',
		description: 'Section 15 Order - s.14 variance',
		artifactType: 'Section 15 Order - s.14 variance'
	},{
		code: 'section-14-order',
		name: 'Section 14 Order',
		description: 'Section 14 Order',
		artifactType: 'Section 14 Order'
	},{
		code: 'section-13-order',
		name: 'Section 13 Order - s.11 variance',
		description: 'Section 13 Order - s.11 variance',
		artifactType: 'Section 13 Order - s.11 variance'
	},{
		code: 'section-11-order',
		name: 'Section 11 Order',
		description: 'Section 11 Order',
		artifactType: 'Section 11 Order'
	},{
		code: 'section-7-3-order',
		name: 'Section 7(3) Order',
		description: 'Section 7(3) Order',
		artifactType: 'Section 7(3) Order'
	},{
		code: 'section-6-order',
		name: 'Section 6 Order',
		description: 'Section 6 Order',
		artifactType: 'Section 6 Order'
	},{
		code: 'section-31-1-order',
		name: 'Section 31(1) Order - Vary the Assessment Process',
		description: 'Section 31 Order - Vary the Assessment Process',
		artifactType: 'Section 31 Order - Vary the Assessment Process'
	},{
		code: 'valued-component',
		name: 'Valued Component',
		description: 'Valued Component',
		artifactType: 'Valued Component'
	},{
		code: 'valued-component-package',
		name: 'Valued Component Package',
		description: 'Valued Component Package',
		artifactType: 'Valued Component Package'
	},{
		code: 'section-11-schedule-a',
		name: 'Section 11 Schedule A',
		description: 'Section 11 Schedule A',
		artifactType: 'Section 11 Schedule A'
	},{
		code: 'section-34-order',
		name: 'Section 34 Order - Cease or Remedy Activity',
		description: 'Section 34 Order - Cease or Remedy Activity',
		artifactType: 'Section 34 Order - Cease or Remedy Activity'
	},{
		code: 'section-36-order',
		name: 'Section 36 Order',
		description: 'Section 36 Order',
		artifactType: 'Section 36 Order'
	},{
		code: 'section-36-schedule-a',
		name: 'Section 36 Schedule A',
		description: 'Section 36 Schedule A',
		artifactType: 'Section 36 Schedule A'
	},{
		code: 'section-36-schedule-b',
		name: 'Section 36 Schedule B',
		description: 'Section 36 Schedule B',
		artifactType: 'Section 36 Schedule B'
	},{
		code: 'inspection-report',
		name: 'Inspection Report',
		description: 'Inspection Report',
		artifactType: 'Inspection Report'
	},{
		code: 'environmental-assessment-certificate',
		name: 'Environmental Assessment Certificate',
		description: 'Environmental Assessment Certificate',
		artifactType: 'Environmental Assessment Certificate'
	},{
		code: 'assessment-suspension',
		name: 'Assessment Suspension - s.30.1',
		description: 'Assessment Suspension - s.30.1',
		artifactType: 'Assessment Suspension - s.30.1'
	},{
		code: 'project-termination',
		name: 'Project Termination - s.24.3',
		description: 'Project Termination - s.24.3',
		artifactType: 'Project Termination - s.24.3'
	},{
		code: 'vc-finalized-and-approved',
		name: 'VC Finalized and Approved',
		description: 'VC Finalized and Approved',
		artifactType: 'VC Finalized and Approved'
	},{
		code: 'pre-app-pcp-completed',
		name: 'Pre-App PCP Completed',
		description: 'Pre-App PCP Completed',
		artifactType: 'Pre-App PCP Completed'
	},{
		code: 'pre-app-open-house-completed',
		name: 'Pre-App Open House Completed',
		description: 'Pre-App Open House Completed',
		artifactType: 'Pre-App Open House Completed'
	},{
		code: 'application-review-pcp-completed',
		name: 'Review PCP Completed',
		description: 'Review PCP Completed',
		artifactType: 'Review PCP Completed'
	},{
		code: 'application-review-open-house-completed',
		name: 'Review Open House Completed',
		description: 'Review Open House Completed',
		artifactType: 'Review Open House Completed'
	},{
		code: 'draft-vc-ready-for-commenting',
		name: 'Draft VC Ready for Commenting',
		description: 'Draft VC Ready for Commenting',
		artifactType: 'Draft VC Ready for Commenting'
	},{
		code: 'working-group-formed',
		name: 'Working Group Formed',
		description: 'Working Group Formed',
		artifactType: 'Working Group Formed'
	},{
		code: 'announce-project',
		name: 'Announce Project',
		description: 'Announce Project',
		artifactType: 'Announce Project'
	},{
		code: 'time-limit-extension-s-24-4',
		name: 'Time Limit Extension - s.24.4',
		description: 'Time Limit Extension - s.24.4',
		artifactType: 'Time Limit Extension - s.24.4'
	},{
		code: 'time-limit-suspension-s-24-2',
		name: 'Time Limit Suspension - s.24.2',
		description: 'Time Limit Suspension - s.24.2',
		artifactType: 'Time Limit Suspension - s.24.2'
	},{
		code: 'time-limit-extension-s-30-2',
		name: 'Time Limit Extension - s.30.2',
		description: 'Time Limit Extension - s.30.2',
		artifactType: 'Time Limit Extension - s.30.2'
	},{
		code: 'ea-certificate-extension',
		name: 'EA Certificate Extension',
		description: 'EA Certificate Extension',
		artifactType: 'EA Certificate Extension'
	},{
		code: 'ea-certificate-extension-fee',
		name: 'EA Certificate Extension Fee',
		description: 'EA Certificate Extension Fee',
		artifactType: 'EA Certificate Extension Fee'
	},{
		code: 'ea-certificate-amendment',
		name: 'EA Certificate Amendment',
		description: 'EA Certificate Amendment',
		artifactType: 'EA Certificate Amendment'
	},{
		code: 'ea-certificate-amendment-fee',
		name: 'EA Certificate Amendment Fee',
		description: 'EA Certificate Amendment Fee',
		artifactType: 'EA Certificate Amendment Fee'
	},{
		code: 'ea-certificate-amendment-pcp-initiated',
		name: 'EA Certificate Amendment PCP Initiated',
		description: 'EA Certificate Amendment PCP Initiated',
		artifactType: 'EA Certificate Amendment PCP Initiated'
	},{
		code: 'ea-certificate-amendment-open-house-completed',
		name: 'EA Certificate Amendment Open House Completed',
		description: 'EA Certificate Amendment Open House Completed',
		artifactType: 'EA Certificate Amendment Open House Completed'
	},{
		code: 'ea-certificate-amendment-pcp-completed',
		name: 'EA Certificate Amendment PCP Completed',
		description: 'EA Certificate Amendment PCP Completed',
		artifactType: 'EA Certificate Amendment PCP Completed'
	},{
		code: 'ea-certificate-cancellation-s-37-1',
		name: 'EA Certificate Cancellation - s.37.1',
		description: 'EA Certificate Cancellation - s.37.1',
		artifactType: 'EA Certificate Cancellation - s.37.1'
	},{
		code: 'ea-certificate-expired-s-18-5',
		name: 'EA Certificate Expired - s.18.5',
		description: 'EA Certificate Expired - s.18.5',
		artifactType: 'EA Certificate Expired - s.18.5'
	},{
		code: 'ea-certificate-suspension-s-37-1',
		name: 'EA Certificate Suspension - s.37.1',
		description: 'EA Certificate Suspension - s.37.1',
		artifactType: 'EA Certificate Suspension - s.37.1'
	}],
	"phases": [
		{
			"description": "Intake",
			"name": "Intake",
			"code": "intake",
		},
		{
			"description": "Determination",
			"name": "Determination",
			"code": "determination",
		},
		{
			"description": "Scope",
			"name": "Scope",
			"code": "scope",
		},
		{
			"description": "EAO Evaluation",
			"name": "Evaluation",
			"code": "evaluation",
		},
		{
			"description": "Review",
			"name": "Review",
			"code": "review",
		},
		{
			"description": "Decision",
			"name": "Decision",
			"code": "decision",
		},
		{
			"description": "Post Certification Processes",
			"name": "Post-Certification",
			"code": "post-certification",
		},
		{
			"description": "Completed",
			"name": "Completed",
			"code": "completed",
		}
	],
	streams: [{
	code: '10-1-c',
	name: '10-1-c',
	description: 'This is the set of phases most commonly assigned to an assessment',
	phases: [
		"determination",
		"pre-application",
		"evaluation",
		"review",
		"decision",
		"post-certification"
	]

	}]
};
var basePermissions = {
	"default_pro_watch": ['admin'],
	"default_pro_submit": ['admin'],
	"default_pro_write": ['editor'],
	"default_pro_read": ['member'],
	"default_eao_watch": ['admin'],
	"default_eao_submit": ['admin'],
	"default_eao_write": ['editor'],
	"default_eao_read": ['member']
};

module.exports = function (clear) {
	return new Prom (function (resolve, reject) {
	console.log ('Running configuration seeding');
	var p;
	if (clear) {
		console.log ('\t removing existing configuration objects');
		p = Stream.remove ({}).exec()
		.then (PhaseBase.remove ({}).exec())
		.then (MilestoneBase.remove ({}).exec())
		.then (ActivityBase.remove ({}).exec());
	} else {
		p = Prom.resolve();
	}
	p.then (function () {
		console.log ('\t adding phases');
		return Prom.all (baseObjects.phases.map (function (o) {
			var m = new PhaseBase (_.extend ({},o,basePermissions));
			return m.save ();
		}));
	})
	.then (function () {
		console.log ('\t adding milestones');
		return Prom.all (baseObjects.milestones.map (function (o) {
			var m = new MilestoneBase (_.extend ({},o,basePermissions));
			return m.save ();
		}));
	})
	.then (function () {
		console.log ('\t adding activities');
		return Prom.all (baseObjects.activities.map (function (o) {
			var m = new ActivityBase (_.extend ({},o,basePermissions));
			return m.save ();
		}));
	})
	.then (function () {
		console.log ('\t adding streams');
		return Prom.all (baseObjects.streams.map (function (o) {
			var m = new Stream (_.extend ({},o,basePermissions));
			return m.save ();
		}));
	})
	.then (resolve, reject);
	});
};



