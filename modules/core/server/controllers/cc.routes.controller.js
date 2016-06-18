'use strict';

var _ = require ('lodash');
var access = require ('./cc.access.controller');

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
var failure = function (res) {
	return function (err) {
		sendErrorMessage (res, getErrorMessage (err));
	};
};
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

exports.streamFile = function (res, file, name, mime) {
	var fs   = require('fs');
	fs.exists (file, function (yes) {
		if (!yes) sendNotFound (res);
		else {
			res.setHeader ('Content-Type', mime);
			res.setHeader ("Content-Disposition", 'attachment; filename='+name);
			fs.createReadStream (file).pipe (res);
		}
	});
};

// exports.sendError        = sendError;
// exports.sendErrorMessage = sendErrorMessage;
// exports.sendNotFound     = sendNotFound;
// exports.sendData         = sendData;
// exports.queryResponse    = queryResponse;
// exports.getErrorMessage  = getErrorMessage;

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
		//
		// new session context
		//
		if (!req.session.context) {
			req.session.context = 'you aint my buddy guy';
		}
		var opts = {
			user      : req.user,
			userRoles : req.session.userRoles,
			context   : req.session.context
		};
		console.log ('existing user context = ', opts);
		if (req.cookies.context) {
			console.log ('-- received context', req.cookies.context);
			//
			// new context: initialize user roles for this
			// context and set a flag accordingly
			//
			if (req.session.context !== req.cookies.context) {
				console.log ('-- context changed from', req.session.context, ' to ', req.cookies.context);
				req.session.context = req.cookies.context;
				access.getAllUserRoles ({
					context : req.session.context,
					user    : req.user ? req.user.username : null
				})
				.then (function (roles) {
					req.session.userRoles = roles;
					console.log ('-- new user roles = ', req.session.userRoles);
					opts.userRoles = req.session.userRoles ;
					opts.context   = req.session.context   ;
					resolve (opts);
				});
			}
			else {
				console.log ('-- context unchanged, using existing');
				resolve (opts);
			}
		}
		else {
			console.log ('-- no context passed in, using old');
			resolve (opts);
		}
	});
};
// -------------------------------------------------------------------------
//
// this takes in a dbmodel class and makes it new and sets it on the request
// just like any good middleware would. it ensures that the contextual
// session stuff happens and passes all the correct stuff into the new
// model so that the user has the correct security context
//
// -------------------------------------------------------------------------
var setModel = function (Dbclass) {
	return function (req, res, next) {
		console.log ('++++++++ this route is running');
		setSessionContext (req)
		.then (function (opts) {
			console.log ('in setModel, setting model with options ', opts);
			req.Model = new Dbclass (opts);
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
// a standard way of setting crud routes.
// basename is the uri token: /api/basename/:basename
// DBClass is the database model as extended from DBModel
// policy is the policy of course (the simplified one)
//
// if only certain routes are to be opened, specify them in the which array
//
// -------------------------------------------------------------------------
exports.setCRUDRoutes = function (app, basename, DBClass, policy, which) {
	var r = {};
	which = which || ['getall', 'get', 'post', 'put', 'delete', 'new', 'query'];
	which.map (function (p) { r[p]=true; });
	//
	// middleware to auto-fetch parameter
	//
	app.param (basename, function (req, res, next, id) {
		setSessionContext (req)
		.then (function (opts) {
			return (new DBClass (opts)).findById (id);
		})
		.then (function (model) {
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
	if (r.query) app.route ('/api/query/'+basename)
		.all (policy ({all:'user',get:'guest'}))
		.all (setModel (DBClass))
		.put (runModel (function (model, req) {
			return model.list (req.data);
		}))
		.get(runModel (function (model, req) {
			var q = JSON.parse(JSON.stringify(req.query));
			return model.list(q);
		}));
	if (r.getall) app.route ('/api/'+basename)
		.all (policy ({all:'user',get:'guest'}))
		.all (setModel (DBClass))
		.get  (runModel (function (model, req) {
			console.log ('++++++++ getall route is running');
			return model.list ();
		}));
	if (r.getall) app.route ('/api/write/'+basename)
		.all (policy ({all:'user'}))
		.all (setModel (DBClass))
		.get  (runModel (function (model, req) {
			return model.listwrite ();
		}));
	if (r.post) app.route ('/api/'+basename)
		.all (policy ({all:'user',get:'guest'}))
		.all (setModel (DBClass))
		.post (runModel (function (model, req) {
			return model.create (req.body);
		}));
	//
	// model routes
	//
	if (r.get) app.route ('/api/'+basename+'/:'+basename)
		.all (policy ({all:'user',get:'guest'}))
		.all (setModel (DBClass))
		.get    (runModel (function (model, req) {
			return model.read(req[DBClass.prototype.name]);
		}));
	if (r.put) app.route ('/api/'+basename+'/:'+basename)
		.all (policy ({all:'user',get:'guest'}))
		.all (setModel (DBClass))
		.put    (runModel (function (model, req) {
			return model.update(req[DBClass.prototype.name], req.body);
		}));
	if (r.delete) app.route ('/api/'+basename+'/:'+basename)
		.all (policy ({all:'user',get:'guest'}))
		.all (setModel (DBClass))
		.delete (runModel (function (model, req) {
			return model.delete(req[DBClass.prototype.name]);
		}));
	if (r.new) app.route ('/api/new/'+basename)
		.all (policy ({all:'user',get:'guest'}))
		.all (setModel (DBClass))
		.get (runModel (function (model, req) {
			return model.new();
		}));
};


