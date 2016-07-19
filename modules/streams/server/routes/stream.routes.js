'use strict';
// =========================================================================
//
// Routes for streams
//
// =========================================================================
var Stream     = require ('../controllers/stream.controller');
var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');


module.exports = function (app) {
	routes.setCRUDRoutes (app, 'stream', Stream, policy);
	//
	// add phase to stream (base)
	//
	app.route ('/api/stream/:stream/add/phase/:phasebase')
		.all (policy ('user'))
		.put (routes.setAndRun (Stream, function (model, req) {
			return model.addPhaseToStream (req.Stream, req.PhaseBase);
		}));
};

