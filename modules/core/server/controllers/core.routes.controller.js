'use strict';

var _ = require ('lodash');
var access = require ('./core.access.controller');
var fs = require ('fs');
var path = require('path');

/**
 * Get unique error field name
 */
var getUniqueErrorMessage = function (err) {
	var output;

	try {
		var fieldName = err.errmsg.substring(err.errmsg.lastIndexOf('.$') + 2, err.errmsg.lastIndexOf('_1'));
		output = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' already exists';

	} catch (ex) {
		output = 'Unique field already exists';
	}

	return output;
};

/**
 * Get the error message from error object
 */
var getErrorMessage = function (err) {
	var message = '';

	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message = getUniqueErrorMessage(err);
				break;
			default:
				message = 'Something went wrong';
		}
	}
	else if (err.errors) {
		for (var errName in err.errors) {
			if (err.errors[errName].message) {
				message = err.errors[errName].message;
			}
		}
	}
	else if (err.message) {
		message = err.message;
	}
	else {
		message = err;
	}

	return message;
};


var sendErrorMessage = function (res, message) {
	// console.log (message);
	return res.status(400).send ({
		message: message
	});
};
var sendError = function (res, err) {
	sendErrorMessage (res, getErrorMessage (err));
};
var sendNotFound = function (res, message) {
	// console.log ('not found:' + message);
	return res.status(404).send ({
		message: message || 'Not Found'
	});
};
var sendData = function (res, model) {
	res.json (model);
};

var queryResponse = function (res) {
	return function (err, model) {
		return err ? sendError (res, err) : sendData (res, model);
	};
};

// -------------------------------------------------------------------------
//
// promise type success and fail
//
// -------------------------------------------------------------------------
var success = function (res) {
	return function (result) {
		res.json (result);
	};
};
exports.success = success;
var failure = function (res) {
	return function (err) {
		sendErrorMessage (res, getErrorMessage (err));
	};
};
exports.failure = failure;
var runPromise = function (res, p) {
	p.then (success(res), failure(res));
};
exports.runPromise = runPromise;

exports.getMimeTypeFromFileName = function (filename) {
	switch ((/(\.\w*)$/.exec(filename))[1]) {
		case '.avi':
		break;
		default:
			return 'application/pdf';
	}
};

exports.streamFile = function (res, opts) {
	var fs = require('fs');
	fs.exists (opts.file, function (yes) {
		if (!yes) sendNotFound (res);
		else {
			res.setHeader ('Content-Type', opts.mime);
			res.setHeader ("Content-Disposition", 'attachment; filename="'+opts.name+'"');
			fs.createReadStream (opts.file).pipe (res);
		}
	});
};
var directoryExists = function (dir) {
	return new Promise (function (resolve, reject) {
		fs.exists (dir, function (v) {resolve (v);});
	});
};
var createDirectory = function (dir) {
	return new Promise (function (resolve, reject) {
		fs.mkdir (dir, function () {resolve (dir);});
	});
};
var ensureDirectory = function (dir) {
	return directoryExists (dir)
	.then (function (yes) {
		if (!yes) return createDirectory (dir);
		else return dir;
	});
};
var mv = function (o, n) {
	return new Promise (function (resolve, reject) {
		fs.rename (o, n, function (err) {
			if (err) return reject (err);
			resolve (n);
		});
	});
};
exports.moveFile = function (opts, callback) {
	var oldDirectory = path.dirname (opts.oldPath);
	var newDirectory = oldDirectory + path.sep + opts.projectCode;
	var newPath      = newDirectory + path.sep + path.basename (opts.oldPath);
	return ensureDirectory (newDirectory)
	.then (function () {
		return mv (opts.oldPath, newPath);
	});
};

// -------------------------------------------------------------------------
//
// this deals with all the mess of setting the context, user, roles, etc in
// the session and thereby avoids having to constantly retrive them
// Basically, if the context changes, retrieve the user's contextual roles
// and place them in the session.  Otherwise, just get the current ones
// from the sesion and resolve with those
//
// -------------------------------------------------------------------------
var setSessionContext = function (req) {
	return new Promise (function (resolve, reject) {
		//console.log ('> setSessionContext');
		//console.log ('  session.context = ', req.session.context);
		//console.log ('  cookies.context = ', req.cookies.context);
		//
		// new session context
		//
		if (!req.session.context) {
			//console.log ('  no session context');
			req.session.context = 'you aint my buddy guy';
		}
		if (req.session.userRoles === undefined) {
			//console.log("Someone didn't set a role properly, so lets assume they have at least the public role.");
			req.session.userRoles = ['public'];
		}
		var opts = {
			user      : req.user,
			userRoles : req.session.userRoles,
			context   : req.session.context
		};
		if (req.cookies.context) {
			//
			// new context: initialize user roles for this
			// context and set a flag accordingly
			//
			if (req.session.context !== req.cookies.context) {
				//console.log ('  context changed from', req.session.context, ' to ', req.cookies.context);
				req.session.context = req.cookies.context;
				//console.log ('  collect new contextual user roles...');
				access.getAllUserRoles ({
					context : req.session.context,
					user    : req.user ? req.user.username : null
				})
				.then (function (roles) {
					req.session.userRoles = roles;
					//console.log ('  new contextual user roles = ', JSON.stringify(req.session.userRoles));
					opts.userRoles = req.session.userRoles;
					opts.context   = req.session.context;
					//console.log ('< setSessionContext (context changed, session roles updated) opts = ', JSON.stringify(opts));
					resolve (opts);
				});
			}
			else {
				//console.log ('< setSessionContext (context unchanged, use existing) opts = ', JSON.stringify(opts));
				resolve (opts);
			}
		}
		else {
			//console.log ('< setSessionContext (no context, use existing) opts = ', JSON.stringify(opts));
			resolve (opts);
		}
	});
};
exports.setSessionContext = setSessionContext;
// -------------------------------------------------------------------------
//
// this takes in a dbmodel class and makes it new and sets it on the request
// just like any good middleware would. it ensures that the contextual
// session stuff happens and passes all the correct stuff into the new
// model so that the user has the correct security context
//
// -------------------------------------------------------------------------
var setModel = function (Dbclass, name) {
	name = name || 'Model';
	return function (req, res, next) {
		setSessionContext (req)
		.then (function (opts) {
			req[name] = new Dbclass (opts);
			next ();
		});
	};
};
exports.setModel = setModel;
// -------------------------------------------------------------------------
//
// this is a nice shorthard for working with the dbmodel set on the request
// it simply takes the result of whatever function is passed into it and
// runs it as a promise.
// the function called must have the signature:
// function (model, request) { return promise; }
//
// -------------------------------------------------------------------------
var runModel = function (f) {
	return function (req, res, next) {
		return runPromise (res, f (req.Model, req));
	};
};
exports.runModel = runModel;

// -------------------------------------------------------------------------
//
// this does a combo of the previous two. it takes the dbmodel and the
// function to call at the same time and does both jobs. It does NOT decorate
// the request however.
//
// -------------------------------------------------------------------------
var setAndRun = function (Dbclass, f) {
	return function (req, res, next) {
		setSessionContext (req)
		.then (function (opts) {
			runPromise (res, f (new Dbclass (opts), req));
		});
	};
};
exports.setAndRun = setAndRun;


var setContextAndRun = function (Dbclass, context, f) {
	return function (req, res, next) {
		console.log('# setContextAndRun(context = ' + context +' )');
		req.cookies.context = context;
		setSessionContext (req)
			.then (function (opts) {
				runPromise (res, f (new Dbclass (opts), req));
			});
	};
};
exports.setContextAndRun = setContextAndRun;

var setRequestContextAndRun = function (Dbclass, paramname, f) {
	return function (req, res, next) {
		console.log('# setRequestContextAndRun(param = { name:' + paramname +', value:' + req.params[paramname] + ' } )');
		req.cookies.context = req.params[paramname];
		setSessionContext (req)
			.then (function (opts) {
				runPromise (res, f (new Dbclass (opts), req));
			});
	};
};
exports.setRequestContextAndRun = setRequestContextAndRun;

var resetSessionContext = function () {
	return function (req, res, next) {
		req.session.context = undefined;
		setSessionContext (req)
			.then (function (opts) {
				runPromise (res, Promise.resolve(opts));
			});
	};
};
exports.resetSessionContext = resetSessionContext;


// -------------------------------------------------------------------------
//
// a standard way of setting crud routes.
// basename is the uri token: /api/basename/:basename
// DBClass is the database model as extended from DBModel
// policy is the policy of course (the simplified one)
//
// if only certain routes are to be opened, specify them in the which array
//
// -------------------------------------------------------------------------
exports.setCRUDRoutes = function (app, basename, DBClass, policy, which, policymap) {
	var r = {};
	which = which || ['getall', 'get', 'post', 'put', 'delete', 'new', 'query', 'paginate'];
	which.map (function (p) { r[p]=true; });
	policymap = policymap || {all:'user',get:'guest',paginate:'guest'};
	//
	// middleware to auto-fetch parameter
	//
	app.param (basename, function (req, res, next, id) {
		setSessionContext (req)
		.then (function (opts) {
			return (new DBClass (opts)).findById (id);
		})
		.then (function (model) {
			if (!model) {
				console.log("__0xBADC0DE__");
			}
			if (!model) return sendNotFound (res, DBClass.prototype.name+' not found');
			req[DBClass.prototype.name] = model;
			next ();
		})
		.catch (function (err) {
			return next (err);
		});
	});
	//
	// collection routes
	//
	if (r.paginate) app.route('/api/paginate/'+basename)
		.all(policy(policymap))
		.put (setAndRun (DBClass, function (model, req) {
			var query = {};
			var filter = {};
			var skip = 0;
			var limit = 100;
			var sortby = {};

			// fields, populate, and userCan aren't specific to table params
			var fields = null;
			var populate = null;
			var userCan = false;

			if (req.body) {
				if (req.body.filterBy) {
					query = req.body.filterBy;
				}
				if (req.body.filterByFields) {
					for (var key in req.body.filterByFields) {
						if (req.body.filterByFields.hasOwnProperty(key)) {
							filter[key] = req.body.filterByFields[key];
							console.log(filter);
						}
					}
				}
				try {
					limit = parseInt(req.body.limit);
					skip = parseInt(req.body.start);
				} catch(e) {

				}
				if (req.body.orderBy) {
					sortby[req.body.orderBy] = req.body.reverse ? -1 : 1;
				}
				if (req.body.fields) {
					fields = req.body.fields;
				}
				if (req.body.populate) {
					populate = req.body.populate;
				}
				if (req.body.userCan) {
					userCan = req.body.userCan;
				}
			}
			//query, skip, limit, fields, population, sortby, userCan
			return model.paginate (query, filter, skip, limit, fields, populate, sortby, userCan);
		}));
	if (r.query) app.route ('/api/query/'+basename)
		.all (policy (policymap))
		.put (setAndRun (DBClass, function (model, req) {
			return model.list (req.data);
		}))
		.get (setAndRun (DBClass, function (model, req) {
			var q = JSON.parse(JSON.stringify(req.query));
			return model.list(q);
		}));
	if (r.getall) app.route ('/api/'+basename)
		.all (policy (policymap))
		.get  (setAndRun (DBClass, function (model, req) {
			return model.list ({}, "-directoryStructure");
		}));
	if (r.getall) app.route ('/api/write/'+basename)
		.all (policy ({all:'user'}))
		.get  (setAndRun (DBClass, function (model, req) {
			return model.listwrite ();
		}));
	if (r.getall) app.route ('/api/sorted/'+basename)
		.all (policy (policymap))
		.put (setAndRun (DBClass, function (model, req) {
			var sort = !_.isEmpty(req.body) ? req.body.sort : {};
			return model.list ({}, "-directoryStructure", sort);
		}))
		.get  (setAndRun (DBClass, function (model, req) {
			var s = JSON.parse(JSON.stringify(req.query));
			var sort = s.sort || '';
			return model.list ({}, "-directoryStructure", sort);
		}));
	if (r.post) app.route ('/api/'+basename)
		.all (policy (policymap))
		.post (setAndRun (DBClass, function (model, req) {
			return model.create (req.body);
		}));
	//
	// model routes
	//
	if (r.get) app.route ('/api/'+basename+'/:'+basename)
		.all (policy (policymap))
		.get    (setAndRun (DBClass, function (model, req) {
			return model.read(req[DBClass.prototype.name]);
		}));
	if (r.put) app.route ('/api/'+basename+'/:'+basename)
		.all (policy (policymap))
		.put    (setAndRun (DBClass, function (model, req) {
			return model.update(req[DBClass.prototype.name], req.body);
		}));
	if (r.delete) app.route ('/api/'+basename+'/:'+basename)
		.all (policy (policymap))
		.delete (setAndRun (DBClass, function (model, req) {
			return model.delete(req[DBClass.prototype.name]);
		}));
	if (r.new) app.route ('/api/new/'+basename)
		.all (policy (policymap))
		.get (setAndRun (DBClass, function (model, req) {
			return model.new();
		}));
};


