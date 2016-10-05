'use strict';
// =========================================================================
//
// Routes for topics
//
// =========================================================================
var Topic  = require ('../controllers/topic.controller');
var routes = require ('../../../core/server/controllers/core.routes.controller');
var policy = require ('../../../core/server/controllers/core.policy.controller');

module.exports = function (app) {
	routes.setCRUDRoutes (app, 'topic', Topic, policy);
	app.route ('/api/topics/for/pillar/:pillar').all (policy ('guest'))
		.get (routes.setAndRun (Topic, function (model, req) {
			return model.list ({pillar:req.params.pillar});
		}));
	app.route ('/api/topics/for/type/:type').all (policy ('guest'))
		.get (routes.setAndRun (Topic, function (model, req) {
			return model.list ({type:req.params.type});
		}));
};

