'use strict';


var _ = require ('lodash');
var mongoose      = require('mongoose');
var Stream        = mongoose.model('Stream');
var PhaseBase     = mongoose.model('PhaseBase');
var MilestoneBase = mongoose.model('MilestoneBase');
var ActivityBase  = mongoose.model('ActivityBase');

var baseObjects = {
	activities: [
		{
		    "description" : "Announce Project",
		    "name" : "Announce Project",
		    "code" : "announce-project",
		    "tasks" : [],
		    "processCode" : "announce-project"
		 },
		{
		    "description" : "Approve AIR",
		    "name" : "Approve AIR",
		    "code" : "approve-air",
		    "tasks" : [],
		    "processCode" : "approve-air"
		},
		{
		    "description" : "Draft AIR",
		    "name" : "Draft AIR",
		    "code" : "draft-air",
		    "tasks" : [],
		    "processCode" : "draft-air"
		},
		{
		    "description" : "Engage Working Group",
		    "name" : "Engage Working Group",
		    "code" : "engage-working-group",
		    "tasks" : [],
		    "processCode" : "engage-working-group"
		},
		{
		    "description" : "Engage Working Group Configuration",
		    "name" : "Engage Working Group Configuration",
		    "code" : "engage-working-group-configuration",
		    "tasks" : [],
		    "processCode" : "engage-working-group-configuration"
		},
		{
		    "description" : "Federal Substitution",
		    "name" : "Federal Substitution",
		    "code" : "federal-substitution",
		    "tasks" : [],
		    "processCode" : "federal-substitution"
		},
		{
		    "description" : "First Nations Consultation Analysis",
		    "name" : "First Nations Consultation Analysis",
		    "code" : "first-nations-consultation-analysis",
		    "tasks" : [],
		    "processCode" : "fn-consultation-analysis",
		},
		{
		    "description" : "Populate Application (Workgroup)",
		    "name" : "Populate Application (Workgroup)",
		    "code" : "populate-application",
		    "tasks" : [],
		    "processCode" : "populate-application-wg"
		},
		{
		    "description" : "Populate Application (EAO)",
		    "name" : "Populate Application (EAO)",
		    "code" : "populate-application-eao",
		    "tasks" : [],
		    "processCode" : "populate-application-eao"
		},
		{
		    "description" : "Section 10(1)c",
		    "name" : "Section 10(1)c",
		    "code" : "section-10-1-c",
		    "tasks" : [],
		    "processCode" : "section-101-c"
		},
		{
		    "description" : "Section 11",
		    "name" : "Section 11",
		    "code" : "section-11",
		    "tasks" : [],
		    "processCode" : "section-11"
		},
		{
		    "description" : "Decision",
		    "name" : "Decision",
		    "code" : "decision",
		    "tasks" : [],
		    "processCode" : "decision"
		}
	],
	"milestones": [
		{
			"description": "Accept Draft Project Description",
			"name": "Accept Draft Project Description",
			"code": "accept-draft-project-desc",
		},
		{
			"description": "Project Space Initiated",
			"name": "Project Space Initiated",
			"code": "project-space-initiated",
		},
		{
			"description": "Project Description",
			"name": "Project Description",
			"code": "project-desc",
		},
		{
			"description": "Section 10.1.c",
			"name": "Section 10.1.c",
			"code": "section101c",
		},
		{
			"description": "Strength of Claim",
			"name": "Strength of Claim",
			"code": "strength-of-claim",
		},
		{
			"description": "Section 11",
			"name": "Section 11",
			"code": "section11",
		},
		{
			"description": "Value Component Document",
			"name": "Value Component Document",
			"code": "value-component-doc",
		},
		{
			"description": "Draft AIR",
			"name": "Draft AIR",
			"code": "draft-air",
		},
		{
			"description": "AIR",
			"name": "AIR",
			"code": "air",
		},
		{
			"description": "Draft Application",
			"name": "Draft Application",
			"code": "draft-application",
		},
		{
			"description": "Evaluation Decision",
			"name": "Evaluation Decision",
			"code": "evaluation-decision",
		},
		{
			"description": "Application",
			"name": "Application",
			"code": "application",
		},
		{
			"description": "Referral Package Sign-off",
			"name": "Referral Package Sign-off",
			"code": "referral-package-sign-off",
		},
		{
			"description": "Ministers' Decision",
			"name": "Ministers' Decision",
			"code": "ministers-decision",
		},
		{
			"description": "Substantially Started",
			"name": "Substantially Started",
			"code": "substantially-started",
		}
	],
	"phases": [
		{
			"description": "Pre-Application preparation",
			"name": "Pre-EA",
			"code": "preea",
		},
		{
			"description": "Pre-Application",
			"name": "Pre-Application",
			"code": "preap",
		},
		{
			"description": "EAO Evaluation",
			"name": "Evaluation",
			"code": "eval",
		},
		{
			"description": "EAO Review",
			"name": "Review",
			"code": "rev",
		},
		{
			"description": "Decision",
			"name": "Decision",
			"code": "dec",
		},
		{
			"description": "Post Certification Processes",
			"name": "Post-Certification",
			"code": "post",
		}
	],
};
var basePermissions = {
	read   : ['project:eao:member'],
	write  : ['project:eao:working-group'],
	submit : ['project:eao:admin'],
	watch  : ['project:eao:admin'],
};
var emptyStream = {
	code: 'stream-test-alpha',
	name: 'Test Stream Alpha',
	description: 'A test stream that has every possible child object.  To be used for testing project browsing',
	roles: ['project:eao:admin', 'project:eao:working-group', 'project:eao:member'],
	read: ['project:eao:working-group', 'project:eao:member'],
	submit: ['project:eao:admin']
};

module.exports = function (clear) {
	console.log ('Running configuration seeding');
	if (clear) {
		console.log ('\t removing existing configuration objects');
		Stream.remove ({}).exec();
		PhaseBase.remove ({}).exec();
		MilestoneBase.remove ({}).exec();
		ActivityBase.remove ({}).exec();
	}
	console.log ('\t adding phases');
	_.each (baseObjects.phases, function (o) {
		var m = new PhaseBase (_.extend ({},o,basePermissions));
		m.save ();
	});
	console.log ('\t adding milestones');
	_.each (baseObjects.milestones, function (o) {
		var m = new MilestoneBase (_.extend ({},o,basePermissions));
		m.save ();
	});
	console.log ('\t adding activities');
	_.each (baseObjects.activities, function (o) {
		var m = new ActivityBase (_.extend ({},o,basePermissions));
		m.save ();
	});
	console.log ('\t adding test stream');
	var s = new Stream (_.extend ({},emptyStream,basePermissions));
	s.save ();
};



