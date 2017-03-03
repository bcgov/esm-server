'use strict';
// =========================================================================
//
// Folder Model
//
module.exports = require ('../../../core/server/controllers/core.schema.controller')
('Folder', {
	__audit 	: true,  // who what when
	__access 	: ['publish', 'unPublish'],

	project 	: { type:'ObjectId', ref:'Project', default:null },
	directoryID : { type:Number, default: 0 },
	parentID 	: { type:Number, default: 0 },

	displayName : { type: String, default: ''},
	description : { type:String, default:'' },
	dateAdded 	: { type: Date, default: Date.now },
	dateUpdated : { type: Date, default: Date.now },

	updatedBy 	: { type:'ObjectId', ref:'User', default:null },
	order 		: { type: Number, default: 0},
	keywords 	: [ { type:'String'} ]
});
