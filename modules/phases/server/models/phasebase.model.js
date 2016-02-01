'use strict';
// =========================================================================
//
// Model for activity set Base
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('PhaseBase', {
	__access     : true,
	__codename  : true,
	priorPhase  : { type: 'ObjectId', ref:'PhaseBase' },
	milestones  : [ {type: 'ObjectId', ref:'MilestoneBase'} ]
});
