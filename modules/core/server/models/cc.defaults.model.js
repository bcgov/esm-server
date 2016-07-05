'use strict';
// =========================================================================
//
// Model for setting defaults on types of objects
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;


// -------------------------------------------------------------------------
//
// this is giant catch-all for storing random bits of default json used to
// apply default settings of any type throughout the sytem
// it can be used for setting permission and role defaults when adding a
// new project, or defaults for a specific user for adding users to teams
// or whatever.  It is assumned that the caller understands the format of
// the defaults field
//
// -------------------------------------------------------------------------
mongoose.model ('_Defaults', new Schema ({
	context  : { type:String, index:true, required:true },  // eg: 'project'
	resource : { type:String, index:true, required:true },  // eg: 'project'
	level    : { type:String, index:true, required:true, default:'global' },  // eg: 'global' or maybe a userid for a user's preferences
	type     : { type:String, index:true, required:true }, // eg: 'roles' or 'user prefs' or whatever
	defaults : {} // the actual data, interpreted and managed by caller
}));




