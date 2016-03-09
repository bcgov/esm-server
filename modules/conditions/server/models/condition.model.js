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

//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('Condition', {
	__audit            : true,
	__access           : true,
	__tracking         : true,
	__codename         : 'unique',
	subject            : {type:String, default: ''},
	sector             : { type:String, default:'Mining', enum:['Mining', 'Energy', 'Transportation', 'Water Management', 'Industrial', 'Waste Management', 'Waste Disposal', 'Food Processing', 'Tourist Destination', 'Other']},
	stages             : [{type:String, enum:['Pre-Construction', 'Construction', 'Operations', 'Decommissioning']}],
	reportRequirements : {type:String, default: ''},
	type               : {type:String, enum:['FN Accommodation', 'Severe'], default:'Severe' },
	pillars             : [{type:String}]
});


