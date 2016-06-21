'use strict';
// =========================================================================
//
// Model for topics
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/cc.schema.controller')
('Topic', {
	__codename : 'unique',
	parent     : { type:String, default:'', index:true },
	pillar     : { type:String, default:'Environment', enum:['Environment', 'Economic', 'Social', 'Heritage', 'Health'] },
	type       : { type:String, default:'Valued Component', enum:['Valued Component', 'Pathway Component'] }
});
