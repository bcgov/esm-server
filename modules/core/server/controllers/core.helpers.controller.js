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


var sendError = function (res, err) {
	return res.status(400).send ({
		message: getErrorMessage (err)
	});
};
var sendNotFound = function (res, message) {
	return res.status(404).send ({
		message: message || 'Not Found'
	});
};
var sendErrorMessage = function (res, message) {
	return res.status(400).send ({
		message: message
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


exports.sendError        = sendError;
exports.sendErrorMessage = sendErrorMessage;
exports.sendNotFound     = sendNotFound;
exports.sendData         = sendData;
exports.queryResponse    = queryResponse;
exports.getErrorMessage  = getErrorMessage;

exports.fillConfigObject = function (object, query, callback) {
  var mongoose    = require ('mongoose');
  var Project     = mongoose.model ('Project');
  var Stream      = mongoose.model ('Stream');
  var Phase       = mongoose.model ('Phase')       ;
  var Activity    = mongoose.model ('Activity')    ;
  var Task        = mongoose.model ('Task')        ;
  var Milestone   = mongoose.model ('Milestone')   ;
  var Bucket      = mongoose.model ('Bucket')      ;
  var Requirement = mongoose.model ('Requirement') ;
  var BucketRequirement = mongoose.model ('BucketRequirement') ;
  object.activities   = [];
  object.buckets      = [];
  object.milestones   = [];
  object.phases       = [];
  object.requirements = [];
  object.tasks        = [];
  Activity.find (query).exec ()
  .then (function (result) {
    if (result) object.activities   = result || [];
    return Bucket.find (query).exec ();
  })
  .then (function (result) {
    if (result) object.buckets      = result || [];
    return Milestone.find (query).exec ();
  })
  .then (function (result) {
    if (result) object.milestones   = result || [];
    return Phase.find (query).exec ();
  })
  .then (function (result) {
    if (result) object.phases       = result || [];
    return Requirement.find (query).exec ();
  })
  .then (function (result) {
    if (result) object.requirements = result || [];
    return Task.find (query).exec ();
  })
  .then (function (result) {
    if (result) object.tasks        = result || [];
    return BucketRequirement.find (query).exec ();
  })
  .then (function (result) {
    if (result) object.bucketrequirements = result || [];
  })
  .then (function () {
    callback (null, object);
    return;
  })
  .then (undefined, function (err) {
    callback (err);
    return;
  });
};


// -------------------------------------------------------------------------
//
// checks against acl to see if the path is permitted for the users roles
// the only real roles that matter are admin, user, guest. admin gets all
// user is set and guest is set. policies may implement special path
// permissions
//
// -------------------------------------------------------------------------
exports.isAllowed = function (acl) {
  return function (req, res, next) {
    var roles = (req.user) ? req.user.roles : ['admin'];
    //
    // if the user is an admin just let it through,
    //
    if (_.indexOf (roles, 'admin') >= 0) return next ();
    acl.areAnyRolesAllowed (roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
      if (err) {
        // An authorization error occurred.
        return res.status(500).send('Unexpected authorization error');
      } else {
        if (isAllowed) {
          // Access granted! Invoke next middleware
          return next();
        } else {
          return res.status(403).json({
            message: 'User is not authorized'
          });
        }
      }
    });
  };
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
    '/api/new/'+base
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
  if (userlist.length) acl.allow ('user', userlist, '*');
  if (guestlist.length) acl.allow ('guest', guestlist, '*');
};




