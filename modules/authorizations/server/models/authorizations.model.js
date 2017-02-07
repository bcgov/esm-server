'use strict';
// =========================================================================
//
// Model for ComplianceOversight
//
// =========================================================================
module.exports = require('../../../core/server/controllers/core.schema.controller')
('Authorization', {
	projectId: {type: String, default: ''},
	projectCode: {type: String, default: ''},
	agencyCode: {type: String, default: ''},
	agencyName: {type: String, default: ''},
	actName: {type: String, default: ''},
	documentName: {type: String, default: ''},
	documentURL: {type: String, default: ''},
	documentType: {type: String, default:''},
	documentStatus: {type: String, default:''},
	authorizationDate: {type: Date, default: Date.now},
	authorizationSummary: {type: String, default: ''},
	followUpDocuments: [{name: String, ref: String}],
	authorizationID: {type: String, default: ''}
});

// agency	
// projectCode	
// authorizationId	
// Authorization name (Title)	
// Issue date	
// type(Permit or Certificate)	
// status (Issued or Amended)	
// location of document (URL)	
// authorizationSummary
// FollowUpDocumentNames (Separate with Semi colon)	
// FollowUpDocumentUrls (Separate with Semi Colon)