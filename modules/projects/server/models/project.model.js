'use strict';
// =========================================================================
//
// Model for Project
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.schema.controller')
('Project', {
	__audit               : true,
	__access: [
		'addUsersToContext',
		'createRole',
		'manageRoles',
		'managePermissions',
		'listContacts',
		'viewTombstone',
		'viewEAOTombstone',
		'editTombstone',
		'listArtifacts',
		'listValuedComponents',
		'listInspectionReports',
		'listProjectConditions',
		'listProjectComplaints',
		'listProjectInvitations',
		'listDocuments',
		'listCommentPeriods',
		'listEnforcements',
		'listProjectUpdates',
		'listProjectGroups',
		'viewSchedule',
		'editSchedule',
		'createArtifact',
		'createValuedComponent',
		'createInspectionReport',
		'createProjectCondition',
		'createProjectComplaint',
		'createProjectInvitation',
		'createDocument',
		'createCommentPeriod',
		'createEnforcement',
		'createProjectUpdate',
		'createProjectGroup',
		'publish',
		'unPublish',
		'manageFolders',
		'manageDocumentPermissions'
	],
	__tracking            : true,
	__status              : ['Initiated', 'Submitted', 'In Progress', 'Certified', 'Not Certified', 'Decommissioned'],
	__codename            : 'unique',
	duration              : { type:Number, default: 90 },
	epicProjectID		  : { type:Number, default: 0, index:true},  // Used to relate ePIC imports
	shortName             : { type:String, default: '' },
	eacDecision		  	  : { type:String, default: '' },
	CEAALink		  	  : { type:String, default: '' },
	type                  : { type:String, default:'', index:true },
	sector                : { type:String, default:'' },  // This is actually sub-type now.
	region                : { type:String, default:'' },     // object id
	locSpatial            : { type:String, default:'' }, // incoming ePIC
	location              : { type:String, default:'' },
	provElecDist 		  : { type:String, default:'' },
	fedElecDist 		  : { type:String, default:'' },
	//
	// all the phases that make this project up, in order
	//
	phases                : [ { type:'ObjectId', ref:'Phase'} ],
	//
	// ancestry
	//
	stream                : { type:'ObjectId', ref:'Stream', index:true, default:null },
	//
	// the proponent and their orgCode, plus the primary contact for same
	//
	proponent             : { type:'ObjectId', ref:'Organization', index:true, default:null },
	orgCode               : { type:String, default: '' },
	primaryContact        : { type:'ObjectId', ref:'User', default:null },
	//
	// these are here as helpers for assigning things throughout the system
	//
	eaoMember             : { type:String, default: '' },
	proMember             : { type:String, default: '' },
	adminRole             : { type:String, default: '' },
	proponentAdminRole    : { type:String, default: '' },
	sectorRole            : { type:String, default: '' },
	eaoInviteeRole        : { type:String, default: '' },
	proponentInviteeRole  : { type:String, default: '' },
	substitution          : { type:Boolean, default:false },
	intake: {
		affectedFirstNations  : { type:String, default:'' },
		constructionjobs      : { type:String, default:'' },
		constructionjobsNotes : { type:String, default:'' },
		contactedCEAA         : { type:String, default:'' },
		contactedFirstNations : { type:String, default:'' },
		investment            : { type:String, default:'' },
		investmentNotes       : { type:String, default:'' },
		lifespan              : { type:String, default:'' },
		meetsCEAACriteria     : { type:String, default:'' },
		meetsrprcriteria      : { type:String, default:'' },
		operatingjobs         : { type:String, default:'' },
		operatingjobsNotes    : { type:String, default:'' },
		section7optin         : { type:String, default:'' }
	},
	isTermsAgreed : {type:Boolean, default:false},
	build         : { type:String, default:'' },
	//
	// location is a free form string entry
	//
	//
	// phase data is stored below, so these are merely keys into that data
	//
	currentPhase       : { type:'ObjectId', ref:'Phase', index:true },
	currentPhaseCode   : { type: String, default:'' },
	currentPhaseName   : { type: String, default:'' },
	overallProgress    : { type: Number, default:0 },
	lat                : { type: Number, default:'' },
	lon                : { type: Number, default:'' },
	dateCommentsOpen   : { type: Date, default: null },
	dateCommentsClosed : { type: Date, default: null },

	// OLD DATA
	responsibleEPD          : { type: String, default: '' },
	responsibleEPDPhone		: { type: String, default: '' },
	responsibleEPDEmail     : { type: String, default: '' },
	projectLead          	: { type: String, default: '' },
	projectLeadPhone        : { type: String, default: '' },
	projectLeadEmail        : { type: String, default: '' },
	projectAnalyst          : { type: String, default: '' },
	projectAssistant        : { type: String, default: '' },
	administrativeAssistant : { type: String, default: '' },
	CELead           		: { type: String, default: '' },
	CELeadPhone           	: { type: String, default: '' },
	CELeadEmail           	: { type: String, default: '' },
	teamNotes           	: { type: String, default: '' },

	// Migrated epic data wanting to be made available
	eaActive        : { type: String, default: '' },
	eaIssues        : { type: String, default: '' },
	eaNotes         : { type: String, default: '' },
	CEAAInvolvement : { type: String, default: '' },
	projectNotes    : { type: String, default: '' }, // Formal notes about the project

	// MEM data
	ownership            : { type: String, default: '' },
	memPermitID          : { type:String, default: '', index:true},  // Used to relate mem permitID on import
	commodity            : { type: String, default: '' },
	tailingsImpoundments : { type: String, default: '' },
	epicStream 			 : { type: String, default: '' },
	directoryStructure   : { type: Object, default: null }
});