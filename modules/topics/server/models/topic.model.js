'use strict';
// =========================================================================
//
// Model for tasks
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('Topic', {
	__codename : 'unique',
	parentcode : { type:String, default:null },
	pillar     : { type:String, default:'Environmental', enum:['Environmental', 'Economic', 'Social', 'Heritage and Health'] },
	type       : { type:String, default:'Valued Component', enum:['Valued Component', 'Pathway Component'] }
});
