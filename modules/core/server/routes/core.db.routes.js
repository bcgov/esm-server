'use strict';
// =========================================================================
//
// Routes for Access Control Management
//
// =========================================================================
// var policy     = require ('../policies/project.policy');
var controller = require ('../controllers/core.db.controller');
var helpers    = require ('../controllers/core.helpers.controller');
var policy    = require ('../policies/core.db.policy');


module.exports = function (app) {
	//project set up new stream
	app.route ('/api/db/modify').all (policy.isAllowed)

		// .all (true)
		.put (function (req, res) {
			// console.log (req);
			// helpers.sendErrorMessage (res, 'did this work?');
			// return;
			controller.put (req.accessResource, req.body, function (err) {
				if (err) helpers.sendError (res, err);
				else helpers.sendData (res, {message:'OK'});
			});
		});

};

