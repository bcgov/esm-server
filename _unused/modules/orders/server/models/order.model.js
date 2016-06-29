'use strict';
// =========================================================================
//
// Model for orders
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('Order', {
	__audit     : true,
	__access    : true,
	__tracking  : true,
	project     : { type:'ObjectId', ref:'Project', default:null, index:true },
	phase       : { type:'ObjectId', ref:'Phase', deafult:null, index:true },
	stage       : { type:String, enum:['Pre-Construction', 'Construction', 'Operations', 'Decommissioning'], default:'Operations' },
	order       : { type:String, default: '' },
	templateData   : {  },
	templateVersion : { type:Number, default: 0 },
	templateCode    : { type:String, default: '' },
	vcs         : [ { type:String } ]
},
{
	vcs : 1
});

