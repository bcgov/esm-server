'use strict';
// =========================================================================
//
// Model for conditions
// Condition / Commitments Fields

// Number / ID
// Project Phase: Construction, Operations, Decommissioning
// Title
// Description
// Report Requirements
// Type of Condition (list of values), including FN accommodation
// Pillar
// Sector: i.e. mining, wind, power generation

// NOTE: When a condition is in a project it has a state (draft / certified)

//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.schema.controller')('Condition', {
	__audit            : true,
	__codename         : 'unique',
	__access           : [],
	subject            : {type:String, default: ''},
	reportRequirements : {type:String, default: ''},
	sector             : { type:String, default:'Mines', enum:['Energy-Electricity',
		'Energy-Petroleum & Natural Gas',
		'Food Processing',
		'Industrial',
		'Mines',
		'Other',
		'Tourist Destination Resorts',
		'Transportation',
		'Waste Disposal',
		'Water Management']},
	stages             : [{type:String, enum:['Pre-Construction', 'Construction', 'Operations', 'Decommissioning']}],
	pillars            : [{type:String, enum:['Environment', 'Economic', 'Social', 'Heritage', 'Health']}]
});



