'use strict';
// =========================================================================
//
// Model for roles
//
// If a role is attahed to a project the project will not be null
// if a role belongs to a stream then project will be null but the stream will not
// system level roles have null projects and streams
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var RoleSchema  = new Schema ({
	code        : { type:String, default:'code', index:true, unique:true },
	name        : { type:String, default:'New role' },
	description : { type:String, default:'New role' },
	stream      : { type:'ObjectId', ref:'Stream', index:true , default:null },
	project     : { type:'ObjectId', ref:'Project', index:true , default:null }
});

var Role = mongoose.model ('Role', RoleSchema);


Role.count ({}, function (err, count) {
	if (count === 0) {
		Role.collection.insert ([
			{name:'Admin'    , code:'admin'    , description:'Admin'    },
			{name:'Staff'    , code:'staff'    , description:'Staff'    },
			{name:'Guest'    , code:'guest'    , description:'This is the public access group'},
			{name:'Team'     , code:'team'     , description:'Team'     },
			{name:'Team Lead', code:'teamlead' , description:'Team Lead'},
			{name:'Minister' , code:'minister' , description:'Minister' }
		], function (err) {
			console.log ('insertion of base role data OK');
		});
	}
});

module.exports = Role;

