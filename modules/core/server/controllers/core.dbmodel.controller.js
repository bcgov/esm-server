'use strict';
// =========================================================================
//
// Base controller for all simple CRUD stuff, just to save some typing
// THis version uses and returns promises where appropriate. this makes
// decorating much easier as well (pre and post processing)
//
// =========================================================================
var helpers  = require('./core.helpers.controller');
var mongoose = require ('mongoose');
var _ = require ('lodash');

var DBModel = function (options) {
	this._init (options);
};
DBModel.extend = helpers.extend;

_.extend (DBModel.prototype, {
	baseQuery        : {},
	emptyPromise     : helpers.emptyPromise,
	decorate         : helpers.emptyPromise,
	preprocessAdd    : helpers.emptyPromise,
	postprocessAdd   : helpers.emptyPromise,
	preprocessUpdate : helpers.emptyPromise,
	postprocessUpdate: helpers.emptyPromise,
	name             : 'Project',
	populate         : '',
	sort             : '',
	roles            : [],
	// -------------------------------------------------------------------------
	//
	// initialize
	//
	// -------------------------------------------------------------------------
	_init : function (user) {
		// this.opts = _.extend ({}, {
		// 	populate   : '',
		// 	sort       : '',
		// 	decorate   : emptyPromise,
		// 	preprocessAdd : emptyPromise,
		// 	preprocessUpdate : emptyPromise,
		// 	roles      : ['public']
		// }, options);
		// // console.log ("opts = ", this.opts);
		// if (name) this.name = name;
		this.mongoose   = mongoose;
		this.model      = mongoose.model (this.name);
		this.err        = (!this.model) ? new Error ('Model not provided when instantiating ESM Model') : false;
		this.useAudit   = _.has (this.model.schema.methods, 'setAuditFields');
		this.useRoles   = _.has (this.model.schema.methods, 'hasPermission');
		// console.log (this.model.schema.methods);
		// console.log ('use audit = ',this.useAudit);
		// console.log ('useRoles  = ',this.useRoles);
		// this.preprocess = this.opts.preprocess;
		// this.decorate   = this.opts.decorate;
		// this.populate   = this.opts.populate;
		// this.roles      = this.opts.roles;
		this.permissions = (this.useRoles) ? this.decoratePermission : this.emptyPromise;
		_.bindAll (this, [
			'findById',
			'findMany',
			'saveDocument',
			'saveAndReturn',
			'setDocument',
			'newDocument',
			'deleteDocument',
			'decorateAll',
			'addPermissions',
			'decoratePermission',
			'permissions',
			'preprocessAdd',
			'preprocessUpdate',
			'create',
			'findAndUpdate',
			'newFromObject'
		]);
		if (this.bind) _.bindAll (this, this.bind);
		this.user = user;
		this.readQuery = {};
		this.writeQuery = {};
		this.resetAccess = false;
		this.setUser (user);
		this.force = false;
		this.init ();
	},
	init: function () {},
	setForce: function (value) { this.force = value; },
	// -------------------------------------------------------------------------
	//
	// set the base query to be used for all methods, this applies filtering
	// for access, or whatever is needed. It starts with the baseQuery at
	// root, then adds access control if specified. the default root base
	// query is empty, and it can be either an object or a function that
	// returns an object
	//
	// access parameter is 'read' or 'write'
	//
	// -------------------------------------------------------------------------
	setBaseQ : function (accessQuery) {
		accessQuery = accessQuery || this.readQuery;
		// console.log (accessQuery);
		this.baseQ = (_.isFunction (this.baseQuery)) ? this.baseQuery.call (this) : _.cloneDeep (this.baseQuery);
		//
		// for an admin we don't apply access control, so only continue
		// if not admin, and don't continue if the model doesn't use
		// access control either. extend the base Q with the access Q
		//
		if (this.useRoles && _.indexOf (this.roles, 'admin') === -1) {
			_.extend (this.baseQ, accessQuery);
		}
		// console.log ('my roles are:', this.roles);
		// console.log ('base query is:', this.baseQ);
	},
	// -------------------------------------------------------------------------
	//
	// this sets the roles from a user object, it also sets a base query for
	// filtering by access level if it is needed. If there is no user present
	// then the only assumed role for access is 'public'
	//
	// -------------------------------------------------------------------------
	setRoles : function (user) {
		// CC: change this in production to only public, add 'admin' to the array to get everything
		this.roles = (user) ? user.roles : [];
		this.roles.push ('public');
		// console.log ("this.roles = ", this.roles);
		this.readQuery = {
			$or : [
				{ read   : { $in : this.roles } },
				{ write  : { $in : this.roles } },
				{ submit : { $in : this.roles } }
			]
		};
		this.writeQuery = {
			$or : [
				{ write  : { $in : this.roles } },
				{ submit : { $in : this.roles } }
			]
		};
	},
	// -------------------------------------------------------------------------
	//
	// set the user context so that access control can be applied to all
	// methods transparently
	//
	// -------------------------------------------------------------------------
	setUser : function (user) {
		this.user = user;
		this.userModel = {
			isProponent:function () { return true; },
			addRole: function (r) { console.log ('adding user role '+r); }
		};
		this.setRoles (user);
		this.setAccess ('read');
	},
	// -------------------------------------------------------------------------
	//
	// this can be used to set the access filter for a query, then set it
	// back again, its just a nice shorthand. val is read or write
	//
	// -------------------------------------------------------------------------
	setAccess: function (val) {
		// console.log ('setting access ',val);
		val = (val === 'write') ? this.writeQuery : this.readQuery;
		this.setBaseQ (val);
	},
	setAccessOnce: function (val) {
		// console.log ('setting access ONCE ',val);
		this.resetAccess = true;
		this.setAccess (val);
	},
	// -------------------------------------------------------------------------
	//
	// this function returns a promise using the find by Id method. It has an
	// optional populate as well. this is assumed blank unless otherwise passed in
	// it aslo deals woith permissions on the actual object, adding this to the
	// query if required
	//
	// -------------------------------------------------------------------------
	findById : function (id) {
		return this.findOne ({_id : id});
		// var self = this;
		// return new Promise (function (resolve, reject) {
		// 	if (self.err) return reject (self.err);
		// 	var q = _.extend ({}, self.baseQ, {_id : id});
		// 	// console.log ('q = ',q);
		// 	self.model.findOne (q)
		// 	.populate (self.populate)
		// 	.exec ()
		// 	.then (resolve, reject);
		// 	if (self.resetAccess) {
		// 		self.resetAccess = false;
		// 		self.setAccess ('read');
		// 	}
		// });
	},
	// -------------------------------------------------------------------------
	//
	// this function returns a promise using the find by Id method. It has an
	// optional populate as well. this is assumed blank unless otherwise passed in
	// it aslo deals woith permissions on the actual object, adding this to the
	// query if required
	//
	// -------------------------------------------------------------------------
	findOne : function (query, fields) {
		var self = this;
		query = query || {};
		return new Promise (function (resolve, reject) {
			if (self.err) return reject (self.err);
			var q = _.extend ({}, self.baseQ, query);
			// console.log ('q = ',q);
			self.model.findOne (q)
			.populate (self.populate)
			.select (fields)
			.exec ()
			.then (resolve, reject);
			if (self.resetAccess) {
				self.resetAccess = false;
				self.setAccess ('read');
			}
		});
	},
	// -------------------------------------------------------------------------
	//
	// returns a promise, takes optional query, sort and populate
	//
	// -------------------------------------------------------------------------
	findMany : function (query, fields) {
		var self = this;
		query = query || {};
		return new Promise (function (resolve, reject) {
			if (self.err) return reject (self.err);
			var q = _.extend ({}, self.baseQ, query);
			// console.log ('q.$or = ',q.$or[0].read);
			self.model.find (q)
			.sort (self.sort)
			.populate (self.populate)
			.select (fields)
			.exec ()
			.then (resolve, reject);
			if (self.resetAccess) {
				self.resetAccess = false;
				self.setAccess ('read');
			}
		});
	},
	findFirst : function (query, fields, sort) {
		var self = this;
		query = query || {};
		return new Promise (function (resolve, reject) {
			if (self.err) return reject (self.err);
			var q = _.extend ({}, self.baseQ, query);
			// console.log ('q = ',q);
			self.model.find (q)
			.sort (sort)
			.limit (1)
			.populate (self.populate)
			.select (fields)
			.exec ()
			.then (resolve, reject);
			if (self.resetAccess) {
				self.resetAccess = false;
				self.setAccess ('read');
			}
		});
	},
	findFirstOne : function (query, fields, sort) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findFirst (query, fields, sort).then (function (a) {
				if (a && a.length > 0) return a[0];
				else return null;
			})
			.catch (resolve, reject);
		});
	},
	findAndUpdate : function (obj) {
		var self = this;
	// console.log (JSON.stringify (obj, null, 4));
		return new Promise (function (resolve, reject) {
			self.model.findOne ({_id:obj._id}, function (err, doc) {
				// console.log ("DOC:",doc);
				if (doc) {
					doc.set (obj);
					doc.save ().then (resolve, reject);
				} else {
					resolve(obj);
				}
			});
		});
	},
	newFromObject: function (obj) {
		var self = this;
		// console.log (self.name +' newthing = ', obj);
		var m = new self.model (obj);
		return this.saveDocument (m);
	},
	// -------------------------------------------------------------------------
	//
	// save a document, but only if the user has write permission
	//
	// -------------------------------------------------------------------------
	saveDocument : function (doc) {
		var self = this;
		// console.log ('in saveDocument with doc ',doc);
		// console.log ('in saveDocument with roles ',self.roles);
		return new Promise (function (resolve, reject) {
			if (!self.force && self.useRoles && !doc.userHasPermission (self.user, 'write')) {
				return reject (new Error ('Write operation not permitted for this '+self.name+' object'));
			}
			if (self.useAudit) doc.setAuditFields (self.user);
			doc.save ().then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// set a document with new values
	//
	// -------------------------------------------------------------------------
	setDocument : function (doc, values) {
		return new Promise (function (resolve, reject) {
			resolve (doc.set (values));
		});
	},
	// -------------------------------------------------------------------------
	//
	// make a new blank document (optionally use the passed in object to make it)
	//
	// -------------------------------------------------------------------------
	newDocument : function (o) {
		var self = this;
		return new Promise (function (resolve, reject) {
			var m = new self.model (o);
			if (!m) return reject (new Error ('Cannot create new '+self.name));
			return resolve (m);
		});
	},
	// -------------------------------------------------------------------------
	//
	// delete with a promise
	//
	// -------------------------------------------------------------------------
	deleteDocument : function (doc) {
		return new Promise (function (resolve, reject) {
			doc.remove ().then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// Decorate an entire array, returns a promise which resolves the array
	//
	// -------------------------------------------------------------------------
	decorateAll : function (models) {
		var self = this;
		return Promise.all (models.map (self.decorate));
	},
	// -------------------------------------------------------------------------
	//
	// fill out the userPermissions field in the model. this will be different
	// for different users
	//
	// -------------------------------------------------------------------------
	addPermissions : function (model) {
		var self = this;
		model.userPermissions = model.permissions (self.roles);
		return model;
	},
	// -------------------------------------------------------------------------
	//
	// decorate the results with the user's permission
	//
	// -------------------------------------------------------------------------
	decoratePermission : function (models) {
		var self = this;
		if (_.isArray (models)) {
			// console.log ('decorating multiple with permissions');
			return Promise.all (models.map (self.addPermissions));
		} else {
			return new Promise (function (resolve, reject) {
				// console.log ('decorating single with permissions');
				resolve (self.addPermissions (models));
			});
		}
	},
	// -------------------------------------------------------------------------
	//
	// make a new copy from a passed in object
	//
	// -------------------------------------------------------------------------
	copy : function (obj) {
		var copy = (obj.toObject) ? obj.toObject () : obj;
		delete copy._id;
		return this.newDocument (copy);
	},
	// =========================================================================
	//
	// the next ones all deal with request actions, they all return a function
	// with requst and response as parameters
	//
	// =========================================================================
	saveAndReturn : function (doc) {
		var self = this;
		// console.log ('in save and return with ',doc, self);
		return new Promise (function (resolve, reject) {
			self.saveDocument (doc)
			.then (self.permissions)
			.then (self.decorate)
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// this is when we need to ensure that the provided code is in fact unique
	// perform a simple recursive routine that appends different suffixes until
	// one is unique
	//
	// -------------------------------------------------------------------------
	guaranteeUniqueCode : function (code) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findUniqueCode (code, '', function (err, newcode) {
				if (err) return reject (err);
				else resolve (newcode);
			});
		});
	},
	findUniqueCode: function (code, suffix, callback) {
		var self = this;
		var trialCode = code + (suffix || '');
		self.model.findOne ({code:trialCode}, function (err, result) {
			if (!err) {
				if (!result) {
					callback (null, trialCode);
				} else {
					return self.findUniqueCode (code, (suffix || 0) + 1, callback);
				}
			} else {
				callback (err, null);
			}
		});
	},
	// -------------------------------------------------------------------------
	//
	// POST
	// has optional preprocess and decorate (postprocess)
	// these assume that the object being saved already has an Id (it was made
	// first with new)
	//
	// -------------------------------------------------------------------------
	create : function (obj) {
		var self = this;
		// console.log ('creating', obj.code);
		return new Promise (function (resolve, reject) {
			self.newDocument (obj)
			.then (self.preprocessAdd)
			.then (self.saveDocument)
			.then (self.permissions)
			.then (self.postprocessAdd)
			.then (self.decorate)
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// PUT
	// same as POST except that we should have the original in the request as
	// it would appear in the URL. we then 'set' the differences
	//
	// -------------------------------------------------------------------------
	update : function (oldDoc, newDoc) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.setDocument (oldDoc, newDoc)
			.then (self.preprocessUpdate)
			.then (self.saveDocument)
			.then (self.permissions)
			.then (self.postprocessUpdate)
			.then (self.decorate)
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// DELETE
	//
	// -------------------------------------------------------------------------
	delete : function (doc) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.deleteDocument (doc)
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// GET NEW (decorate must return a promise)
	//
	// -------------------------------------------------------------------------
	new : function () {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.newDocument ()
			.then (self.permissions)
			.then (self.decorate)
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// GET
	// in the case that this was already on the URL (which it is) the object
	// will already exist in the request under its name
	//
	// -------------------------------------------------------------------------
	read : function (model) {
		var self = this;
		return new Promise (function (resolve, reject) {
			self.permissions (model)
			.then (self.decorate)
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// GET *
	//
	// -------------------------------------------------------------------------
	list : function (q, f) {
		q = q || {};
		q = _.extend ({}, this.baseQ, q);
		f = f || {};
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findMany (q, f)
			.then (self.permissions)
			.then (self.decorateAll)
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// GET *
	//
	// -------------------------------------------------------------------------
	one : function (q, f) {
		q = q || {};
		q = _.extend ({}, this.baseQ, q);
		f = f || {};
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findOne (q, f)
			.then (self.permissions)
			.then (self.decorate)
			.then (resolve, reject);
		});
	},
	// -------------------------------------------------------------------------
	//
	// GET *, but just those that we have write access to. this will not make
	// sense in some contexts, just those where we are using the access control
	//
	// -------------------------------------------------------------------------
	listwrite : function (q, f, p) {
		if (p) this.populate = p;
		q = q || {};
		if (_.has (this.model.schema.paths, 'dateCompleted')) {
			q.dateCompleted = { "$eq": null };
		}
		this.setAccessOnce ('write');
		q = _.extend ({}, this.baseQ, q);
		// console.log ('q = ', JSON.stringify(q,null,4));
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findMany (q, f)
			.then (self.permissions)
			.then (self.decorateAll)
			.then (resolve, reject);
		});
	}
});

module.exports = DBModel;
