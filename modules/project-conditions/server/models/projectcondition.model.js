'use strict';
// =========================================================================
//
// Model for projectconditions
// ProjectCondition / Commitments Fields

// Number / ID
// Project Phase: Construction, Operations, Decommissioning
// Title
// Description
// Report Requirements
// Type of ProjectCondition (list of values), including FN accommodation
// Pillar
// Sector: i.e. mining, wind, power generation

//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('ProjectCondition', {
	__audit            : true,
	// __access           : true, ????
	__codename         : 'unique',
	project            : {type:'ObjectId', ref:'Project', default:null},
	subject            : {type:String, default: ''},
	reportRequirements : {type:String, default: ''},
	sector             : { type:String, default:'Mining', enum:['Mining', 'Energy', 'Transportation', 'Water Management', 'Industrial', 'Waste Management', 'Waste Disposal', 'Food Processing', 'Tourist Destination', 'Other']},
	stages             : [{type:String, enum:['Pre-Construction', 'Construction', 'Operations', 'Decommissioning']}],
	pillars             : [{type:String, enum:['Environment', 'Economic', 'Social', 'Heritage', 'Health']}]
});

