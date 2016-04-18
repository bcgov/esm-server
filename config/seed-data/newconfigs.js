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
	},{
		code: 'notify',
		name: 'Notify Artifact',
		description: 'Notify Artifact',
		state: 'p.artifact.notify'
	}],
	"milestones": [{
	    code: 'project-description',
	    name: 'Project Description',
	    description: 'Project Description',
	    artifactType: 'Project Description'
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
	    code: 'section-10-1-c-order',
	    name: 'Section 10(1)(c) Order',
	    description: 'Section 10(1)(c) Order',
	    artifactType: 'Section 10(1)(c) Order'
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
	    code: 'valued-component',
	    name: 'Valued Component',
	    description: 'Valued Component',
	    artifactType: 'Valued Component'
	},{
		code: 'schedule-a',
		name: 'Schedule A',
		description: 'Schedule A',
		artifactType: 'Schedule A'
	}],
	"phases": [
		{
			"description": "Pre-Submission",
			"name": "Pre-submission",
			"code": "pre-submission",
		},
		{
			"description": "Pre-Application Preparation",
			"name": "Pre-EA",
			"code": "pre-ea",
		},
		{
			"description": "Pre-Application",
			"name": "Pre-App",
			"code": "pre-app",
		},
		{
			"description": "EAO Evaluation",
			"name": "Evaluation",
			"code": "evaluation",
		},
		{
			"description": "Application Review",
			"name": "Application Review",
			"code": "application-review",
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
		"pre-ea",
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



