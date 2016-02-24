'use strict';
// =========================================================================
//
// Model for projectdescriptions
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('ProjectDescription', {
	__audit        : true,
	__access       : true,
	__tracking     : true,
	project        : { type:'ObjectId', ref:'Project', default:null, index:true},
	version        : { type:String, enum:['Draft', 'Final', 'Certified'], default:'Draft', index:true},
	versionNumber  : { type:Number, default:0 },
	general: {
		background : {type:String, default: ''},
		location : {type:String, default: ''},
		locationDocuments : [{type:'ObjectId', ref:'Document'}]
	},
	overview: {
		components: {type:String, default: ''},
		sitePlanDocuments: [{type:'ObjectId', ref:'Document'}],
		schedulePhases: {type:String, default: ''},
		costs: {type:String, default: ''}
	},
	landUserSetting :{type:String, default: ''},
	consultingActivities:{type:String, default: ''},
	proposedDevelopmentSchedule:{type:String, default: ''}
});

