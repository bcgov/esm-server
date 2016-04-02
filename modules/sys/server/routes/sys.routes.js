'use strict';
// =========================================================================
//
// Routes for streams
//
// =========================================================================
var policy     = require ('../policies/sys.policy');
var controller = require ('../controllers/sys.controller');


module.exports = function (app) {
	//
	// short form to get all config objects, all phases down to requirements
	//
	app.route ('/api/sys/configs').all (policy.isAllowed).get  (controller.configs);
	//
	// some static things
	//
	app.route ('/api/sys/projecttypes').all (policy.isAllowed).get  (controller.projecttypes);

	// -------------------------------------------------------------------------
	//
	// TBD: bunch of testing junk here, please delete when all done
	//
	// -------------------------------------------------------------------------
	/*
	app.get ('/api/testp1/:param1', function (req, res) {
		// console.log ('req._param1 = ',req._param1);
	});
	app.get ('/api/testp2/:param2', function (req, res) {
		// console.log ('req._param2 = ',req._param2);
	});
	app.get ('/api/testp3/:param3', function (req, res) {
		// console.log ('req._param3 = ',req._param3);
	});
	app.get ('/api/testp123/:param1/:param2/:param3', function (req, res) {
		// console.log ('req._param1 = ',req._param1);
		// console.log ('req._param2 = ',req._param2);
		// console.log ('req._param3 = ',req._param3);
	});
	app.get ('/api/testp321/:param3/:param2/:param1', function (req, res) {
		// console.log ('req._param1 = ',req._param1);
		// console.log ('req._param2 = ',req._param2);
		// console.log ('req._param3 = ',req._param3);
	});


	app.param ('param1', function (req, res, next, id) {
		// console.log ('parameter 1 run with ',id);
		req._param1 = id;
		next ();
	});
	app.param ('param2', function (req, res, next, id) {
		// console.log ('parameter 2 run with ',id);
		req._param2 = id;
		next ();
	});
	app.param ('param3', function (req, res, next, id) {
		// console.log ('parameter 3 run with ',id);
		if (req._param1) {
			req._param3 = id + ' is a '+req._param1;
		} else {
			req._param3 = 'ALL '+id ;

		}
		next ();
	});
*/
};

