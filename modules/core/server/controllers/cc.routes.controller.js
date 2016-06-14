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
		(new DBClass (req)).findById(id)
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
	if (r.query) app.route ('/api/query/'+basename).all (policy ({all:'user',get:'guest'}))
		.put (function (req, res) {
			runPromise (res, (new DBClass (req)).list (req.data));
		})
		.get(function(req, res) {
			var q = JSON.parse(JSON.stringify(req.query));
			runPromise (res, (new DBClass (req)).list(q));
		});
	if (r.getall) app.route ('/api/'+basename).all (policy ({all:'user',get:'guest'}))
		.get  (function (req, res) {
			console.log ('++++++++ getall route is running');
			runPromise (res, (new DBClass (req)).list ());
		});
	if (r.getall) app.route ('/api/write/'+basename).all (policy ({all:'user'}))
		.get  (function (req, res) {
			runPromise (res, (new DBClass (req)).listwrite ());
		});
	if (r.post) app.route ('/api/'+basename).all (policy ({all:'user',get:'guest'}))
		.post (function (req, res) {
			runPromise (res, (new DBClass (req)).create (req.body));
		});
	//
	// model routes
	//
	if (r.get) app.route ('/api/'+basename+'/:'+basename).all (policy ({all:'user',get:'guest'}))
		.get    (function (req, res) {
			runPromise (res, (new DBClass (req)).read(req[DBClass.prototype.name]));
		});
	if (r.put) app.route ('/api/'+basename+'/:'+basename).all (policy ({all:'user',get:'guest'}))
		.put    (function (req, res) {
			runPromise (res, (new DBClass (req)).update(req[DBClass.prototype.name], req.body));
		});
	if (r.delete) app.route ('/api/'+basename+'/:'+basename).all (policy ({all:'user',get:'guest'}))
		.delete (function (req, res) {
			runPromise (res, (new DBClass (req)).delete(req[DBClass.prototype.name]));
		});
	if (r.new) app.route ('/api/new/'+basename).all (policy ({all:'user',get:'guest'}))
		.get (function (req, res) {
			runPromise (res, (new DBClass (req)).new());
		});

};

exports.setModel = function (Dbclass) {
	return function (req, res, next) {
		req.Model = new Dbclass (req);
		next ();
	};
};
exports.runModel = function (f) {
	return function (req, res, next) {
		return runPromise (res, f (req.Model, req));
	};
};


