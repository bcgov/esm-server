'use strict';
// =========================================================================
//
// Model for Project
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('Project', {
	__audit     : true,
	__access    : true,
	__tracking    : true,
	__status  : ['Initiated', 'Submitted', 'In Progress', 'Certified', 'Decomissioned'],
	__codename  : true,
	phases       : [ {type: 'ObjectId', ref:'Phase'} ],
	type        : { type:String, default:'', index:true },
	region      : { type:String, default:'' },     // object id
	location    : { type:String, default:'' },
	stream      : { type:'ObjectId', ref:'Stream'     , index:true, default:null },
	proponent   : { type:'ObjectId', ref:'Entity'     , index:true, default:null },
	//
	// location is a free form string entry
	//
	//
	// phase data is stored below, so these are merely keys into that data
	//
	currentPhase                 : { type:'ObjectId', ref:'Phase', index:true },
	nextPhase                    : { type:'ObjectId', ref:'Phase', index:true },
	currentPhaseCode             : { type: String, default:'' },
	dateCurrentPhaseEstimatedEnd : { type: Date, default: Date.now },
	nextPhaseCode                : { type: String, default:'' },
	dateNextPhaseEstimatedStart  : { type: Date, default: Date.now },
	overallProgress              : { type: Number, default:0 },
	lat                          : { type: Number, default:0 },
	lon                          : { type: Number, default:0 },
	dateCommentsOpen             : { type: Date, default: null },
	dateCommentsClosed           : { type: Date, default: null }
});
