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
.generateModel ('Conditions', {
	__audit        : true,
	__access       : true,
	__tracking     : true,
	__status       : ['Not Started', 'Not Required', 'In Progress', 'Complete'],
	__codename     : true,
	project        : { type:'ObjectId', ref:'Project', default:null, index:true}
});

