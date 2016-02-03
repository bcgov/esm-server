// 'use strict';
// // =========================================================================
// //
// // Model for activity set Base
// //
// // =========================================================================
// module.exports = require ('../../../core/server/controllers/core.models.controller')
// .generateModel ('ActivitySetBase', {
// 	__access     : true,
// 	type        : { type:String, default:'Phase', index:true, enum:['Phase', 'Milestone']},
// 	code        : { type:String    , default:'code', index:true, required:'Code is required', lowercase:true, trim:true },
// 	name        : { type:String    , default:'name', required:'Please enter an activity name' },
// 	description : { type:String    , default:'description' },
// 	activities  : [ {type: 'ObjectId', ref:'ActivityBase'} ],
// 	preReqSets  : [ {type:'objectId', ref:'ActivitySetBase'} ],
// });
