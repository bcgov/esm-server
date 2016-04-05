'use strict';
// =========================================================================
//
// Model for comments
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('CommentPeriod', {
	__audit          : true,
	__access         : true,
	__tracking       : true,
	periodType       : { type:String, default:'Working Group', enum:['Working Group', 'Public']},
	project          : { type:'ObjectId', ref:'Project', default:null, index:true },
	phase            : { type:'ObjectId', ref:'Phase', default:null, index:true },
	phaseName        : { type:String, default: '' },
	artifactName     : { type:String, default: '' },
	artifactVersion  : { type:String, default: '' },
	artifactVersionNumber        : { type:String, default:'',  index:true},
	artifactTypeCode : { type:String, default: '' },
	artifact         : { type:'ObjectId', ref:'Artifact' },
	instructions     : { type:String, default: '' },
	isResolved         : { type:Boolean, default:false },
	resolvedPercent  : { type:Number, default:0.0 },
	// published        : { type:Boolean, default:false }, we have isPublished in __access
	publishedPercent : { type:Number, default:0.0 },
	isVetted        : { type:Boolean, default:false },
	vettedPercent : { type:Number, default:0.0 },
	isClassified        : { type:Boolean, default:false },
	classifiedPercent : { type:Number, default:0.0 }
},
{
	roles: 1
}
);


