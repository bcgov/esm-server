'use strict';
// =========================================================================
//
// Base controller for all simple CRUD stuff, just to save some typing
// THis version uses and returns promises where appropriate. this makes
// decorating much easier as well (pre and post processing)
//
// =========================================================================
var mongoose = require ('mongoose');
var _        = require ('lodash');
var access   = require ('./core.access.controller');
var path     = require('path');
var SearchUtil  = require (path.resolve('./modules/core/server/controllers/core.search.util'));

var emptyPromise = function (t) {return new Promise (function (r, e) { r (t); }); };

// -------------------------------------------------------------------------
//
// opts is expected to have user, context, and userRoles
//
// -------------------------------------------------------------------------
var DBModel = function (opts) {
	this._init (opts);
};
DBModel.extend = require ('./core.extend.controller');

_.extend (DBModel.prototype, {
	//
	// these are all the things that can be extended form the base
	//
	name             : 'Application',     // required : name of the model
	baseQuery        : {},            // optional : base query to be applied to all queries
	decorate         : emptyPromise,  // optional : extra decoration function
	preprocessAdd    : emptyPromise,  // optional : pre-processing
	postprocessAdd   : emptyPromise,  // optional : post-processing
	preprocessUpdate : emptyPromise,  // optional : pre-processing
	postprocessUpdate: emptyPromise,  // optional : post-processing
	populate         : '',            // optional : populate clause for all queries
	sort             : '',            // optional : sort clause for all queries
	decorateCollection : true,       // optional : decorate collections as well as singles ?
	// -------------------------------------------------------------------------
	//
	// initialize
	//
	// -------------------------------------------------------------------------
	_init : function (opts) {
		// console.log ('dbmodel._init:', opts);
		if (!opts.context) {
			console.error ('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Invalid options passed to dbmodel '+this.name);
			throw (new Error ('Invalid options passed to dbmodel '+this.name));
		} else {
			//console.log('opts = ', JSON.stringify(opts));
		}
		this.opts       = opts;
		this.user       = opts.user;
		this.context    = opts.context   || 'application';
		this.userRoles  = opts.userRoles || [];
		this.isAdmin    = false;
		this.roles      = [];
		// console.log ('new ', this.name);
		// console.log ('this.user      = ', (this.user && this.user.username) ? this.user.username : '?');
		// console.log ('this.context   = ', this.context  );
		// console.log ('this.userRoles = ', JSON.stringify(this.userRoles));
		//
		// keep a pointer to mongoose, and set our local schema/model
		//
		this.mongoose   = mongoose;
		this.model      = mongoose.model (this.name);
		this.err        = (!this.model) ? new Error ('Model not provided when instantiating ESM Model') : false;
		//
		// this will tell us whether or not to set the audit fileds on save
		//
		this.useAudit   = _.has (this.model.schema.methods, 'setAuditFields');
		//
		// this will let us know whether or not to use the security stuff
		//
		this.useRoles   = _.has (this.model.schema.methods, 'unpublish');
		//
		// a function pointer to either the real or fake decorator
		//
		this.permissions = (this.useRoles) ? this.decoratePermission : emptyPromise;
		//
		// bind everything we want to use out of context
		//
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
			'newFromObject',
			'applyModelPermissionDefaults',
			'getModelPermissionDefaults',
			'complete',
			'search',
			'paginate'
		]);
		//
		// allows the extended classes to also bind
		//
		if (this.bind) _.bindAll (this, this.bind);
		this.filter      = {};
		this.resetAccess = false;
		this.force       = false;
		//
		// this is called seperately so that the user can be reset during other processing
		// if required
		//
		this.setUserRoles (this.opts);
		//
		// run the custom init if provided
		//
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
		accessQuery = accessQuery || this.filter.read;
		this.baseQ = (_.isFunction (this.baseQuery)) ? this.baseQuery.call (this) : _.cloneDeep (this.baseQuery);
		//
		// for an admin we don't apply access control, so only continue
		// if not admin, and don't continue if the model doesn't use
		// access control either. extend the base Q with the access Q
		//
		if (this.useRoles && !this.isAdmin) {
			_.extend (this.baseQ, accessQuery);
		}
		// console.log ('my roles are:', this.roles);
		// console.log ('base query is:', this.baseQ);
	},
	// Trim salt/pass from responses.
	sanitizeData : function (obj) {
		if (! obj ) {
			// this happens when searching for an object that does not exist.
			return Promise.resolve();
		}
		var cleanFunc = function (c) {
			if (c._schemaName === 'User') {
				c.salt		= null;
				c.password	= null;
			}
		};
		return new Promise (function (resolve, reject) {
			// Check if array or single.
			if (obj instanceof Array) {
				_.each(obj, function (o) {
					cleanFunc(o);
				});
			} else {
				cleanFunc(obj);
			}
			resolve(obj);
		});
	},
	// -------------------------------------------------------------------------
	//
	// sets up everything to do with roles, filtering queries, security, etc.
	// seperate call from 'new' so that context may be changed mid-processing
	// by caller
	//
	// -------------------------------------------------------------------------
	setUserRoles: function (opts) {
		//
		// do some silly stuff to ensure that we have a set of roles from the
		// user object
		//
		this.user = opts.user || {roles:[]};
		var roles = this.user.roles ? this.user.roles : [];
		//
		// set whether or not we are admin to make things easier later
		//
		this.isAdmin = !!~roles.indexOf ('admin');
		//
		// set the total set of roles as the user roles plus the contextual
		// roles
		//
		this.roles = roles.concat (opts.userRoles);
		//
		// set up the read, write, delete filters so we dont have to keep doing it
		//
		this.filter = {
			'read'   : { read   : { $in : this.roles } },
			'write'  : { write  : { $in : this.roles } },
			'delete' : { delete : { $in : this.roles } }
		};
		//
		// the default access level is set to 'read'
		//
		this.setAccess ('read');
		// console.log ('dbmodel: roles', this.roles);
		// console.log ('dbmodel: isAdmin', this.isAdmin);
	},
	// -------------------------------------------------------------------------
	//
	// this is kept for backwards compatability with the original dbmodel
	//
	// -------------------------------------------------------------------------
	setUser : function (user) {
		this.setUserRoles ({
			user      : user,
			context   : this.context,
			userRoles : this.userRoles
		});
	},
	// -------------------------------------------------------------------------
	//
	// this can be used to set the access filter for a query, then set it
	// back again, its just a nice shorthand. val is read or write or delete
	//
	// -------------------------------------------------------------------------
	setAccess: function (val) {
		//
		// get the correct access query from the filter set built earlier
		//
		var accessQuery = this.filter[val];
		//
		// if a base query is defined as a function, call it, or clone it
		// if it is not defined it will just come back null
		//
		this.baseQ = (_.isFunction (this.baseQuery)) ? this.baseQuery.call (this) : _.cloneDeep (this.baseQuery);
		//
		// for an admin we don't apply access control, so only continue
		// if not admin, and don't continue if the model doesn't use
		// access control either. extend the base Q with the access Q
		//
		if (this.useRoles && !this.isAdmin) {
			_.extend (this.baseQ, accessQuery);
		}
	},
	// -------------------------------------------------------------------------
	//
	// this temporarilly sets a new access level (read or write or delete)
	// it will cause that access clause to be merged with whatever query is
	// happens next, then it will be reset back to read
	//
	// -------------------------------------------------------------------------
	setAccessOnce: function (val) {
		this.resetAccess = true;
		this.setAccess (val);
	},
	// -------------------------------------------------------------------------
	//
	// this is a nice shorthand for use when checking for existance of roles
	//
	// -------------------------------------------------------------------------
	hasPermission : function (userRoles, targetRoles) {
		return (this.isAdmin || (_.intersection (userRoles, targetRoles).length > 0));
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
		//console.log('findById =  ', id)
		return this.findOne ({_id : id})
			.then (this.permissions)
			.then (this.sanitizeData)
			.then (this.decorate);
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
		//console.log ('dbmodel.findOne:', query, fields);
		var self = this;
		query = query || {};
		return new Promise (function (resolve, reject) {
			if (self.err) return reject (self.err);
			var q = _.extend ({}, self.baseQ, query);
			//console.log ('q = ',q);
			self.model.findOne (q)
			.populate (self.populate)
			.select (fields)
			.exec ()
			.then (self.sanitizeData)
			.then (resolve, self.complete (reject, 'findone'));
			if (self.resetAccess) {
				self.resetAccess = false;
				self.setAccess ('read');
			}
		});
	},
	exists : function (query) {
		var self = this;
		query = query || {};
		var q = _.extend ({}, this.baseQ, query);
		return new Promise (function (resolve, reject) {
			self.model.findOne (q, function (err, m) {
				if (!_.isEmpty(m)) resolve (true);
				else resolve (false);
			});
		});
	},
	// -------------------------------------------------------------------------
	//
	// returns a promise, takes optional query, sort and populate
	//
	// -------------------------------------------------------------------------
	findMany : function (query, fields, sortby) {
		// console.log ('dbmodel.findMany:', query, fields);
		var sort = sortby || this.sort;
		var self = this;
		query = query || {};
		return new Promise (function (resolve, reject) {
			if (self.err) return reject (self.err);
			var q = _.extend ({}, self.baseQ, query);
			//console.log ('findMany.query = ' + JSON.stringify(query, null, 4));
			//console.log ('findMany.q = ' + JSON.stringify(q, null, 4));
			self.model.find (q)
			.sort (sort)
			.populate (self.populate)
			.select (fields)
			.exec ()
			.then (self.sanitizeData)
			.then (resolve, self.complete (reject, 'findmany'));
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
			.then (self.sanitizeData)
			.then (resolve, self.complete (reject, 'findfirst'));
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
	distinct : function (field, query) {
		var self = this;
		query = query || {};
		return new Promise (function (resolve, reject) {
			if (self.err) return reject (self.err);
			var q = _.extend ({}, self.baseQ, query);
			self.model.distinct (field, q)
			.exec ()
			.then(self.sanitizeData)
			.then (resolve, self.complete (reject, 'distinct'));
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
					doc.save ().then (resolve, self.complete (reject, 'findandupdate'));
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
	// set role permissions on an object
	//
	// -------------------------------------------------------------------------
	// -------------------------------------------------------------------------
	//
	// save a document, but only if the user has write permission
	//
	// -------------------------------------------------------------------------
	saveDocument : function (doc) {
		var self = this;
		//console.log('saveDocument doc = ', JSON.stringify(doc, null, 4));
		//console.log('saveDocument roles = ', JSON.stringify(self.roles, null, 4));
		return new Promise (function (resolve, reject) {
			if (!self.force && self.useRoles && !self.hasPermission (self.userRoles, doc.write)) {
				return reject (new Error ('saveDocument: Write operation not permitted for this '+self.name+' object'));
			}
			if (self.useAudit) doc.setAuditFields (self.user);
			doc.save ().then (resolve, self.complete (reject, 'savedocument'));
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
			if (!m) return reject (new Error ('newDocument: Cannot create new '+self.name));
			return resolve (m);
		});
	},
	// -------------------------------------------------------------------------
	//
	// delete with a promise
	//
	// -------------------------------------------------------------------------
	deleteDocument : function (doc) {
		var self = this;
		return new Promise (function (resolve, reject) {
			if((doc._schemaName === "Document" || doc._schemaName === "Folder" ) && doc.isPublished) {
				return reject (new Error ('Cannot delete published content'));
			}
			doc.remove ().then (resolve, self.complete (reject, 'deletedocument'));
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
		//console.log ('dbmodel.addPermissions (1) context = ' + JSON.stringify(self.context));
		//console.log ('dbmodel.addPermissions (2) user = ' + JSON.stringify(self.user.username));
		//console.log ('dbmodel.addPermissions (3) resource = ' + JSON.stringify(model._id));
		//var start = new Date().getTime();
		return new Promise (function (resolve, reject) {
			if (!model) resolve (model);
			else if (self.isAdmin) {
				_.each (model.allPermissions (), function (key) {
					model.userCan[key] = true;
				});
				resolve (model);
			}
			else {
				_.each (model.allPermissions (), function (key) {
					model.userCan[key] = false;
				});
				//console.log ('dbmodel.addPermissions (4) access.userPermissions...');
				access.userPermissions ({
					context  : self.context,
					user     : self.user.username,
					resource : model._id
				})
				.then (function (ps) {
					//console.log ('dbmodel.addPermissions (5) access.userPermissions result = ', JSON.stringify(ps));
					ps.map (function (perm) {
						model.userCan[perm] = true;
					});
					model.userCan.read = self.hasPermission (self.roles, model.read);
					model.userCan.write = self.hasPermission (self.roles, model.write);
					model.userCan.delete = self.hasPermission (self.roles, model.delete);
					//console.log ('dbmodel.addPermissions (6) access.userPermissions model.userCan = ', JSON.stringify(model.userCan));
					return model;
				})
				//.then(function(result) {
				//	var end = new Date().getTime();
				//	var time = end - start;
				//	console.log('dbmodel.addPermissions(context:' +  self.context + ', user:' + self.user.username + ', resource:' + model._id + ') elapsed ms = ' + time);
				//	return result;
				//})
				.then (resolve, self.complete (reject, 'addPermissions'));
			}
		});
	},
	// -------------------------------------------------------------------------
	//
	// decorate the results with the user's permission
	//
	// -------------------------------------------------------------------------
	decoratePermission : function (models) {
		var self = this;
		// console.log ('decoratePermission roles', self.roles);
		// console.log ('decoratePermission isAdmin', self.isAdmin);
		if (_.isArray (models)) {
			return self.decorateCollection ? (Promise.all (models.map (self.addPermissions))) : models;
		} else {
			return new Promise (function (resolve, reject) {
				//console.log ('dbmodel.decoratePermission call addPermissions.');
				resolve (self.addPermissions (models));
			});
		}
	},
	// -------------------------------------------------------------------------
	//
	// given a model, set/add/delete permissions for roles. the definition looks
	// like this:
	// {
	// 	permission : [role array],
	// 	permission : [role array],
	// }
	// //
	// -------------------------------------------------------------------------
	setAllModelPermissions : function (model, definition) {
		//
		// this sets ALL permissions. If the permission is not included then
		// it is essentially deleted
		//
		model.read   = [];
		model.write  = [];
		model.delete = [];
		var self = this;
		return access.deleteAllPermissions ({
			resource: model._id
		})
		.then (function () {
			//
			// everything is empty, now add
			//
			return self.addModelPermissions (model, definition);
		});
	},
	setModelPermissions : function (model, definition) {
		if (!definition) {
			// console.log("returning early");
			return Promise.resolve(null);
		}
		//console.log('setModelPermissions.model = ' + JSON.stringify(model, null, 4));
		//console.log('setModelPermissions.definition = ' + JSON.stringify(definition, null, 4));
		//
		// this sets only the passed in permissions and leaves the other ones alone
		//
		var promisesPromises = [];
		_.each (definition, function (roles, permission) {
			//console.log("permission:", JSON.stringify(permission, null, 4));
			//console.log("roles:", JSON.stringify(roles, null, 4));
			//console.log("unique roles:", JSON.stringify(_.uniq(roles), null, 4));
			promisesPromises.push (access.setPermissionRoles ({
				resource   : model._id,
				permission : permission,
				roles      : _.uniq(roles)
			}));
		});
		return Promise.all (promisesPromises).then (function () {
			//
			// this has to be done last becuase it prepends the role
			// with the context for listing
			//
			//console.log("definition.read:", JSON.stringify(definition.read, null, 4));
			//console.log("definition.write:", JSON.stringify(definition.write, null, 4));
			//console.log("definition.delete:", JSON.stringify(definition.delete, null, 4));
			//console.log("model.read:", JSON.stringify(model.read, null, 4));
			//console.log("model.write:", JSON.stringify(model.write, null, 4));
			//console.log("model.delete:", JSON.stringify(model.delete, null, 4));
			definition.read   = definition.read || model.read;
			definition.write  = definition.write || model.write;
			definition.delete = definition.delete || model.delete;
			//console.log("setRoles:", JSON.stringify(definition, null, 4));
			model.setRoles (definition);
			return definition;
		});
	},
	addModelPermissions : function (model, definition) {
		//
		// this merges new permissions into the old
		//
		var resource = model._id;
		model.addRoles ({
			read   : definition.read,
			write  : definition.write,
			delete : definition.delete
		});
		var promiseArray = [model.save ()];
		_.each (definition, function (roles, permission) {
			promiseArray.push (access.addPermissions ({
				resource    : resource,
				permissions : [ permission ],
				roles       : roles
			}));
		});
		return Promise.all (promiseArray);
	},
	deleteModelPermissions : function (model, definition) {
		//
		// this removes permissions as specified
		//
		model.removeRoles ({
			read   : definition.read,
			write  : definition.write,
			delete : definition.delete
		});
		var promiseArray = [model.save ()];
		_.each (definition, function (roles, permission) {
			promiseArray.push (access.deletePermissions ({
				resource    : model._id,
				permissions : [ permission ],
				roles       : roles
			}));
		});
		return Promise.all (promiseArray);
	},
	// -------------------------------------------------------------------------
	//
	// get all the default role permissions for this object if they do, in fact
	// exist. The format is { owner : { role : [ permisions ]}
	//
	// -------------------------------------------------------------------------
	getModelPermissionDefaults : function () {
		var self = this;
		var Defaults = this.mongoose.model ('_Defaults');
		return new Promise (function (resolve, reject) {
			// console.log("getModelPermissionDefaults!!:", self.name.toLowerCase());
			Defaults.findOne ({
				resource : self.name.toLowerCase (),
				level    : 'global',
				type     : 'default-permissions',
			})
			.exec ()
			.then (resolve, self.complete (reject, 'getModelPermissionDefaults'));
		});
	},
	// -------------------------------------------------------------------------
	//
	// take a permission defaults object and apply it to this thing, whatever
	// it is. There is a standard for this format:
	// {
	//  context : '',
	// 	roles: {
	// 		owner : [roles]
	// 	},
	// 	permissions: {
	// 		permision: [roles]
	// 	}
	// }
	//
	// -------------------------------------------------------------------------
	applyModelPermissionDefaults : function (model, optionalInheritFromId, forceReadPermissions) {
		// optionalInheritFromId: An artifactID to which 'self', an 'internal' document would inherit
		// permissions from. NB: this will not apply to internal documents.

		// forceReadPermissions: 'self' is actually an internal document in an artifact, so use these
		// passed in permissions just for the read array, and leverage the default write/delete from
		// the _defaults table.  Do not inherit anything.

		if (!this.useRoles) return Promise.resolve (model);
		var self = this;
		return new Promise (function (resolve, reject) {
			var context     ;
			var resource    ;
			var parray      ;
			var definitions ;
			var defaults    ;
			var ownerroles  ;
			var permissions ;

			self.getModelPermissionDefaults ()
			.then (function (defaultObject) {
				//console.log("defaultObject: ",JSON.stringify(defaultObject, null, 4));
				resource    = model._id;
				parray      = [];
				definitions = {};
				defaults    = defaultObject.defaults;
				ownerroles  = defaults.roles;
				permissions = defaults.permissions;
				//
				// determine the context
				// default to application
				// if this is a project, then use its code
				// otherwise if it has a project, use its project._id
				// or if not populated use the project field to get the _id
				//
				if (defaultObject.context === 'project') {
					if (self.name.toLowerCase () === 'project') {
						return model._id;
					} else if (model.project && model.project.code) {
						return model.project._id;
					} else if (model.project) {
						return self.mongoose.model ('Project').findOne ({_id:model.project}).exec ()
						.then (function (m) {
							return m._id;
						});
					} else {
						return 'application';
					}
				} else {
					return 'application';
				}
			})
			.then (function (context) {
				//console.log("context: ",JSON.stringify(context, null, 4));
				//
				// this part deals with only the roles, it ensures that they are all actually
				// set up properly on the given context
				//
				_.each (ownerroles, function (roles, owner) {
					//console.log("owner: ",JSON.stringify(context, null, 4));
					//console.log("roles: ",JSON.stringify(roles, null, 4));
					parray.push (access.addRoleDefinitions ({
						context : context,
						owner   : owner,
						roles   : roles
					}));
				});
				//
				// now set permissions
				//
				//console.log("permissions: ",JSON.stringify(permissions, null, 4));
				if (forceReadPermissions) {
					// Set the forceReadPermissions without inheriting the artifact perms
					permissions.read = forceReadPermissions;
				}
				parray.push (self.setModelPermissions (model, permissions));
				return Promise.all (parray);
			})
			.then (function () {
				if (optionalInheritFromId) {
					var ArtifactModel = mongoose.model ('Artifact');
					return ArtifactModel.findOne({_id: optionalInheritFromId});
				} else {
					return model;
				}
			})
			.then (function (m) {
				if (optionalInheritFromId) {
					// If inheriting, make sure public role is removed before setting this
					// document's read perm
					var inheritPerms = {
						'read': m.read,
						'write': m.write,
						'delete': m.delete
					};
					// console.log("inheritPerms:", inheritPerms.read);
					// Remove public from inheritance mode
					_.remove(inheritPerms.read, function (elem) {
						return elem === 'public';
					});
					// console.log("inheritPerms:", inheritPerms.read);
					return self.setModelPermissions (model, inheritPerms);
				} else {
					return model;
				}
			})
			.then( function () {
				return model;
			})
			.then (resolve, self.complete (reject, 'applyModelPermissionDefaults'));
		});
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
			.then (self.sanitizeData)
			.then (resolve, self.complete (reject, 'saveAndReturn'));
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
	create : function (obj, optionalInheritFromId, forceReadPermissions) {
		var self = this;
		// console.log ('creating', obj.code);
		return new Promise (function (resolve, reject) {
			self.newDocument (obj)
			.then ( function (m) {
				return self.applyModelPermissionDefaults(m, optionalInheritFromId, forceReadPermissions);
			})
			.then (self.preprocessAdd)
			.then (self.saveDocument)
			//.then (self.permissions)
			.then (self.postprocessAdd)
			.then (self.decorate)
			.then (resolve, self.complete (reject, 'create'));
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
			.then (self.sanitizeData)
			.then (resolve, self.complete (reject, 'update'));
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
			.then (resolve, self.complete (reject, 'delete'));
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
			.then (resolve, self.complete (reject, 'new'));
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
			.then (self.sanitizeData)
			.then (resolve, self.complete (reject, 'read'));
		});
	},
	// -------------------------------------------------------------------------
	//
	// GET *
	//
	// -------------------------------------------------------------------------
	list : function (q, f, s) {
		q = q || {};
		q = _.extend ({}, this.baseQ, q);
		f = f || {};
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findMany (q, f, s)
			.then (self.permissions)
			.then (self.decorateAll)
			.then (self.sanitizeData)
			.then (resolve, self.complete (reject, 'list'));
		});
	},
	// -------------------------------------------------------------------------
	//
	// GET *
	//
	// -------------------------------------------------------------------------
	one : function (q, f, p) {
		if (p) this.populate = p;
		q = q || {};
		q = _.extend ({}, this.baseQ, q);
		f = f || {};
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findOne (q, f)
			.then (self.permissions)
			.then (self.decorate)
			.then (self.sanitizeData)
			.then (resolve, self.complete (reject, 'one'));
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
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findMany (q, f)
				.then (self.permissions)
				.then (self.decorateAll)
				.then (self.sanitizeData)
				.then (resolve, self.complete (reject, 'listwrite'));
		});
	},
	listforaccess : function (access, q, f, p) {
		if (p) this.populate = p;
		q = q || {};
		this.setAccessOnce (access);
		q = _.extend ({}, this.baseQ, q);
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findMany (q, f)
				.then (self.permissions)
				.then (self.decorateAll)
				.then (self.sanitizeData)
				.then (resolve, self.complete (reject, 'listforaccess'));
		});
	},
	listIgnoreAccess: function(q, f, p) {
		if (p) this.populate = p;
		q = q || {};
		this.setAccessOnce ('ignoring the access permissions, object may not have the correct ones yet...');
		q = _.extend ({}, this.baseQ, q);
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findMany (q, f)
			.then (self.permissions)
			.then (self.decorateAll)
			.then (self.sanitizeData)
			.then (resolve, self.complete (reject, 'listIgnoreAccess'));
		});
	},
	oneIgnoreAccess : function (q, f, p) {
		if (p) this.populate = p;
		q = q || {};
		this.setAccessOnce ('ignoring the access permissions, object may not have the correct ones yet...');
		q = _.extend ({}, this.baseQ, q);
		f = f || {};
		var self = this;
		return new Promise (function (resolve, reject) {
			self.findOne (q, f)
			.then (self.permissions)
			.then (self.decorate)
			.then (self.sanitizeData)
			.then (resolve, self.complete (reject, 'oneIgnoreAccess'));
		});
	},
	
	// -------------------------------------------------------------------------
	//
	// lets decide to save some time debugging and just finally overload this puppy
	//
	// -------------------------------------------------------------------------
	complete : function (reject, funct) {
		return function (err) {
			console.log('dbmodel.'+funct+': '+err.message);
			reject (new Error ('dbmodel.'+funct+': '+err.message));
		};
	},

	paginate: function(query, filter, skip, limit, fields, population, sortby, userCan) {
		//console.log ('paginate(query=', query, ', filter=', filter, ', skip=', skip, ', limit=', limit, ', fields=', fields, ', population=', population, ', sortby=', sortby, ', userCan=', userCan, ')');
		var debug = false;
		var sort = sortby || this.sort;
		var populate = population || this.populate;
		var decoratePermissions = this.decorateCollection;
		var and = filter || {};

		this.decorateCollection = userCan ? true : false;

		var self = this;
		query = query || {};

		return new Promise (function (resolve, reject) {
			if (self.err) return reject (self.err);
			var q = _.extend ({}, self.baseQ, query);
			if(debug) {
				console.log('paginate.q = ' + JSON.stringify(q, null, 4));
				console.log('paginate.and = ' + JSON.stringify(and, null, 4));
				console.log('paginate.sort = ' + JSON.stringify(sort, null, 4));
				console.log('paginate.skip = ' + skip);
				console.log('paginate.limit = ' + limit);
				console.log('paginate.populate = ' + JSON.stringify(populate, null, 4));
				console.log('paginate.fields = ' + JSON.stringify(fields, null, 4));
				console.log('paginate.decorateCollection = ' + self.decorateCollection);
			}
			self.model.find(q)
				.and(and)
				.sort(sort)
				.skip(skip)
				.limit(limit)
				.populate(populate)
				.select(fields)
				.exec(function(error, data) {
					if (!error) {
						self.model.find(q).and(and).count(function(e,c) {
							if (e) {
								console.log('search.count.error = ' + JSON.stringify(e));
								self.complete(reject, 'search');
							} else {
								if (debug) console.log('search.count.completed. total = ', c);
								self.sanitizeData(data)
								.then(function (sanitizedData) {
									resolve({data: sanitizedData, count: c});
								});
							}
						});
					} else {
						console.log('search.error = ' + JSON.stringify(error));
						self.complete(reject, 'search');
					}
				});

			if (self.resetAccess) {
				self.resetAccess = false;
				self.setAccess ('read');
			}

			self.decorateCollection = decoratePermissions;
		});
	},

	search: function (searchFields, options) {
		var self = this;
		var debug = true;
		var limit = (options.limit || 10)  * 1;
		var skip = (options.start || 0) * 1;
		var orderBy = null;
		var projectId = options.projectId;
		var searchText = options.searchText;
		if (options.orderBy) {
			orderBy = {};
			orderBy[options.orderBy] = options.direction ? options.direction: '';
		}
		/*
		A note about potential performance issues. The second largest collection in the system is the documents collection.
		As of May 2017 this collections contains under 60K records. If queries are done by project the project with the most documents has under 3K.
		 */
		return new Promise (function (resolve, reject) {
			if (self.err) return reject (self.err);
			var terms = SearchUtil.convertTextToTerms(searchText);
			if (terms.searchTerms.length === 0  && terms.excludeTerms.length === 0) {
				return reject("Search requires searchText");
			}
			var query = SearchUtil.composeQuery(projectId, terms, searchFields);
			query = _.extend (query, self.baseQ );
			//console.log("search call custom", query);
			self.model.find(query)
				.exec(function(error, data) {
					if (!error) {
						var cnt = data.length;
						var sorted =  _.sortBy(data, function(item) {
							return -1 * SearchUtil.relevanceRanking(item, terms.searchTerms, searchFields);
						});

						// paginate ...
						sorted = sorted.slice(skip, skip + limit);

						// return the paginated results with the total count
						self.sanitizeData(sorted)
						.then(function (sanitizedData) {
							resolve({data: sanitizedData, count: cnt});
						});
					} else {
						console.log('search.error = ' + JSON.stringify(error));
						self.complete(reject, 'search');
					}
				});
		});
	}
});

module.exports = DBModel;


