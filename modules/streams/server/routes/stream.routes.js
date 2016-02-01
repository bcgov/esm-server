'use strict';
// =========================================================================
//
// Routes for streams
//
// =========================================================================
var policy     = require ('../policies/stream.policy');
var Stream     = require ('../controllers/stream.controller');
var helpers    = require ('../../../core/server/controllers/core.helpers.controller');


module.exports = function (app) {
	helpers.setCRUDRoutes (app, 'stream', Stream, policy);
	//
	// add phase to stream (base)
	//
	app.route ('/api/stream/:stream/add/phase/:phasebase')
		.all (policy.isAllowed)
		.put (function (req, res) {
			var s = new Stream (req.user);
			s.addPhaseToStream (req.Stream, req.PhaseBase)
			.then (helpers.success(res), helpers.failure(res));
		});
};

