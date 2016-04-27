'use strict';
// =========================================================================
//
// Routes for Access Control Management
//
// =========================================================================
var controller = require ('../controllers/core.db.controller');
var helpers    = require ('../controllers/core.helpers.controller');
var policy     = require ('../policies/core.db.policy');


module.exports = function (app) {

	//
	// allow modifications
	//
	app.route ('/api/db/modify').all(policy.isAllowed)
		.post (controller.post)
		.put (controller.put)
		.delete (controller.delete);
};

