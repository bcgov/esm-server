'use strict';

var _ = require ('lodash');

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
exports.successFunction = success;
exports.success         = success;
var failure = function (res) {
	return function (err) {
		sendErrorMessage (res, getErrorMessage (err));
	};
};
exports.errorFunction = failure;
exports.failure       = failure;
exports.runPromise = function (res, p) {
	p.then (success(res), failure(res));
};

var getMimeTypeFromFileName = function (filename) {
	switch ((/(\.\w*)$/.exec(filename))[1]) {
		case '.avi':
		break;
		default:
			return 'application/pdf';
	}
};

var streamFile = function (res, file, name, mime) {
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

// var uri = url.parse(request.url).pathname;
//  var filename = libpath.join(path, uri);

//  libpath.exists(filename, function (exists) {
//  if (!exists) {
//    console.log('404 File Not Found: ' + filename);
//    response.writeHead(404, {
//      "Content-Type": "text/plain"
//    });
//    response.write("404 Not Found\n");
//    response.end();
//    return;
//  } else{
//    console.log('Starting download: ' + filename);
//    var stream = fs.createReadStream(filename, { bufferSize: 64 * 1024 });
//    stream.pipe(response);
//   }
//  });
exports.sendError        = sendError;
exports.sendErrorMessage = sendErrorMessage;
exports.sendNotFound     = sendNotFound;
exports.sendData         = sendData;
exports.queryResponse    = queryResponse;
exports.getErrorMessage  = getErrorMessage;
exports.streamFile       = streamFile;
exports.getMimeTypeFromFileName = getMimeTypeFromFileName;

// exports.fillConfigObject = function (object, query, callback) {
//   var mongoose    = require ('mongoose');
//   var Project     = mongoose.model ('Project');
//   var Stream      = mongoose.model ('Stream');
//   var Phase       = mongoose.model ('Phase')       ;
//   var Activity    = mongoose.model ('Activity')    ;
//   var Task        = mongoose.model ('Task')        ;
//   var Milestone   = mongoose.model ('Milestone')   ;
//   var Bucket      = mongoose.model ('Bucket')      ;
//   var Requirement = mongoose.model ('Requirement') ;
//   var BucketRequirement = mongoose.model ('BucketRequirement') ;
//   object.streams      = [];
//   object.activities   = [];
//   object.buckets      = [];
//   object.milestones   = [];
//   object.phases       = [];
//   object.requirements = [];
//   object.tasks        = [];
//   Activity.find (query).populate('tasks').exec ()
//   .then (function (result) {
//     if (result) object.activities   = result || [];
//     return Bucket.find (query).exec ();
//   })
//   .then (function (result) {
//     if (result) object.buckets      = result || [];
//     return Stream.find (query).populate('phases').exec ();
//   })
//   .then (function (result) {
//     if (result) object.streams      = result || [];
//     return Milestone.find (query).populate('activities').exec ();
//   })
//   .then (function (result) {
//     if (result) object.milestones   = result || [];
//     return Phase.find (query).populate('milestones').exec ();
//   })
//   .then (function (result) {
//     if (result) object.phases       = result || [];
//     return Requirement.find (query).exec ();
//   })
//   .then (function (result) {
//     if (result) object.requirements = result || [];
//     return Task.find (query).exec ();
//   })
//   .then (function (result) {
//     if (result) object.tasks        = result || [];
//     return BucketRequirement.find (query).exec ();
//   })
//   .then (function (result) {
//     if (result) object.bucketrequirements = result || [];
//   })
//   .then (function () {
//     callback (null, object);
//     return;
//   })
//   .then (undefined, function (err) {
//     callback (err);
//     return;
//   });
// };

var userRoles = function (user) {
	var roles = (user) ? user.roles : [];
	roles.push ('public');
	return roles;
};
exports.userRoles = userRoles;
var userPermissions = function (thing, userRoles) {
	return {
		read   : ( (_.intersection (userRoles, thing.read)).length > 0),
		write  : ( (_.intersection (userRoles, thing.write)).length > 0),
		submit : ( (_.intersection (userRoles, thing.submit)).length > 0),
		watch  : ( (_.intersection (userRoles, thing.watch)).length > 0)
	};
};
exports.userPermissions = userPermissions;
exports.userCan = function (user, permission, thing) {
	var roles = userRoles (user);
	if (_.indexOf (roles, 'admin') >= 0) return true;
	var permissions = userPermissions (thing, roles);
	return (permissions[permission]) ? true : false;
};


// -------------------------------------------------------------------------
//
// checks against acl to see if the path is permitted for the users roles
// the only real roles that matter are admin, user, guest. admin gets all,
// user is set and guest is set. policies may implement special path
// permissions
//
// -------------------------------------------------------------------------
var returnOk = function (ok, res, next) {
	return ok ? next () : res.status(403).json ({ message: 'User is not authorized' });
};
exports.isAllowed = function (acl, dbg) {
	return function (req, res, next) {
		var roles = (req.user) ? req.user.roles : ['guest'];
		//
		// if the user is an admin just let it through,
		//
		if (_.indexOf (roles, 'admin') >= 0) return next ();
		acl.areAnyRolesAllowed (roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
			if (err) {
				// An authorization error occurred.
				return res.status(500).send('Unexpected authorization error');
			} else {
				return returnOk (isAllowed, res, next);
				// if (isAllowed) {
				// 	// Access granted! Invoke next middleware
				// 	return next();
				// } else {
				// 	// console.log ('\n ++ the user was denied '+req.route.path+' '+req.method.toLowerCase()+'\n');
				// 	return res.status(403).json({
				// 		message: 'User is not authorized'
				// 	});
				// }
			}
		});
	};
};

exports.isAuthenticated = function (req, res, next) {
	return returnOk (!!req.user, res, next);
};
exports.isAdmin = function (req, res, next) {
	return returnOk ((!!req.user && _.indexOf (req.user.roles, 'admin')), res, next);
};
exports.isPublic = function (req, res, next) {
	return next ();
};


// -------------------------------------------------------------------------
//
// a standard way of setting crud routes.
// basename is the uri token: /api/basename/:basename
// DBClass is the database model as extended from DBModel
// policy is the policy of course
// which denotes which routes to open, if not specified it defaults to all
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
		var o = new DBClass (req.user);
		o.findById(id)
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
	if (r.query) app.route ('/api/query/'+basename).all (policy.isAllowed)
		.put (function (req, res) {
			var o = new DBClass (req.user);
			o.list (req.data)
			.then (success(res), failure(res));
		})
		.get(function(req, res) {
			var o = new DBClass (req.user);
			var q = JSON.parse(JSON.stringify(req.query));
			o.list(q)
				.then(success(res), failure(res));
		});
	if (r.getall) app.route ('/api/'+basename).all (policy.isAllowed)
		.get  (function (req, res) {
			var o = new DBClass (req.user);
			o.list ({}, "-directoryStructure")
			.then (success(res), failure(res));
		});
	if (r.getall) app.route ('/api/write/'+basename).all (policy.isAllowed)
		.get  (function (req, res) {
			var o = new DBClass (req.user);
			o.listwrite ()
			.then (success(res), failure(res));
		});
	if (r.post) app.route ('/api/'+basename).all (policy.isAllowed)
		.post (function (req, res) {
			var o = new DBClass (req.user);
			o.create (req.body)
			.then (success(res), failure(res));
		});
	//
	// model routes
	//
	if (r.get) app.route ('/api/'+basename+'/:'+basename).all (policy.isAllowed)
		.get    (function (req, res) {
			var o = new DBClass (req.user);
			o.read(req[DBClass.prototype.name])
			.then (success(res), failure(res));
		});
	if (r.put) app.route ('/api/'+basename+'/:'+basename).all (policy.isAllowed)
		.put    (function (req, res) {
			var o = new DBClass (req.user);
			o.update(req[DBClass.prototype.name], req.body)
			.then (success(res), failure(res));
		});
	if (r.delete) app.route ('/api/'+basename+'/:'+basename).all (policy.isAllowed)
		.delete (function (req, res) {
			var o = new DBClass (req.user);
			o.delete(req[DBClass.prototype.name])
			.then (success(res), failure(res));
		});
	if (r.new) app.route ('/api/new/'+basename).all (policy.isAllowed)
		.get (function (req, res) {
			var o = new DBClass (req.user);
			o.new()
			.then (success(res), failure(res));
		});

};

// -------------------------------------------------------------------------
//
// shorthand to set the default crud permisions. admin, all, user, all, guest
// read only, not new. specific filetering needs to be done on the objects
// themselves, this is only the path
//
// -------------------------------------------------------------------------
exports.setCRUDPermissions = function (acl, base) {
	acl.allow ('user', [
		'/api/'+base,
		'/api/'+base+'/:'+base,
		'/api/new/'+base,
		'/api/write/'+base,
		'/api/query/'+base
		],
		'*'
	);
	acl.allow ('guest', [
		'/api/'+base,
		'/api/'+base+'/:'+base
		],
		'get'
	);
};

// -------------------------------------------------------------------------
//
// set up basic permissions on a set of paths. user gets all and we expect
// special filtering of permissions on specific objects, guest only
// ever gets read only
// list is formatted like so:
// [
//    [ guest, user, path ],  where guest and user are truthy
// ]
//
// -------------------------------------------------------------------------
exports.setPathPermissions = function (acl, list) {
	var userlist  = list.map (function (v) { if (v[1]) return v[2]; });
	var guestlist = list.map (function (v) { if (v[0]) return v[2]; });
	// console.log ('userlist:',userlist);
	// console.log ('guestlist:',guestlist);
	if (userlist.length) acl.allow ('user', userlist, '*');
	if (guestlist.length) acl.allow ('guest', guestlist, 'get');
};

exports.extend = function(protoProps, staticProps) {
	var parent = this;
	var child;

	// The constructor function for the new subclass is either defined by you
	// (the "constructor" property in your `extend` definition), or defaulted
	// by us to simply call the parent's constructor.
	if (protoProps && _.has(protoProps, 'constructor')) {
		child = protoProps.constructor;
	} else {
		child = function(){ return parent.apply(this, arguments); };
	}

	// Add static properties to the constructor function, if supplied.
	_.extend(child, parent, staticProps);

	// Set the prototype chain to inherit from `parent`, without calling
	// `parent`'s constructor function.
	var Surrogate = function(){ this.constructor = child; };
	Surrogate.prototype = parent.prototype;
	child.prototype = new Surrogate ();

	// Add prototype properties (instance properties) to the subclass,
	// if supplied.
	if (protoProps) _.extend(child.prototype, protoProps);

	// Set a convenience property in case the parent's prototype is needed
	// later.
	child.__super__ = parent.prototype;

	return child;
};

exports.emptyPromise = function (t) {return new Promise (function (r, e) { r (t); }); };
// exports.emptyPromise = function (t) {return t;};



