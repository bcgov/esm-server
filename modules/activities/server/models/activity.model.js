'use strict';
// =========================================================================
//
// Model for Activity
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('Activity', {
	__audit        : true,
	__access       : true,
	__tracking     : true,
	__status       : ['Not Started', 'Not Required', 'In Progress', 'Complete'],
	__codename     : true,
	processCode    : { type:String, default:'' },
	tasks          : [ {type: 'ObjectId', ref:'Task'} ],
	activityBase   : { type:'ObjectId', default:null, ref:'ActivityBase', index:true},
	milestone      : { type:'ObjectId', default:null, ref:'Milestone'   , index:true },
	phase          : { type:'ObjectId', default:null, ref:'Phase'       , index:true },
	project        : { type:'ObjectId', default:null, ref:'Project'     , index:true },
	stream         : { type:'ObjectId', default:null, ref:'Stream'      , index:true },
	overriddenBy   : { type:'ObjectId', ref:'User' },
	overrideReason : { type:String, default:'' },
	completed      : { type:Boolean, default:false }
});
