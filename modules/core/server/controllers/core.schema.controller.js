'use strict';
// =========================================================================
//
// this wraps the schema and model creation of mongoose with some helpers
// that apply regularity to various db functions like access control and
// audit.  this is where to link in things that will apply to ALL
// schemas/models/collections
//
// pre-process fields are prepended with __ and post process fields are appended
// as such. so: __preProcessMe, postProcessMe__.
//
// You'll figure it out
//
// pre-process fields:
// ------------------
// __audit    : true / false : who did what when
// __tracking : true / false : start and end dates
// __status   : list of strings : sets the status enum list with first as default
// __codename : true / false / 'unique' : unique makes index too
// __access   : list of permission strings : sets up access and permissions stuff
//
// post-process fields:
// -------------------
// methods__ = definition.methods__ || {};
// indexes__ = definition.indexes__ || [];
// statics__ = definition.statics__ || {};
// presave__ = definition.presave__ || null;
//
// =========================================================================

var mongoose = require ('mongoose');
var _        = require ('lodash');

// =========================================================================
//
// a set of decorator functions named after the special fields in the definition
//
// =========================================================================
var decorate = {
	// -------------------------------------------------------------------------
	//
	// audit functionality
	//
	// -------------------------------------------------------------------------
	__audit : function (name, definition, v) {
		if (!v) return;
		definition.dateAdded   = { type: Date , default:null};
		definition.dateUpdated = { type: Date , default:null};
		definition.addedBy     = { type: 'ObjectId', ref:'User', default:null };
		definition.updatedBy   = { type: 'ObjectId', ref:'User', default:null };
		definition.methods__.setAuditFields = function (user) {
			this.updatedBy = (user) ? user._id : null;
			this.dateUpdated = Date.now ();
			if ( !this.dateAdded ) {
				this.dateAdded = this.dateUpdated;
				this.addedBy   = this.updatedBy;
			}
		};
	},
	// -------------------------------------------------------------------------
	//
	// tracking functionality
	//
	// -------------------------------------------------------------------------
	__tracking : function (name, definition, v) {
		definition.dateStarted      = { type: Date, default: null, index: true }; // date in progress
		definition.dateCompleted    = { type: Date, default: null, index: true }; // date complete
		definition.dateStartedEst   = { type: Date, default: null }; // date in progress
		definition.dateCompletedEst = { type: Date, default: null }; // date complete

	},
	// -------------------------------------------------------------------------
	//
	// shorthand for status lists
	//
	// -------------------------------------------------------------------------
	__status : function (name, definition, v) {
		definition.status = { type: String, default: v[0], enum: v };
	},
	// -------------------------------------------------------------------------
	//
	// shorthand for code, name, description with optional index on code
	//
	// -------------------------------------------------------------------------
	__codename : function (name, definition, v) {
		var index = (v === 'unique') ? {unique:true} : true;
		definition.code        = { type:String, default:'', required:'Code is required', index:index, lowercase:true, trim:true};
		definition.name        = { type:String, default:'', required:'Name is required' };
		definition.description = { type:String, default:'' };
	},
	// -------------------------------------------------------------------------
	//
	// set up access control for each element in this collection
	//
	// -------------------------------------------------------------------------
	__access : function (name, definition, v) {
		//
		// these go right on the record itself and are used for filtering
		// when querying
		//
		definition.read        = [ {type:String} ];
		definition.write       = [ {type:String} ];
		definition.delete      = [ {type:String} ];
		definition.isPublished = {type:Boolean, default:false, index:true};
		//
		// this gets populated each time a record is pulled singley
		// the main definition though is just the entire set false
		//
		// TBD : if there is a requirement to search form these values
		// then they choudl each be made into indexes as well in the same
		// way that read, write, delete are
		//
		definition.userCan     = {
			read : { type:Boolean, default:false },
			write: { type:Boolean, default:false },
			delete: { type:Boolean, default:false }
		};
		_.each (v, function (pname) {
			definition.userCan[pname] = { type:Boolean, default:false };
		});
		var allPermissions = v.concat (['read','write','delete']);
		var modPObject = function (id, pObject) {
			pObject.read   = (pObject.read)   ? pObject.read   : [];
			pObject.write  = (pObject.write)  ? pObject.write  : [];
			pObject.delete = (pObject.delete) ? pObject.delete : [];
			// pObject.read   = (pObject.read)   ? pObject.read.map   (function (r) {return (r === 'public') ? r : id+':'+r;}) : [];
			// pObject.write  = (pObject.write)  ? pObject.write.map  (function (r) {return (r === 'public') ? r : id+':'+r;}) : [];
			// pObject.delete = (pObject.delete) ? pObject.delete.map (function (r) {return (r === 'public') ? r : id+':'+r;}) : [];
			return pObject;
		};
		definition.methods__.allPermissions = function () {
			return allPermissions;
		};
		definition.methods__.publish = function () {
			this.read = _.union (this.read, ['public']);
			this.isPublished = true;
			this.markModified ('read');
		};
		definition.methods__.unpublish = function () {
			var i = this.read.indexOf ('public');
			if (i !== -1) this.read.splice (i, 1);
			this.isPublished = false;
			this.markModified ('read');
		};
		definition.methods__.addRoles = function (pObject) {
			var self = this;
			pObject = modPObject (this._id, pObject);
			_.each (pObject, function (p, i) {
				self[i] = _.union (self[i], p);
			});
			this.markModified ('read');
			this.markModified ('write');
			this.markModified ('delete');
		};
		definition.methods__.removeRoles = function (pObject) {
			var self = this;
			pObject = modPObject (this._id, pObject);
			_.each (pObject, function (p, i) {
				_.remove (self[i], function (val) {
					return _.indexOf (p, val) !== -1;
				});
			});
			this.markModified ('read');
			this.markModified ('write');
			this.markModified ('delete');
		};
		definition.methods__.setRoles = function (pObject) {
			pObject = modPObject (this._id, pObject);
			this.read = pObject.read;
			this.write = pObject.write;
			this.delete = pObject.delete;
			this.markModified ('read');
			this.markModified ('write');
			this.markModified ('delete');
		};
		definition.indexes__.push ({ read: 1 });
		definition.indexes__.push ({ write: 1 });
		definition.indexes__.push ({ delete: 1 });
		//
		// when building the schema put the passed in permissions
		// into the access system under the name of the schema
		//
		// access.addPermissionDefinitions ({
		// 	resource: name,
		// 	permissions : v
		// });
	}
};
// -------------------------------------------------------------------------
//
// do the work of splitting out the custom declarations and running the
// decorators
//
// -------------------------------------------------------------------------
var genSchema = function (name, definition) {
	//
	// ensure
	//
	definition.methods__ = definition.methods__ || {};
	definition.virtuals__ = definition.virtuals__ || [];
	definition.indexes__ = definition.indexes__ || [];
	definition.statics__ = definition.statics__ || {};
	definition.presave__ = definition.presave__ || null;
	//
	// go through and pre-parse the definition
	//
	_.each (definition, function (v, k) {
		if (k.substr(0,2) === '__') {
			delete definition[k];
			decorate[k] (name, definition, v);
		}
	});
	//
	// put aside the stuff that must happen post schema creation
	//
	var m = definition.methods__;
	var virtuals = definition.virtuals__;
	var i = definition.indexes__;
	var s = definition.statics__;
	var p = definition.presave__;
	definition.methods__ = null;
	definition.virtuals__ = null;
	definition.indexes__ = null;
	definition.statics__ = null;
	definition.presave__ = null;
	delete definition.methods__;
	delete definition.virtuals__;
	delete definition.indexes__;
	delete definition.statics__;
	delete definition.presave__;

	var options;
	if (virtuals) {
		// http://mongoosejs.com/docs/2.7.x/docs/virtuals.html
		options = {
			toObject: {
				virtuals: true
			},
			toJSON: {
				virtuals: true
			}
		};
	}
	//
	// let every model know its schema name in the real world, this is bound
	// to come in handy somewhere, likely with permission setting since the
	// ids are unbound from their model types
	//
	definition._schemaName = {type:String, default:name};
	//
	// create the schema
	//
	var schema = new mongoose.Schema (definition, options);
	//
	// perform post process stuff
	//
	if (p) schema.pre ('save', p);
	if (s) _.extend (schema.statics, s);
	if (m) _.extend (schema.methods, m);
	if (i) _.each (i, function (d) { schema.index (d); });
	if (virtuals) {
		// http://mongoosejs.com/docs/2.7.x/docs/virtuals.html
		_.forEach(virtuals, function(virtual){
			var v = schema.virtual(virtual.name);
			if(virtual.get)	v.get(virtual.get);
			if(virtual.set)	v.set(virtual.set);
		});
	}

	//
	// return
	//
	return schema;
};
// -------------------------------------------------------------------------
//
// generate the schema and model from the passed in definition, indexes and
// methods
//
// -------------------------------------------------------------------------
module.exports = function (name, definition) {
	if (!name || !definition) {
		console.error ('No name or definition supplied when building schema');
		return;
	}
	return mongoose.model (name, genSchema  (name, definition));
};
