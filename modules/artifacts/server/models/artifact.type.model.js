'use strict';
// =========================================================================
//
// model for ProjectType
//
// =========================================================================

var mongoose = require ('mongoose');

module.exports = mongoose.model ('ArtifactType', new mongoose.Schema ({
	type            : { type:String, default:'' , unique:true },
	isTemplate      : { type:Boolean, default:true },
	isDocument      : { type:Boolean, default:false },
	multiple        : { type:Boolean, default:false },
	versions        : [{ type:String }],
	stages          : [{
		name: { type:String }
		roles: {
			read : [ {type:String} ],
			write : [ {type:String} ],
			submit : [ {type:String} ]
		} ,
		activity: { type:'ObjectId', ref:'ActivityBase' }
	}],
	milestone       : { type:'ObjectId', ref:'MilestoneBase', index:true }
}));
