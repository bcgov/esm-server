'use strict';

module.exports = require('../../../core/server/controllers/core.schema.controller')
('Project', {
	__codename: 'unique',

	status: {type: String},

	ownership: {type: String},
	operator : {type: String},

	externalIDs: [
		{
			source: {type: String, default: ''}, // ex. MEM, EPIC
			type: {type: String, default: ''}, // ex. projectId, permitId, externalDoc
			referenceID: {type: String, default: ''}, //ex. Permit ID, Project ID
			title: {type: String, default: ''}, // title for hyperlink...
			link: {type: String, default: ''}  //hyperlink...
		}],  // EPIC, MEM Project Ids, Permit IDs etc

	lat: {type: Number, default: 0},
	lon: {type: Number, default: 0},

	commodityType: {type: String, default: ''},
	commodities: [{type: String, default: ''}],

	tailingsImpoundments: {type: Number, default: 0},

	activities: [
		{
			name: {type: String, default: ''},
			status: {type: String, enum: ['Active', 'Inactive', 'Pending', 'Complete', 'Suspended', 'N/A']},
			order: {type: Number} // display order, not any business rules order
		}],


	externalLinks: [
		{
			source: {type: String, default: ''}, // ex. MEM, EPIC
			type: {type: String, default: ''}, // ex. projectId, permitId, externalDoc
			referenceID: {type: String, default: ''}, //ex. Permit ID, Project ID
			title: {type: String, default: ''}, // title for hyperlink...
			link: {type: String, default: ''}  //hyperlink...
		}], // links to documents etc...

	content: [
		{
			source: {type: String, default: ''}, // ex. MEM, EPIC
			type: {type: String, default: ''},   // ex. detailIntro, oversightIntro, subtitle, etc
			title: {type: String, default: ''},  // ex Project Details, Inspections / Compliance Oversight
			text: {type: String, default: ''},
			html: {type: String, default: ''} // should be the same text as text, but with html markup as needed
		}]
});
