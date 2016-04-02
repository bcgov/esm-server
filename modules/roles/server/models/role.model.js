'use strict';
// =========================================================================
//
// Model for roles
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var RoleSchema  = new Schema ({
	code        : { type:String, default:'code' },
	name        : { type:String, default:'New role' },
	description : { type:String, default:'New role' },
	isSystem    : { type:Boolean, default:false }
});

var Role = mongoose.model ('Role', RoleSchema);


Role.count ({}, function (err, count) {
	if (count === 0) {
		Role.collection.insert ([
			{name:'Admin'    , code:'admin'    , isSystem:true , description:'Admin'    },
			{name:'Staff'    , code:'staff'    , isSystem:true , description:'Staff'    },
			{name:'Guest'    , code:'guest'    , isSystem:true , description:'This is the public access group'},
			{name:'Team'     , code:'team'     , description:'Team'     },
			{name:'Team Lead', code:'teamlead' , description:'Team Lead'},
			{name:'Minister' , code:'minister' , description:'Minister' }
		], function (err) {
			// console.log ('insertion of base role data OK');
		});
	}
});

module.exports = Role;

