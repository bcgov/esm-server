'use strict';
// =========================================================================
//
// Routes for conditions
//
// =========================================================================
var Condition  = require ('../controllers/condition.controller');
var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'condition', Condition, policy);
	//
	// set a project up from a stream
	//
	app.route ('/api/test/condition/route/:condition')
		.all (policy ('guest'))
		.get (routes.setAndRun (Condition, function (model, req) {
			return model.nothing (req.Condition);
		}));
};

