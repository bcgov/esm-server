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
	periodType       : { type:String, default:'Working-Group', enum:['Working-Group', 'Public']},
	project          : { type:'ObjectId', ref:'Project', default:null, index:true },
	phase            : { type:'ObjectId', ref:'Phase', default:null, index:true },
	phaseName        : { type:String, default: '' },
	artifactType     : { type:String, default: '' },
	artifactVersion  : { type:String, default: '' },
	artifact         : { type:'ObjectId', ref:'Artifact' },
	instructions     : { type:String, default: '' },
	resolved         : { type:Boolean, default:false },
	resolvedPercent  : { type:Number, default:0.0 },
	published        : { type:Boolean, default:false },
	publishedPercent : { type:Number, default:0.0 }
},
{
	roles: 1
}
);


