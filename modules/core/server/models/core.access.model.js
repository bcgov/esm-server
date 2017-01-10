'use strict';
// =========================================================================
//
// Model for access control over contexts, classes and individual objects
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;


// -------------------------------------------------------------------------
//
// the role schema will show all the roles in a context, plus all the users
// in those roles, using aggregates of course
//
// the top level context is the application itself, which can have system
// level roles attached to it.  All other contexts are simply projects.
// Application level roles are available in all other contexts, that is,
// all oter contexts are children of the application context. No other
// contexts can be nested. Application roles used within a context other
// than the application have a prefix indicating they are system level
// roles
//
// if context == 'application' then those are top level system roles
// if user == null then this is just the definition of the role
//
// -------------------------------------------------------------------------
mongoose.model ('_Role', new Schema ({
	context : { type:String, index:true, required:true },
	role    : { type:String, required:true },
	user    : { type:String, index: { sparse: true } },
	owner   : { type:String }
}));

// -------------------------------------------------------------------------
//
// the permision schema will show all roles assigned to all permissions for
// any resource, again, aggregates
//
// if resource == 'application' then those are top level system roles
// if role == null then this is just a permission definition
//
// -------------------------------------------------------------------------
mongoose.model ('_Permission', new Schema ({
	resource   : { type:String, index:true, required:true },
	permission : { type:String, index:true, required:true },
	role       : { type:String, index:true }
}));




