'use strict';
// =========================================================================
//
// Routes for complaints
//
// =========================================================================
var Complaint  = require ('../controllers/complaint.controller');
var routes = require ('../../../core/server/controllers/cc.routes.controller');
var policy = require ('../../../core/server/controllers/cc.policy.controller');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'complaint', Complaint, policy);
	//
	// for project
	//
	app.route ('/api/complaint/for/project/:projectid')
		.all (policy ('user'))
		.all (routes.setModel (Complaint))
		.get (routes.runModel (function (model, req) {
			return model.getForProject (req.params.projectid);
		}));
};

