'use strict';
// =========================================================================
//
// Model for vcs
//
// in this model the topiccode is copied over from the original topic code, that
// is how they relate back to topcs, as are the parent and pillar. these
// are not editable, just copied. the name, however, can be edited freely and
// the code is a free form field in this case as it is used as a tag to
// mark vcs in all other parts of the system
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.schema.controller')
('Vc', {
	__audit				: true,
	__access      : [      // read / write / delete are automatic
	    'publish',
		'unPublish'],
	__codename			: 'unique',
	title				: { type:String, default:'', index:true },
	type				: { type:String, default:'', index:true },
	topiccode			: { type:String, default:'', index:true },
	parent				: { type:String, default:'', index:true },
	subComponents 		: [{ type:'ObjectId', ref:'Vc'}],
	indicators			: { type:String, default:''},
	pillar				: { type:String, default:'Environment', enum:['Environment', 'Economic', 'Social', 'Heritage', 'Health', 'Other', 'Requirements'] },
	project				: { type:'ObjectId', ref:'Project', default:null, index:true },
	stage				: { type:String, enum:['Pre-Construction', 'Construction', 'Operations', 'Decommissioning'], default:'Operations' },
	artifact 			: { type:'ObjectId', ref:'Artifact'},
	status 				: { type:String, default:''},
});

