'use strict';
// =========================================================================
//
// Folder Model
//
var path     = require('path');
module.exports = require (path.resolve('./modules/core/server/controllers/core.schema.controller'))
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
	documentDate: { type: Date, default: Date.now },
	updatedBy 	: { type:'ObjectId', ref:'User', default:null },
	defaultSortField     : { type:String, enum:['name', 'date', 'custom', ''], default:'' },
	defaultSortDirection : { type:String, enum:['asc', 'desc', ''], default:'' },
	order 		           : { type: Number, default: Date.now},
	keywords 	: [ { type:'String'} ]
});
