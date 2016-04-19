'use strict';
// =========================================================================
//
// Routes for Access Control Management
//
// =========================================================================
var controller = require ('../controllers/core.db.controller');
var helpers    = require ('../controllers/core.helpers.controller');
var policy     = require ('../policies/core/route/policy');


module.exports = function (app) {

	//
	// allow modifications
	//
	app.route ('/api/db/modify').all(policy.isAllowed)
		.post (controller.post)
		.put (controller.post)
		.delete (controller.post);



	//project set up new stream
	// app.route ('/api/access/setall/resource/:resourceId')
	// 	// .all (true)
	// 	.put (function (req, res) {
	// 		// console.log (req);
	// 		// helpers.sendErrorMessage (res, 'did this work?');
	// 		// return;
	// 		controller.setResourcePermissions (req.accessResource, req.body, function (err) {
	// 			if (err) helpers.sendError (res, err);
	// 			else helpers.sendData (res, {message:'OK'});
	// 		});
	// 	});
	// app.param ('resourceId', function (req, res, next, id) {
	// 	// console.log ('id = ',id);
	// 	req.accessResource = id;
	// 	next ();
	// });
};

