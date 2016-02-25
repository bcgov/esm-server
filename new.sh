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
mkdir modules/$PLURAL
mkdir modules/$PLURAL/server
mkdir modules/$PLURAL/server/controllers
mkdir modules/$PLURAL/server/policies
mkdir modules/$PLURAL/server/models
mkdir modules/$PLURAL/server/routes
mkdir modules/$PLURAL/client
mkdir modules/$PLURAL/client/services


cat > modules/$PLURAL/client/$NAME.client.module.js <<EOFMOD

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('${NAME}');

EOFMOD

cat > modules/$PLURAL/client/services/$NAME.model.service.js <<EOFCC

'use strict';
// =========================================================================
//
// this is the data model (service). This is how all data
// is accessed through the front end
//
// =========================================================================
angular.module('${NAME}').factory ('${MODEL}Model', function (ModelBase, _) {
	//
	// build the model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var Class = ModelBase.extend ({
		urlName : '${NAME}'
	});
	return new Class ();
});


EOFCC


cat > modules/$PLURAL/server/controllers/$NAME.controller.js <<EOFC
'use strict';
// =========================================================================
//
// Controller for $PLURAL
//
// =========================================================================
var path     = require('path');
var DBModel   = require (path.resolve('./modules/core/server/controllers/core.dbmodel.controller'));
var _         = require ('lodash');

module.exports = DBModel.extend ({
	name : '${MODEL}',
});

EOFC

cat > modules/$PLURAL/server/models/$NAME.model.js <<EOFM
'use strict';
// =========================================================================
//
// Model for $PLURAL
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('${MODEL}', {
	__audit        : true,
	__access       : true,
	__tracking     : true,
	__status       : ['Not Started', 'Not Required', 'In Progress', 'Complete'],
	__codename     : true,
	project        : { type:'ObjectId', ref:'Project', default:null, index:true}
});

EOFM

cat > modules/$PLURAL/server/routes/$NAME.routes.js <<EOFR
'use strict';
// =========================================================================
//
// Routes for $PLURAL
//
// =========================================================================
var policy  = require ('../policies/$NAME.policy');
var $MODEL  = require ('../controllers/$NAME.controller');
var helpers = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	helpers.setCRUDRoutes (app, '${NAME}', $MODEL, policy);
};

EOFR

cat > modules/$PLURAL/server/policies/$NAME.policy.js <<EOFP
'use strict';
// =========================================================================
//
// Policies for $PLURAL
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, '${NAME}');
};

exports.isAllowed = helpers.isAllowed (acl);


EOFP






#./link.sh
