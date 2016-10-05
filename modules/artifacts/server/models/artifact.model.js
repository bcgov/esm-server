'use strict';
// =========================================================================
//
// model for ProjectType
//
// =========================================================================
module.exports = require('../../../core/server/controllers/core.schema.controller')
('Artifact', {
		//
		// who did what when
		//
		__audit: true,
		//
		// who has access to this thing
		//
		__access	: [		// read / write / delete are automatic
			'publish',
			'unPublish'],
		//
		// what type of artifcat is this? i.e. project description, etc
		//
		artifactType: {type: 'ObjectId', ref: 'ArtifactType', index: true},
		originalPhaseName: {type: String, default: ''},
		typeCode: {type: String, default: '', index: true},
		subTypeCode: {type: String, default: '', index: true},
		subTypeName: {type: String, default: ''},
		//
		// a name for this artifact that is unique in the project and will be used
		// to group all the various versions of this artifact together over time
		//
		name: {type: String, default: ''},
		//
		// what stage is this particular example of the document at? and what
		// is the current version number? We will only edit the most current version
		//
		stage: {type: String, default: ''},
		heldStage: {type: String, default: ''},
		version: {type: String, default: ''},
		versionNumber: {type: Number, default: 0, index: true},
		//
		// the phase during which this was added or edited
		// the milestone this artifact is attached to
		// each actual activity that was created to service this artifact
		//
		project: {type: 'ObjectId', ref: 'Project'},
		phase: {type: 'ObjectId', ref: 'Phase'},
		milestone: {type: 'ObjectId', ref: 'Milestone'},
		stages: [{
			name: {type: String},
			activity: {type: 'ObjectId', ref: 'Activity'}
		}],
		//
		// if it is built fmor a template, here is that reference, plus its data
		// plus if there are documents attached to sections those are here too
		//
		isTemplate: {type: Boolean, default: false},
		isArtifactCollection: {type: Boolean, default: false},
		template: {type: 'ObjectId', ref: 'Template', default: null},
		templateData: {},
		sectionDocuments: [{
			sectionName: {type: String, default: ''},
			documents: [{type: 'ObjectId', ref: 'Document'}],
		}],
		//
		// if this is an uploaded document then here it is along with whatever
		// supporting documents there are
		//
		document: {type: 'ObjectId', ref: 'Document', default: null},
		supportingDocuments: [{type: 'ObjectId', ref: 'Document'}],
		additionalDocuments: [{type: 'ObjectId', ref: 'Document'}],
		internalDocuments: [{type: 'ObjectId', ref: 'Document'}],  // these should not be published...
		//
		// this artifact may be tagged with various vcs, these need to be copied
		// forward through all iterations
		//
		valuedComponents: [{type: 'ObjectId', ref: 'Vc'}],
		//
		// reviews, comments, public comments, acceptance / rejection comments
		//
		commentPeriods: [{type: 'ObjectId', ref: 'CommentPeriod'}],
		publicCommentPeriods: [{type: 'ObjectId', ref: 'CommentPeriod'}],
		reviewNotes: [{
			username: {type: String, default: ''},
			note: {type: String, default: ''},
			date: {type: Date, default: null}
		}],
		approvalNotes: [{
			username: {type: String, default: ''},
			note: {type: String, default: ''},
			date: {type: Date, default: null}
		}],
		decisionNotes: [{
			username: {type: String, default: ''},
			note: {type: String, default: ''},
			date: {type: Date, default: null}
		}],

		author: {
			type: String,
			default: null,
			enum: [null, 'Other', 'Public', 'Aboriginal Group', 'Proponent', 'EAO', 'Federal Government', 'Working Group', 'Local Government', 'CEAA']
		},
		shortDescription: {type: String, default: null},
		// Used to determine which stage the approval signature is pulled from the approving
		// users' profile
		signatureStage : {type: String, default: null}
	},
	{
		type: 1
	}
);


