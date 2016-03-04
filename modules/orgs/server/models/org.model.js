'use strict';
// =========================================================================
//
// Model for orgs
// Org / Commitments Fields

// Number / ID
// Project Phase: Construction, Operations, Decommissioning
// Title
// Description
// Report Requirements
// Type of Org (list of values), including FN accommodation
// Pillar
// Sector: i.e. mining, wind, power generation

//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('Org', {
	__audit            : true,
	__access           : true,
	__tracking         : true,
	__codename         : 'unique',
	sector             : { type:String, default:'Mining', enum:['Mining', 'Energy', 'Transportation', 'Water Management', 'Industrial', 'Waste Management', 'Waste Disposal', 'Food Processing', 'Tourist Destination']},
	stage              : {type:String, enum:['Pre-Construction', 'Construction', 'Operations', 'Decommissioning'], default:'Operations' },
	reportRequirements : {type:String, default: ''},
	type               : {type:String, enum:['FN Accommodation', 'Severe'], default:'Severe' },
	pillar             : {type:String, default: ''},
	topics             : [{type:String}]
});

