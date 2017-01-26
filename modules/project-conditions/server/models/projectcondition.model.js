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
module.exports = require ('../../../core/server/controllers/core.schema.controller')('ProjectCondition', {
	__audit				: true,
	__tracking			: true,
	__access            : [],
	project				: {type:'ObjectId', ref:'Project', default:null, index:true},
	name				: {type:String, default:''},
	subject				: {type:String, default:''},
	sector				: {type:String, default:'Mines', enum:['Energy-Electricity',
		'Energy-Petroleum & Natural Gas',
		'Food Processing',
		'Industrial',
		'Mines',
		'Other',
		'Tourist Destination Resorts',
		'Transportation',
		'Waste Disposal',
		'Water Management']},
	description			: {type:String, default:''},
	reportRequirements	: {type:String, default:''},
	vcs					: [{type:'ObjectId', ref:'Vc', default:null}],
	pillars				: [{type:String, enum:['Environment', 'Economic', 'Social', 'Heritage', 'Health', 'Other', 'Requirements']}],
	phases				: [{type:String, enum:['Pre-Construction', 'Construction', 'Operations', 'Decommissioning']}],
	stage				: {type:String, default:'Draft', enum:['Draft', 'Certified']}
});

