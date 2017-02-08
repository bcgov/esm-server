'use strict';

module.exports = require('../../../core/server/controllers/core.schema.controller')
('Project', {
	__codename: 'unique',

	status: {type: String},

	ownership: {type: String},
	operator : {type: String},

	externalIDs: [
		{   _id: false,
			source: {type: String, default: ''}, // ex. IMPORT, MEM, EPIC
			type: {type: String, default: ''}, // ex. MEM_ID, EPIC_ID
			referenceID: {type: String, default: ''}, //ex. MEM Permit ID, EPIC Project ID
			title: {type: String, default: ''}, // title for hyperlink...
			link: {type: String, default: ''}  //hyperlink...
		}],  // EPIC, MEM Project Ids, Permit IDs etc

	latitude: {type: Number, default: 0},
	longitude: {type: Number, default: 0},

	commodityType: {type: String, default: ''},
	commodities: [{type: String, default: ''}],

	tailingsImpoundments: {type: Number, default: 0},

	activities: [
		{   _id: false,
			name: {type: String, default: ''},
			status: {type: String, default: '', enum: ['Active', 'Inactive', 'Pending', 'Complete', 'Suspended', 'N/A', '']},
			order: {type: Number} // display order, not any business rules order
		}],


	externalLinks: [
		{   _id: false,
			source: {type: String, default: ''}, // ex. IMPORT, MEM, EPIC
			type: {type: String, default: ''}, // ex. EXTERNAL_LINK ?
			page: {type: String, default: ''}, // ex. Compliance, Authorization, Mine, further grouping for different areas of concern
			title: {type: String, default: ''}, // title for hyperlink...
			link: {type: String, default: ''}  //hyperlink...
		}], // links to documents etc...

	content: [
		{   _id: false,
			source: {type: String, default: ''}, // ex. IMPORT, MEM, EPIC
			type: {type: String, default: ''},   // ex. SUBTITLE, INTRO_TEXT, OVERVIEW_INTRO_TEXT
			page: {type: String, default: ''}, // ex. Compliance, Authorization, Mine, further grouping for different areas of concern
			title: {type: String, default: ''},  // ex Project Details, Inspections / Compliance Oversight ?
			text: {type: String, default: ''},
			html: {type: String, default: ''} // should be the same text as text, but with html markup as needed
		}]
});
