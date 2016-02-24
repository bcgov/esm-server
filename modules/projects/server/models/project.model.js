'use strict';
// =========================================================================
//
// Model for Project
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('Project', {
	__audit               : true,
	__access              : true,
	__tracking            : true,
	__status              : ['Initiated', 'Submitted', 'In Progress', 'Certified', 'Decommissioned'],
	__codename            : 'unique',
	phases                : [ {type: 'ObjectId', ref:'Phase'} ],
	type                  : { type:String, default:'', index:true },
	region                : { type:String, default:'' },     // object id
	location              : { type:String, default:'' },
	stream                : { type:'ObjectId', ref:'Stream'     , index:true, default:null },
	proponent             : { type:'ObjectId', ref:'Organization'     , index:true, default:null },
	substitution : { type:Boolean, default:false },
	intake: {
		affectedFirstNations  : { type:String, default:'' },
		constructionjobs      : { type:String, default:'' },
		contactedCEAA         : { type:String, default:'' },
		contactedFirstNations : { type:String, default:'' },
		investment            : { type:String, default:'' },
		lifespan              : { type:String, default:'' },
		meetsCEAACriteria     : { type:String, default:'' },
		meetsrprcriteria      : { type:String, default:'' },
		operatingjobs         : { type:String, default:'' },
		section7optin         : { type:String, default:'' }
	},
	isTermsAgreed: {type:Boolean, default:false},
	build: { type:String, default:'' },
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
	dateCommentsClosed           : { type: Date, default: null },
	roles : [ { type:String} ]
});
