'use strict';
// =========================================================================
//
// Routes for conditions
//
// =========================================================================
var Condition  = require ('../controllers/condition.controller');
var routes = require ('../../../core/server/controllers/cc.routes.controller');
var policy = require ('../../../core/server/controllers/cc.policy.controller');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'condition', Condition, policy);
	//
	// set a project up from a stream
	//
	app.route ('/api/test/condition/route/:condition')
		.all (policy ('guest'))
		.all (routes.setModel (Condition))
		.get (routes.runModel (function (model, req) {
			return model.nothing (req.Condition);
		}));
};

