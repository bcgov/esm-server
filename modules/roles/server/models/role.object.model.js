'use strict';
// =========================================================================
//
// Model Role Objects
//
// this idicates which objects are associated with which roles and for
// what sort of permissions.
//
// save a set of permissions for a task or other object by setting the role
// and object id of the object along with a string of read, write
//
// if the watch flag is set then this role is watching this object
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var RoleObjectSchema  = new Schema ({
	rolecode   : { type:String, index:true, default:'role' },
	stream     : { type:'ObjectId', ref:'Stream', index:true , default:null },
	project    : { type:'ObjectId', ref:'Project', index:true , default:null },
	activity   : { type:'ObjectId', ref:'Activity', index:true , default:null },
	permission : { type:String, default:'none' },
	watch      : { type:Boolean, default:false }
});

var RoleObject = mongoose.model ('RoleObject', RoleObjectSchema);

module.exports = RoleObject;
