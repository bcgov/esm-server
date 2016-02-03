'use strict';
// =========================================================================
//
// Model for Valued Component under a project, the basis of the AIR
//
// VC Heading
// 	Assessment Boundary
// 		Boundary 1
// 		Boundary 2
// 		...
// 	Existing Conditions
// 		Condition 1
// 		Condition 2
// 		...
// 	Potential Effects
// 		Effect 1
// 		Effect 2
// 		...
// 	Mitigation Measures
// 		Measure 1
// 		Measure 2
// 		...
// 	Residual Effects
// 	Prob Adverse Effects
// 	Deter. Significance
// 	Confidence and Risk
// 	Cumulative Effects
// 	Follow Up Strategy
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('ValuedComponent', {
	__audit           : true,
	__codename        : true,
	__access          : true,
	project           : { type:'ObjectId', ref:'Project', default:null },
	parentcode        : { type:String, default:null },
	pillar            : { type:String, default:'Environmental', enum:['Environmental', 'Economic', 'Social', 'Heritage and Health'] },
	type              : { type:String, default:'Valued Component', enum:['Valued Component', 'Pathway Component'] },
	componentAnalysis : { type:String, default:'' },
	assessmentBoundary : [{
		temporal       : { type:String, default:'Construction', enum:['Construction', 'Operations', 'Decommissioning'] },
		spatial        : { type:'ObjectId', ref:'Document', default:null },
		administrative : { type:String, default:'' },
		technical      : { type:String, default:'' },
		analysis       : { type:String, default:'' }
	}],
	existingConditions : [{
		description : { type:String, default:'' },
		analysis    : { type:String, default:'' },
		documents   : [ { type:'ObjectId', ref:'Document'} ]
	}],
	potentialEffects : [{
		analysis     : { type:String, default:'' },
		interactions : { type:String, default:'' },
		adverse      : { type:String, default:'' },
		excluded     : { type:String, default:'' },
		documents    : [ { type:'ObjectId', ref:'Document'} ]
	}],
	mitigationMeasures : [{
		name            : { type:String, default:'' },
		description     : { type:String, default:'' },
		assumedMeasures : { type:String, default:'' },
		mitigation      : { type:String, default:'' },
		success         : { type:String, default:'' },
		furtherMeasures : { type:String, default:'' },
		timeFrame       : { type:String, default:'' },
		phases          : [ { type:'ObjectId', ref:'Project' } ]
	}],
	residualEffects : {
		magnitude     : { type:String, default:'' },
		extent        : { type:String, default:'' },
		duration      : { type:String, default:'' },
		reversibility : { type:String, default:'' },
		frequency     : { type:String, default:'' }
	},
	probabilityAdverse : {
		quantative  : { type:Number, default:0 },
		qualitative : { type:String, default:'Low', enum:['Low', 'Medium', 'High'] }
	},
	significance: {
		determination : { type:String, default:'' }
	},
	confidenceAndRisk: {
		confidence         : { type:String, default:'Low', enum:['Low', 'Medium', 'High'] },
		additionalAnalysis : { type:String, default:'' },
		measures           : { type:String, default:'' }
	},
	cumulativeEffects: [{
		project             : { type:String, default:'' },
		assessment          : { type:String, default:'' },
		activityName        : { type:String, default:'' },
		activityDescription : { type:String, default:'' }
	}],
	followUpStrategy : {
		description : { type:String, default:'' },
		analysis    : { type:String, default:'' }
	}
});














