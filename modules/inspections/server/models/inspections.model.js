'use strict';
// =========================================================================
//
// Model for ComplianceOversight
//
// =========================================================================
module.exports = require('../../../core/server/controllers/core.schema.controller')
('Inspection', {
	projectId: {type: String, default: ''},
	projectCode: {type: String, default: ''},
	orgCode: {type: String, default: ''},
	inspectionName: {type: String, default: ''},
	inspectionNum: {type: String, default: ''},
	inspectionDate: {type: Date, default: Date.now},
	inspectorInitials: {type: String, default: ''},
	inspectionSummary: {type: String, default: ''},
	recentFollowUp: {type: String, default: ''},
	inspectionDocumentName: {type: String, default: ''},
	inspectionDocumentURL: {type: String, default: ''},
	followUpDocumentNames: [{name: String, ref: String}],
	followUpDocumentUrls: [{name: String, ref: String}],
	authorizationID: {type: String, default: ''}
});


/* Original EPIC stuff follows*/
// __audit       : true,
// __access      : [],
// __codename    : true,
// status								: { type: String, default:'' },
// certificateNum						: { type: String, default:'' },
// region								: { type: String, default:'' },
// office								: { type: String, default:'' },
// trigger								: { type: String, default:'' },
// inspectors							: { type: String, default:'' },
// sector								: { type: String, default:'' },
// utm									: { type: String, default:'' },
// locationDescription					: { type: String, default:'' },
// nonCompliantIncidences				: { type: String, default:'' },
// nonComplianceDecisionMatrixLevel	: { type: String, default:'' },
// nonComplianceDecisionMatrixCategory	: { type: String, default:'' },
// certificateOrAct					: { type: String, default:'' },
// activity							: { type: String, default:'' },
// response							: { type: String, default:'' },
// certificateHolderName				: { type: String, default:'' },
// certificateHolderContacts			: { type: String, default:'' },
// inAttendance						: { type: String, default:'' },
// address1							: { type: String, default:'' },
// address2							: { type: String, default:'' },
// city								: { type: String, default:'' },
// province							: { type: String, default:'' },
// postal								: { type: String, default:'' },
// phone								: { type: String, default:'' },
// fax									: { type: String, default:'' },
// contactEmail						: { type: String, default:'' },
// inspectionDetails					: [ {type: 'ObjectId', ref: 'Inspectionreportdetail' }],
// actionsAndComments					: { type: String, default:'' },
// signature							: { type: String, default:'' },
// dateSigned							: { type: Date, default: Date.now },
// enclosuresAndDescription			: { type: String, default:'' },
// regulatoryConsideration				: { type: String, default:'' }
