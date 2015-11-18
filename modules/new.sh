#!/bin/bash
# echo "Name of module (lowercase) => "
# read NAME
# echo "Plural name (lowercase) => "
# read PLURAL
# echo "Model name (capitalized camel) => "
# read MODEL
NAME=$1
PLURAL=$2
MODEL=$3
echo "Creating module $NAME $PLURAL $MODEL";
mkdir $PLURAL
mkdir $PLURAL/server
mkdir $PLURAL/server/controllers
mkdir $PLURAL/server/policies
mkdir $PLURAL/server/models
mkdir $PLURAL/server/routes

cat > $PLURAL/server/controllers/$NAME.controller.js <<EOFC
'use strict';
// =========================================================================
//
// Controller for $PLURAL
//
// =========================================================================
var path     = require('path');
var mongoose = require ('mongoose');
var CRUD     = require (path.resolve('./modules/core/server/controllers/core.crud.controller'));
var Model    = mongoose.model ('$MODEL');

var crud = new CRUD (Model);
// -------------------------------------------------------------------------
//
// Basic CRUD
//
// -------------------------------------------------------------------------
exports.new    = crud.new    ();
exports.create = crud.create ();
exports.read   = crud.read   ();
exports.update = crud.update ();
exports.delete = crud.delete ();
exports.list   = crud.list   ();
exports.byId   = crud.byId   ();

EOFC

cat > $PLURAL/server/models/$NAME.model.js <<EOFM
'use strict';
// =========================================================================
//
// Model for $PLURAL
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var ${MODEL}Schema  = new Schema ({
	code        : { type:String, default:'code' },
	name        : { type:String, default:'New $NAME' },
	description : { type:String, default:'New $NAME' }
});

var $MODEL = mongoose.model ('$MODEL', ${MODEL}Schema);

module.exports = $MODEL;

EOFM

cat > $PLURAL/server/routes/$NAME.routes.js <<EOFR
'use strict';
// =========================================================================
//
// Routes for $PLURAL
//
// =========================================================================
var policy     = require ('../policies/$NAME.policy');
var controller = require ('../controllers/$NAME.controller');

module.exports = function (app) {
	//
	// collection routes
	//
	app.route ('/api/$NAME').all (policy.isAllowed)
		.get  (controller.list)
		.post (controller.create);
	//
	// model routes
	//
	app.route ('/api/$NAME/:${NAME}Id').all (policy.isAllowed)
		.get    (controller.read)
		.put    (controller.update)
		.delete (controller.delete);
	app.route ('/api/new/$NAME').all (policy.isAllowed)
		.get (controller.new);
	//
	// middleware to auto-fetch parameter
	//
	app.param ('${NAME}Id', controller.byId);
};

EOFR

cat > $PLURAL/server/policies/$NAME.policy.js <<EOFP
'use strict';
// =========================================================================
//
// Policies for $PLURAL
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());

exports.invokeRolesPolicies = function () {
	acl.allow ('admin', [
		'/api/${NAME}',
		'/api/${NAME}/:${NAME}Id',
		'/api/new/${NAME}'
		], '*'
	);
	acl.allow ('guest', [
		'/api/${NAME}',
		'/api/${NAME}/:${NAME}Id',
		'/api/new/${NAME}'
		], 'get'
	);
};

exports.isAllowed = function (req, res, next) {
	var roles = (req.user) ? req.user.roles : ['guest'];
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


EOFP

