// 'use strict';
// // =========================================================================
// //
// // Model for activity set
// //
// // An activity set can be atomic, a class that can be reused in streams and projects
// //    in this case it is copied and 'instantiated'
// // if the project and stream are null then the activity set is a class
// // if the stream is not null, but the project is,then this belongs to a stream
// // finally, if the project is not null it belongs to a project
// // activities in streams are also templates that get copied over.
// // it is NOT the case that changes to the base activity set are reflected in
// // its child instantiations
// //
// // An activity set is either a phase or a milestone
// //
// // =========================================================================
// module.exports = require ('../../../core/server/controllers/core.models.controller')
// .generateModel ('ActivitySet', {
// 	__audit      : true,
// 	__access     : true,
// 	activitySet    : { type:'ObjectId', default:null, ref:'ActivitySet', index:true, required:'Error setting activity self reference' },
// 	project     : { type:'ObjectId', default:null, ref:'Project' , index:true },
// 	stream      : { type:'ObjectId', default:null, ref:'Stream'  , index:true },
// 	type        : { type:String, default:'Phase', index:true, enum:['Phase', 'Milestone']},
// 	code        : { type:String    , default:'code', index:true, required:'Code is required', lowercase:true, trim:true },
// 	name        : { type:String    , default:'name', required:'Please enter an activity name' },
// 	description : { type:String    , default:'description' },
// 	activities  : [ {type: 'ObjectId', ref:'Activity'} ],
// 	status      : { type: String, default:'Not Started', enum:['Pending', 'In Progress', 'Complete'] },
// 	overriddenBy : { type:'ObjectId', ref:'User' },
// 	overrideReason : {type:String, default:'' },
// 	completed : { type:String, default:'self.taskscomplete'},
// 	dateStarted                  : { type: Date, default: null }, // date in progress
// 	dateCompleted                : { type: Date, default: null }, // date complete
// 	dateStartedEst               : { type: Date, default: null }, // date in progress
// 	dateCompletedEst             : { type: Date, default: null } // date complete
// });
